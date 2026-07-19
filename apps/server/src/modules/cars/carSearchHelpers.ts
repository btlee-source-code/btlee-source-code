/**
 * Bilingual (Arabic/English) search helpers for the cars list endpoint.
 *
 * Car make/model are stored as free text (usually English, e.g. "Toyota
 * Corolla"). Users search in either language ("تويوتا كورولا" / "toyota
 * corolla"), so we map both-language synonyms to a regex that matches the stored
 * value, and map body/fuel/transmission/condition/listing words to their enum
 * values — the same idea as the property domain's searchHelpers.
 */
import {
  CAR_LISTING_TYPES,
  CAR_CONDITIONS,
  CAR_TRANSMISSIONS,
  CAR_FUEL_TYPES,
  CAR_BODY_TYPES,
  type CarListingType,
  type CarCondition,
  type CarTransmission,
  type CarFuelType,
  type CarBodyType,
} from '../../config/constants.js';

/** Strip Arabic diacritics and normalize ا/أ/إ/آ → ا, ى → ي, ة → ه, lowercase. */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Regex pattern that matches Arabic text liberally (ا↔أ↔إ↔آ, ة↔ه, ى↔ي). */
export function arabicTolerantPattern(input: string): string {
  const stripped = input.replace(/[ً-ٰٟ]/g, '');
  const parts: string[] = [];
  for (const ch of stripped) {
    if ('اأإآ'.includes(ch)) parts.push('[اأإآ]');
    else if ('ةه'.includes(ch)) parts.push('[ةه]');
    else if ('ىي'.includes(ch)) parts.push('[ىي]');
    else if (/[.*+?^${}()|[\]\\]/.test(ch)) parts.push('\\' + ch);
    else parts.push(ch);
  }
  const diacritics = '[ًٌٍَُِّْٰ]*';
  return parts.join(diacritics);
}

// ── Bilingual synonym maps ──
// The FIRST array entry per key is not special; every variant maps to the key.

const BASE_MAKE_SYNONYMS: Record<string, string[]> = {
  Toyota: ['تويوتا', 'toyota'],
  Hyundai: ['هيونداي', 'هيوندا', 'hyundai'],
  Kia: ['كيا', 'kia'],
  Nissan: ['نيسان', 'nissan'],
  Chevrolet: ['شيفروليه', 'شيفروليت', 'chevrolet', 'chevy'],
  'Mercedes-Benz': ['مرسيدس', 'مرسيدس بنز', 'mercedes', 'benz', 'mercedes-benz', 'mercedes benz'],
  BMW: ['بي ام دبليو', 'بمو', 'bmw'],
  Volkswagen: ['فولكس فاجن', 'فولكس', 'volkswagen', 'vw'],
  Renault: ['رينو', 'renault'],
  Peugeot: ['بيجو', 'peugeot'],
  Fiat: ['فيات', 'fiat'],
  Skoda: ['سكودا', 'skoda'],
  Mitsubishi: ['ميتسوبيشي', 'متسوبيشي', 'mitsubishi'],
  Honda: ['هوندا', 'honda'],
  Ford: ['فورد', 'ford'],
  Opel: ['اوبل', 'opel'],
  MG: ['ام جي', 'mg'],
  Chery: ['شيري', 'chery'],
  Suzuki: ['سوزوكي', 'suzuki'],
  Jeep: ['جيب', 'jeep'],
  Audi: ['اودي', 'audi'],
  Seat: ['سيات', 'seat'],
  'Citroën': ['ستروين', 'سيتروين', 'citroen', 'citroën'],
};

/**
 * Keep this list aligned with packages/shared/src/constants/car.ts.
 * The base map preserves the richer legacy aliases while the additions make
 * every make exposed by the mobile picker searchable in Arabic and English.
 */
