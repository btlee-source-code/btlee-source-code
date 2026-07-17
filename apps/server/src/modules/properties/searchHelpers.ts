/**
 * Smart search helpers for the property list endpoint.
 *
 * Maps natural-language Arabic/English terms (شقة, فيلا, للبيع, مفروش, ...)
 * to the enum values stored in MongoDB, and builds a multi-field regex
 * search that catches partial matches across description, area, governorate,
 * type, listingType, category and finishing.
 */
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  FINISHING_TYPES,
  type PropertyType,
  type ListingType,
  type PropertyCategory,
  type FinishingType,
} from '../../config/constants.js';
import { LOCATION_GROUPS } from './locationSynonyms.js';

/** Strip Arabic diacritics and normalize ا/أ/إ/آ → ا, ى → ي, ة → ه. */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ً-ٰٟ]/g, '') // diacritics
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Escape a string for safe use inside a RegExp. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a regex pattern that matches Arabic text liberally:
 *   ا ↔ أ ↔ إ ↔ آ
 *   ة ↔ ه
 *   ى ↔ ي
 *   diacritics are ignored in both needle and haystack
 *
 * Strips diacritics from the input, then walks character-by-character
 * substituting each Arabic letter with the equivalent character class.
 */
export function arabicTolerantPattern(input: string): string {
  const stripped = input.replace(/[ً-ٰٟ]/g, ''); // drop diacritics
  const parts: string[] = [];

  for (const ch of stripped) {
    if ('اأإآ'.includes(ch)) {
      parts.push('[اأإآ]');
    } else if ('ةه'.includes(ch)) {
      parts.push('[ةه]');
    } else if ('ىي'.includes(ch)) {
      parts.push('[ىي]');
    } else if (/[.*+?^${}()|[\]\\]/.test(ch)) {
      parts.push('\\' + ch);
    } else {
      parts.push(ch);
    }
  }

  // Allow optional Arabic diacritics between letters in the haystack.
  // PCRE2 (MongoDB) doesn't support \u escapes, so embed the literal
  // diacritic characters (U+064B–U+0652 + U+0670 superscript alef).
  const diacritics = '[ًٌٍَُِّْٰ]*';
  return parts.join(diacritics);
}

/**
 * Mapping of free-text terms (Arabic + English) to enum values.
 * Each enum value can be matched by any of its synonyms.
 */
const TYPE_SYNONYMS: Record<PropertyType, string[]> = {
  apartment: ['شقه', 'شقق', 'apartment', 'apartments', 'flat', 'flats'],
  villa: ['فيلا', 'فلل', 'فيلات', 'villa', 'villas'],
  chalet: ['شاليه', 'شاليهات', 'chalet', 'chalets'],
  shop: ['محل', 'محلات', 'shop', 'shops', 'store'],
  building: ['مبني', 'مباني', 'عماره', 'عمارات', 'building', 'buildings'],
  factory: ['مصنع', 'مصانع', 'factory', 'factories'],
  land: ['ارض', 'اراضي', 'قطعه', 'قطعة ارض', 'land', 'plot', 'lands'],
};

const LISTING_SYNONYMS: Record<ListingType, string[]> = {
  sale: ['للبيع', 'بيع', 'sale', 'sell', 'buying', 'buy'],
  rent: ['للايجار', 'ايجار', 'rent', 'renting', 'lease'],
};

const CATEGORY_SYNONYMS: Record<PropertyCategory, string[]> = {
  residential: ['سكني', 'سكنيه', 'residential'],
  commercial: ['تجاري', 'تجاريه', 'commercial'],
};

const FINISHING_SYNONYMS: Record<FinishingType, string[]> = {
  furnished: ['مفروش', 'مفروشه', 'furnished'],
  unfurnished: ['غير مفروش', 'بدون فرش', 'unfurnished'],
  'semi-finished': ['نص تشطيب', 'نصف تشطيب', 'semi finished', 'semi-finished'],
};

interface ResolvedTerms {
  /** Enum values implied by the search text. */
  types: PropertyType[];
  listingTypes: ListingType[];
  categories: PropertyCategory[];
  finishings: FinishingType[];
  /** Numeric values mentioned in the query — used for price / area / rooms. */
  numbers: number[];
  /** Whatever the user typed minus the recognized synonyms — used for regex. */
  freeText: string;
}

/**
 * Parse a free-text search string into structured filters.
 * Anything not recognized as a synonym is kept as freeText for fuzzy regex.
 */
