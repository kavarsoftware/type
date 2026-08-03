/**
 * Arabic Unicode Phonetic Keyboard Transliteration
 *
 * Standard mapping used by Arabic Unicode IMEs and transliteration standards.
 * Phonetic correspondence between Latin and Arabic letters:
 *   k → ك  (Kaf)        b → ب  (Ba)
 *   n → ن  (Noon)       m → م  (Meem)
 *   s → س  (Seen)       d → د  (Dal)
 *   r → ر  (Ra)         z → ز  (Zain)
 */

// Primary mapping: Latin key → Arabic character (no shift)
export const ARABIC_PHONETIC_MAP: Record<string, string> = {
  q: 'ق', w: 'و', e: 'ع', r: 'ر', t: 'ت',
  y: 'ي', u: 'ئ', i: 'ي', o: 'أ', p: 'ف',
  a: 'ا', s: 'س', d: 'د', f: 'ف', g: 'غ',
  h: 'ه', j: 'ج', k: 'ك', l: 'ل',
  z: 'ز', x: 'خ', c: 'ح', v: 'ط', b: 'ب', n: 'ن', m: 'م',
};

// Shift mapping: shifted Latin key → Arabic character
export const ARABIC_PHONETIC_SHIFT_MAP: Record<string, string> = {
  Q: 'ق', W: 'و', E: 'ى', R: 'ة', T: 'ث',
  Y: 'ي', U: 'ؤ', I: 'إ', O: 'آ', P: 'ف',
  A: 'آ', S: 'ش', D: 'ذ', F: 'ف', G: 'غ',
  H: 'ح', J: 'ض', K: 'ك', L: 'لا',
  Z: 'ظ', X: 'خ', C: 'ص', V: 'ظ', B: 'ب', N: 'ن', M: 'م',
};

// Reverse lookup: Arabic character → Latin key (for keyboard highlighting)
export const ARABIC_REVERSE_MAP: Record<string, string> = {};
export const ARABIC_SHIFT_REVERSE_MAP: Record<string, string> = {};

for (const [key, arabic] of Object.entries(ARABIC_PHONETIC_MAP)) {
  if (!ARABIC_REVERSE_MAP[arabic]) ARABIC_REVERSE_MAP[arabic] = key;
}
for (const [key, arabic] of Object.entries(ARABIC_PHONETIC_SHIFT_MAP)) {
  if (!ARABIC_SHIFT_REVERSE_MAP[arabic]) ARABIC_SHIFT_REVERSE_MAP[arabic] = key;
}

export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/** Maps a pressed Latin key to the corresponding Arabic character. */
export function mapKeyToArabic(key: string): string {
  if (ARABIC_PHONETIC_SHIFT_MAP[key]) return ARABIC_PHONETIC_SHIFT_MAP[key];
  const lower = key.toLowerCase();
  return ARABIC_PHONETIC_MAP[lower] || key;
}

/** Returns the Latin key that produces the given Arabic character. */
export function getKeyForArabic(arabic: string): { key: string; isShift: boolean } | null {
  if (ARABIC_REVERSE_MAP[arabic]) return { key: ARABIC_REVERSE_MAP[arabic], isShift: false };
  if (ARABIC_SHIFT_REVERSE_MAP[arabic]) return { key: ARABIC_SHIFT_REVERSE_MAP[arabic].toLowerCase(), isShift: true };
  return null;
}