const MAKE_SYNONYMS: Record<string, string[]> = {
  ...BASE_MAKE_SYNONYMS,
  Abarth: ['أبارث', 'ابارث', 'abarth'],
  'Alfa Romeo': ['ألفا روميو', 'الفا روميو', 'alfa romeo'],
  BAIC: ['بايك', 'بيك', 'baic'],
  Bentley: ['بنتلي', 'bentley'],
  Bestune: ['بيستون', 'bestune'],
  Brilliance: ['بريليانس', 'brilliance'],
  BYD: ['بي واي دي', 'بي واى دي', 'byd'],
  Cadillac: ['كاديلاك', 'cadillac'],
  Changan: ['شانجان', 'changan'],
  Cupra: ['كوبرا', 'cupra'],
  Daewoo: ['دايو', 'daewoo'],
  Daihatsu: ['دايهاتسو', 'daihatsu'],
  DFSK: ['دي اف اس كيه', 'دي إف إس كيه', 'dfsk'],
  Dodge: ['دودج', 'dodge'],
  Dongfeng: ['دونج فينج', 'دونغ فينغ', 'dongfeng'],
  Exeed: ['إكسيد', 'اكسيد', 'exeed'],
  Foton: ['فوتون', 'foton'],
  GAC: ['جي ايه سي', 'جي إيه سي', 'gac'],
  Geely: ['جيلي', 'geely'],
  'Great Wall': ['جريت وول', 'great wall'],
  Haval: ['هافال', 'haval'],
  Hongqi: ['هونشي', 'hongqi'],
  Infiniti: ['إنفينيتي', 'انفينيتي', 'infiniti'],
  Isuzu: ['إيسوزو', 'ايسوزو', 'isuzu'],
  JAC: ['جاك', 'jac'],
  Jaguar: ['جاكوار', 'jaguar'],
  Jetour: ['جيتور', 'jetour'],
  Kaiyi: ['كايي', 'kaiyi'],
  KGM: ['كي جي إم', 'كي جي ام', 'kgm'],
  Lada: ['لادا', 'lada'],
  'Land Rover': ['لاند روفر', 'رينج روفر', 'land rover', 'range rover'],
  Lexus: ['لكزس', 'lexus'],
  Mazda: ['مازدا', 'mazda'],
  MINI: ['ميني', 'mini'],
  Porsche: ['بورشه', 'porsche'],
  Proton: ['بروتون', 'proton'],
  SEAT: ['سيات', 'seat'],
  Soueast: ['سوإيست', 'سوايست', 'soueast'],
  Subaru: ['سوبارو', 'subaru'],
  Tesla: ['تسلا', 'tesla'],
  Volvo: ['فولفو', 'volvo'],
  Zeekr: ['زيكر', 'zeekr'],
};

const MODEL_SYNONYMS: Record<string, string[]> = {
  Corolla: ['كورولا', 'corolla'],
  Fortuner: ['فورتشنر', 'fortuner'],
  Elantra: ['النترا', 'إلنترا', 'elantra'],
  Tucson: ['توسان', 'tucson'],
  Sportage: ['سبورتاج', 'sportage'],
  Cerato: ['سيراتو', 'cerato'],
  Sunny: ['صني', 'sunny'],
  Qashqai: ['قشقاي', 'qashqai'],
  Optra: ['اوبترا', 'optra'],
  Golf: ['جولف', 'golf'],
  Duster: ['داستر', 'duster'],
  Tipo: ['تيبو', 'tipo'],
  Civic: ['سيفيك', 'civic'],
  Wrangler: ['رانجلر', 'wrangler'],
};

const LISTING_SYNONYMS: Record<CarListingType, string[]> = {
  sale: ['للبيع', 'بيع', 'sale', 'sell', 'buy'],
  rent: ['للايجار', 'ايجار', 'rent', 'lease', 'renting'],
};

const CONDITION_SYNONYMS: Record<CarCondition, string[]> = {
  new: ['جديد', 'جديده', 'زيرو', 'new'],
  used: ['مستعمل', 'مستعمله', 'used'],
};

const TRANSMISSION_SYNONYMS: Record<CarTransmission, string[]> = {
  automatic: ['اوتوماتيك', 'اتوماتيك', 'automatic', 'auto'],
  manual: ['مانيوال', 'عادي', 'manual'],
};

const FUEL_SYNONYMS: Record<CarFuelType, string[]> = {
  petrol: ['بنزين', 'petrol', 'gasoline'],
  diesel: ['ديزل', 'سولار', 'diesel'],
  hybrid: ['هايبرد', 'هجين', 'hybrid'],
  electric: ['كهربا', 'كهربائي', 'electric'],
  natural_gas: ['غاز طبيعي', 'غاز', 'natural gas', 'cng'],
};

const BODY_SYNONYMS: Record<CarBodyType, string[]> = {
  sedan: ['سيدان', 'sedan', 'saloon'],
  suv: ['دفع رباعي', 'اس يو في', 'suv'],
  hatchback: ['هاتشباك', 'hatchback'],
  coupe: ['كوبيه', 'coupe'],
  pickup: ['بيك اب', 'pickup', 'pick up'],
  minivan: ['ميني فان', 'فان', 'minivan'],
  crossover: ['كروس اوفر', 'crossover'],
};

export interface ResolvedCarTerms {
  listingTypes: CarListingType[];
  conditions: CarCondition[];
  transmissions: CarTransmission[];
  fuelTypes: CarFuelType[];
  bodyTypes: CarBodyType[];
  /** Regex variants (arabic-tolerant) for each detected make/model group. */
  identityPatterns: string[][];
  /** Leftover words not recognized — used for a fuzzy make/model/description match. */
  freeText: string;
}

