/**
 * Localized Zod error map.
 *
 * Produces validation messages in the user's current language for any schema
 * that doesn't supply its own message — so an un-selected dropdown, an empty
 * required field, a too-short string, etc. all read clearly in ar/en instead
 * of falling back to Zod's English defaults.
 *
 * Wired into Zod's global config by ZodI18nSetup (runs per-locale).
 */

type Translator = (key: string, values?: Record<string, string | number>) => string;

// Minimal shape of a Zod v4 issue — enough to localize the common cases
// without depending on Zod's internal types.
interface ZodIssueLike {
  code?: string;
  origin?: string;
  minimum?: number | bigint;
  maximum?: number | bigint;
  format?: string;
}

export function createZodErrorMap(t: Translator) {
  return (issue: ZodIssueLike): string | undefined => {
    switch (issue.code) {
      // Missing value or wrong type — e.g. an unselected enum/dropdown,
      // or a required field left empty.
      case 'invalid_type':
        return t('required');

      // Enum / literal value not among the allowed options.
      case 'invalid_value':
        return t('selectOption');

      case 'too_small': {
        const min = Number(issue.minimum ?? 0);
        if (issue.origin === 'string' || issue.origin === 'array' || issue.origin === 'set') {
          return min <= 1 ? t('required') : t('minChars', { count: min });
        }
        // numeric fields
        return min <= 0 ? t('mustBePositive') : t('minValue', { count: min });
      }

      case 'too_big': {
        const max = Number(issue.maximum ?? 0);
        if (issue.origin === 'string' || issue.origin === 'array' || issue.origin === 'set') {
          return t('maxChars', { count: max });
        }
        return t('maxValue', { count: max });
      }

      case 'invalid_format':
        return issue.format === 'email' ? t('invalidEmail') : t('invalidFormat');

      // Anything else (custom refinements, unions, …) keeps its own message.
      default:
        return undefined;
    }
  };
}