export function resolveSearchTerms(rawSearch: string): ResolvedTerms {
  const normalized = normalizeArabic(rawSearch);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const types = new Set<PropertyType>();
  const listingTypes = new Set<ListingType>();
  const categories = new Set<PropertyCategory>();
  const finishings = new Set<FinishingType>();
  const numbers: number[] = [];
  const leftover: string[] = [];

  // Walk tokens left-to-right; some synonyms are multi-word (غير مفروش)
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const twoWord = i + 1 < tokens.length ? `${tok} ${tokens[i + 1]}` : '';

    // Number? — store and skip
    const num = parseFloat(tok.replace(/,/g, ''));
    if (!Number.isNaN(num) && /^\d/.test(tok)) {
      numbers.push(num);
      continue;
    }

    let matched = false;

    // Try two-word match first
    if (twoWord) {
      if (FINISHING_SYNONYMS.unfurnished.some((s) => normalizeArabic(s) === twoWord)) {
        finishings.add('unfurnished');
        i++;
        matched = true;
      } else if (FINISHING_SYNONYMS['semi-finished'].some((s) => normalizeArabic(s) === twoWord)) {
        finishings.add('semi-finished');
        i++;
        matched = true;
      }
    }
    if (matched) continue;

    for (const [key, syns] of Object.entries(TYPE_SYNONYMS)) {
      if (syns.some((s) => normalizeArabic(s) === tok)) {
        types.add(key as PropertyType);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const [key, syns] of Object.entries(LISTING_SYNONYMS)) {
      if (syns.some((s) => normalizeArabic(s) === tok)) {
        listingTypes.add(key as ListingType);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const [key, syns] of Object.entries(CATEGORY_SYNONYMS)) {
      if (syns.some((s) => normalizeArabic(s) === tok)) {
        categories.add(key as PropertyCategory);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const [key, syns] of Object.entries(FINISHING_SYNONYMS)) {
      if (syns.some((s) => normalizeArabic(s) === tok)) {
        finishings.add(key as FinishingType);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Unrecognized — keep for fuzzy text match
    if (tok.length >= 2) leftover.push(tok);
  }

  return {
    types: [...types],
    listingTypes: [...listingTypes],
    categories: [...categories],
    finishings: [...finishings],
    numbers,
    freeText: leftover.join(' ').trim(),
  };
}

/**
 * Find every bilingual location group whose name appears in the query.
 * Single-word terms match a whole token; multi-word terms match as a phrase.
 */
function findLocationGroups(normalizedQuery: string, tokens: string[]): string[][] {
  const tokenSet = new Set(tokens);
  const matched: string[][] = [];
  for (const group of LOCATION_GROUPS) {
    const hit = group.some((term) => {
      const nt = normalizeArabic(term);
      return nt.includes(' ') ? normalizedQuery.includes(nt) : tokenSet.has(nt);
    });
    if (hit) matched.push(group);
  }
  return matched;
}

/** Words belonging to a matched location group — excluded from the strict token AND. */
function locationWords(groups: string[][]): Set<string> {
  const words = new Set<string>();
  for (const group of groups) {
    for (const term of group) {
      for (const w of normalizeArabic(term).split(/\s+/)) words.add(w);
    }
  }
  return words;
}

/**
 * Build a MongoDB clause that fuzzy-matches the search text against
 * description, area_name and governorate. Case + diacritic insensitive via the
 * `i` flag and Arabic normalization. Recognised place names are expanded to
 * their other-language equivalents so "Maadi" and "المعادي" return the same
 * listings (see locationSynonyms.ts).
 */
export function buildTextSearchClause(freeText: string): Record<string, unknown> | null {
  if (!freeText) return null;
  const normalized = normalizeArabic(freeText);
  const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return null;

  const fieldsMatch = (pattern: string) => ({
    $or: [
      { description: { $regex: pattern, $options: 'i' } },
      { area_name: { $regex: pattern, $options: 'i' } },
      { governorate: { $regex: pattern, $options: 'i' } },
    ],
  });

  const clauses: Record<string, unknown>[] = [];

  // 1) Location terms → match ANY language variant of each detected place.
  const groups = findLocationGroups(normalized, tokens);
  for (const group of groups) {
    const combined = group.map((variant) => arabicTolerantPattern(variant)).join('|');
    clauses.push(fieldsMatch(combined));
  }

  // 2) Remaining words → each must still match somewhere (AND).
  const consumed = locationWords(groups);
  for (const tok of tokens) {
    if (consumed.has(tok)) continue;
    clauses.push(fieldsMatch(arabicTolerantPattern(tok)));
  }

  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

/**
 * Expand a raw query into regex patterns covering the original text plus any
 * bilingual location equivalents. Used by the autocomplete suggestions so
 * typing "Maadi" surfaces "المعادي" areas (and vice versa).
 */
export function expandToPatterns(rawQuery: string): string[] {
  const normalized = normalizeArabic(rawQuery);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const variants = new Set<string>([rawQuery.trim()]);
  for (const group of findLocationGroups(normalized, tokens)) {
    for (const v of group) variants.add(v);
  }
  return [...variants].map((v) => arabicTolerantPattern(v));
}

export const ARABIC_TYPE_SYNONYMS = TYPE_SYNONYMS;
export const ARABIC_LISTING_SYNONYMS = LISTING_SYNONYMS;
export const ARABIC_CATEGORY_SYNONYMS = CATEGORY_SYNONYMS;
export const ARABIC_FINISHING_SYNONYMS = FINISHING_SYNONYMS;
export {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  FINISHING_TYPES,
};