function matchEnum<K extends string>(
  token: string,
  twoWord: string,
  map: Record<K, string[]>
): K | null {
  for (const key of Object.keys(map) as K[]) {
    for (const syn of map[key]) {
      const ns = normalizeArabic(syn);
      if (ns === token || (ns.includes(' ') && ns === twoWord)) return key;
    }
  }
  return null;
}

/** Parse a free-text car query into enum filters + identity (make/model) patterns. */
export function resolveCarSearch(rawSearch: string): ResolvedCarTerms {
  const normalized = normalizeArabic(rawSearch);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const listingTypes = new Set<CarListingType>();
  const conditions = new Set<CarCondition>();
  const transmissions = new Set<CarTransmission>();
  const fuelTypes = new Set<CarFuelType>();
  const bodyTypes = new Set<CarBodyType>();
  const identityPatterns: string[][] = [];
  const leftover: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const twoWord = i + 1 < tokens.length ? `${tok} ${tokens[i + 1]}` : '';

    // make/model → collect ALL bilingual variants for a broad regex match.
    const identity = matchIdentityGroup(tok, twoWord);
    if (identity) {
      identityPatterns.push(identity.variants.map((v) => arabicTolerantPattern(v)));
      if (identity.consumedTwoWords) i++;
      continue;
    }

    const lt = matchEnum(tok, twoWord, LISTING_SYNONYMS);
    if (lt) { listingTypes.add(lt); continue; }
    const cond = matchEnum(tok, twoWord, CONDITION_SYNONYMS);
    if (cond) { conditions.add(cond); continue; }
    const trans = matchEnum(tok, twoWord, TRANSMISSION_SYNONYMS);
    if (trans) { transmissions.add(trans); continue; }

    // fuel/body may be two-word (غاز طبيعي / دفع رباعي) — consume the extra token.
    const fuel = matchEnum(tok, twoWord, FUEL_SYNONYMS);
    if (fuel) {
      if (FUEL_SYNONYMS[fuel].some((s) => normalizeArabic(s) === twoWord)) i++;
      fuelTypes.add(fuel);
      continue;
    }
    const body = matchEnum(tok, twoWord, BODY_SYNONYMS);
    if (body) {
      if (BODY_SYNONYMS[body].some((s) => normalizeArabic(s) === twoWord)) i++;
      bodyTypes.add(body);
      continue;
    }

    if (tok.length >= 2) leftover.push(tok);
  }

  return {
    listingTypes: [...listingTypes],
    conditions: [...conditions],
    transmissions: [...transmissions],
    fuelTypes: [...fuelTypes],
    bodyTypes: [...bodyTypes],
    identityPatterns,
    freeText: leftover.join(' ').trim(),
  };
}

/** Detect a make/model synonym group starting at a token; returns all variants. */
function matchIdentityGroup(
  token: string,
  twoWord: string
): { variants: string[]; consumedTwoWords: boolean } | null {
  for (const map of [MAKE_SYNONYMS, MODEL_SYNONYMS]) {
    for (const key of Object.keys(map)) {
      const variants = map[key];
      for (const syn of variants) {
        const ns = normalizeArabic(syn);
        if (ns.includes(' ') && ns === twoWord) {
          return { variants: [key, ...variants], consumedTwoWords: true };
        }
        if (ns === token) {
          return { variants: [key, ...variants], consumedTwoWords: false };
        }
      }
    }
  }
  return null;
}

/**
 * Build a Mongo clause matching the query against make / model / description,
 * expanding recognized makes/models to all their language variants so "تويوتا"
 * and "toyota" return the same cars.
 */
export function buildCarTextClause(resolved: ResolvedCarTerms): Record<string, unknown> | null {
  const clauses: Record<string, unknown>[] = [];

  const fieldsMatch = (pattern: string) => ({
    $or: [
      { make: { $regex: pattern, $options: 'i' } },
      { model: { $regex: pattern, $options: 'i' } },
      { description: { $regex: pattern, $options: 'i' } },
    ],
  });

  // Each detected make/model → match ANY of its language variants.
  for (const variants of resolved.identityPatterns) {
    clauses.push(fieldsMatch(variants.join('|')));
  }

  // Leftover words → each must still match somewhere (AND).
  const words = resolved.freeText.split(/\s+/).filter((t) => t.length >= 2);
  for (const w of words) {
    clauses.push(fieldsMatch(arabicTolerantPattern(w)));
  }

  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

export { CAR_LISTING_TYPES, CAR_CONDITIONS, CAR_TRANSMISSIONS, CAR_FUEL_TYPES, CAR_BODY_TYPES };
