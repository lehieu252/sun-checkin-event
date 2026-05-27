/**
 * Normalized banned terms (lowercase, no diacritics). Keep EN + VI slurs and vulgar words.
 * Add new entries in normalized ASCII form (đ → d, etc.).
 */
export const PROFANITY_TERMS = [
  // English
  'fuck',
  'fucker',
  'fucking',
  'fucked',
  'motherfucker',
  'shit',
  'shitty',
  'bullshit',
  'bitch',
  'bastard',
  'asshole',
  'cunt',
  'dickhead',
  'dick',
  'pussy',
  'whore',
  'slut',
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  // Vietnamese / internet slang (normalized)
  'ditme',
  'ditmemay',
  'dit cu',
  'ditcu',
  'ditconme',
  'dit con me',
  'dmm',
  'dcm',
  'dcmm',
  'ccmm',
  'cmm',
  'cmn',
  'clgt',
  'clmm',
  'vcl',
  'vkl',
  'vcc',
  'cailon',
  'cai lon',
  'cailonma',
  'cai lon ma',
  'cailonmemay',
  'lon',
  'loz',
  'lozz',
  'cacc',
  'cac',
  'buom',
  'dau buoi',
  'daubuoi',
  'caidaumoi',
  'cai dau moi',
  'deome',
  'deo me',
  'deomay',
  'deo may',
  'duma',
  'du ma',
  'du me',
  'dume',
  'sucvat',
  'suc vat',
  'thangcho',
  'thang cho',
  'condi',
  'con di',
  'condicho',
  'con di cho',
  'danghoachinh',
  'dang hoai chinh',
  'matday',
  'mat day',
] as const;

export const PROFANITY_ERROR_CODE = 'profanity_detected';

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compactContainsIsolated(
  compactText: string,
  compactTerm: string,
): boolean {
  if (compactTerm.length < 4) return false;

  let index = 0;
  while (index <= compactText.length - compactTerm.length) {
    const foundAt = compactText.indexOf(compactTerm, index);
    if (foundAt === -1) return false;

    const before = foundAt === 0 ? '' : compactText[foundAt - 1];
    const after = compactText[foundAt + compactTerm.length] ?? '';
    const startsAtBoundary = !before || !/[a-z0-9]/.test(before);
    const endsAtBoundary = !after || !/[a-z0-9]/.test(after);

    if (startsAtBoundary && endsAtBoundary) {
      return true;
    }

    index = foundAt + 1;
  }

  return false;
}

function containsTerm(text: string, term: string): boolean {
  const normalizedText = normalizeForMatch(text);
  const normalizedTerm = normalizeForMatch(term).replace(/[^a-z0-9\s]/g, '');
  if (!normalizedTerm) return false;

  const compactText = normalizedText.replace(/[^a-z0-9]/g, '');
  const compactTerm = normalizedTerm.replace(/[^a-z0-9]/g, '');

  const boundaryPattern = new RegExp(
    `(?:^|[^a-z0-9])${escapeRegex(compactTerm)}(?:[^a-z0-9]|$)`,
    'i',
  );
  if (boundaryPattern.test(normalizedText.replace(/[^a-z0-9\s]/g, ' '))) {
    return true;
  }

  if (compactContainsIsolated(compactText, compactTerm)) {
    return true;
  }

  if (compactTerm.length <= 3) {
    const tokens = normalizedText.split(/[^a-z0-9]+/).filter(Boolean);
    return tokens.some((token) => token === compactTerm);
  }

  return false;
}

export function containsProfanity(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  return PROFANITY_TERMS.some((term) => containsTerm(trimmed, term));
}

export function containsProfanityInFields(
  fields: Record<string, string>,
): boolean {
  return Object.values(fields).some((value) => containsProfanity(value));
}
