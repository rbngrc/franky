export type PlateFormat = 'moderna' | 'antigua' | 'remolque';

export type ParsedPlate = {
  raw: string;
  rawCleaned: string;
  normalized: string;
  formatted: string;
  format: PlateFormat;
  confidence: number;
};

export const cleanPlateText = (text: string): string =>
  text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const PATTERNS: { format: PlateFormat; regex: RegExp }[] = [
  { format: 'remolque', regex: /\bR[ -]?(\d{4})[ -]?([A-Z]{3})\b/ },
  { format: 'moderna', regex: /\b(\d{4})\s*([A-Z]{3})\b/ },
  { format: 'antigua', regex: /\b([A-Z]{2})[ -]?(\d{4})[ -]?([A-Z]{2})\b/ },
];

const DIGIT_CLASS = '[0-9OIB]';
const LETTER_CLASS = '[A-Z0-9IB]';

const TOLERANT_PATTERNS: { format: PlateFormat; regex: RegExp }[] = [
  { format: 'remolque', regex: new RegExp(`\\bR[ -]?(${DIGIT_CLASS}{4})[ -]?(${LETTER_CLASS}{3})\\b`) },
  { format: 'moderna', regex: new RegExp(`\\b(${DIGIT_CLASS}{4})\\s*(${LETTER_CLASS}{3})\\b`) },
  { format: 'antigua', regex: new RegExp(`\\b(${LETTER_CLASS}{2})[ -]?(${DIGIT_CLASS}{4})[ -]?(${LETTER_CLASS}{2})\\b`) },
];

const TO_DIGIT: Record<string, string> = { O: '0', I: '1', S: '5', B: '8' };
const TO_LETTER: Record<string, string> = { '0': 'O', '1': 'I', '5': 'S', '8': 'B' };

const mapConfusables = (group: string, toDigits: boolean): string => {
  const mapping = toDigits ? TO_DIGIT : TO_LETTER;
  return group
    .split('')
    .map((char) => mapping[char] ?? char)
    .join('');
};

const buildPlate = (format: PlateFormat, groups: string[]): ParsedPlate => {
  let formatted: string;
  switch (format) {
    case 'moderna':
      formatted = `${groups[0]} ${groups[1]}`;
      break;
    case 'remolque':
      formatted = `R-${groups[0]}-${groups[1]}`;
      break;
    default:
      formatted = `${groups[0]}-${groups[1]}-${groups[2]}`;
  }
  return {
    raw: '',
    rawCleaned: '',
    normalized: formatted.replace(/[ -]/g, ''),
    formatted,
    format,
    confidence: 1,
  };
};

export const formatPlate = (normalized: string): string | null => {
  const cleaned = normalized.replace(/[ -]/g, '');
  for (const { format, regex } of PATTERNS) {
    const match = regex.exec(cleaned);
    if (match) {
      const groups = match.slice(1);
      return buildPlate(format, groups).formatted;
    }
  }
  return null;
};

export const isSpanishPlate = (normalized: string): boolean => {
  const cleaned = normalized.replace(/[ -]/g, '');
  return PATTERNS.some(({ regex }) => regex.test(cleaned));
};

export const parsePlate = (rawText: string): ParsedPlate | null => {
  const rawCleaned = cleanPlateText(rawText);

  for (const { format, regex } of PATTERNS) {
    const match = regex.exec(rawCleaned);
    if (!match) continue;
    const groups = match.slice(1);
    const parsed = buildPlate(format, groups);
    return { ...parsed, raw: rawText, rawCleaned, confidence: 1 };
  }

  for (const { format, regex } of TOLERANT_PATTERNS) {
    const match = regex.exec(rawCleaned);
    if (!match) continue;
    const groups = match.slice(1);
    const normalizedGroups =
      format === 'moderna' || format === 'remolque'
        ? [mapConfusables(groups[0], true), mapConfusables(groups[1], false)]
        : [mapConfusables(groups[0], false), mapConfusables(groups[1], true), mapConfusables(groups[2], false)];
    const parsed = buildPlate(format, normalizedGroups);
    if (!isSpanishPlate(parsed.normalized)) continue;
    return { ...parsed, raw: rawText, rawCleaned, confidence: 0.75 };
  }

  return null;
};