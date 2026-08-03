'use client';

import { useTypingStore } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import {
  ARABIC_PHONETIC_MAP,
  ARABIC_PHONETIC_SHIFT_MAP,
  getKeyForArabic,
  isArabicText,
} from '@/lib/typing/arabicTransliteration';

// Standard QWERTY rows (Latin keys)
const qwertyRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const englishShiftChars: Record<string, string> = {
  '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
  '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
  '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
};

const englishHomeRowKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
const arabicHomeRowKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];

export function VirtualKeyboard() {
  const { currentText, typedText, language } = useTypingStore();

  const isArabic = isArabicText(currentText) || language === 'ar';

  // Get the next expected Arabic character and map back to Latin key
  const expectedChar = currentText[typedText.length] || '';
  let highlightLatinKey: string | null = null;
  let highlightNeedsShift = false;

  if (isArabic && expectedChar) {
    const found = getKeyForArabic(expectedChar);
    if (found) {
      highlightLatinKey = found.key;
      highlightNeedsShift = found.isShift;
    }
  }

  // English mode: determine expected key
  const englishExpectedLower = !isArabic ? expectedChar.toLowerCase() : '';
  const englishNeedsShift = !isArabic &&
    expectedChar === expectedChar.toUpperCase() &&
    expectedChar !== expectedChar.toLowerCase();

  return (
    <div className="flex flex-col items-center gap-1.5 p-4 bg-muted/30 rounded-xl backdrop-blur-sm">
      {qwertyRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {rowIndex === 2 && <div className="w-14 h-10" />}
          {rowIndex === 3 && <div className="w-20 h-10" />}

          {row.map((latinKey) => {
            const arabicChar = ARABIC_PHONETIC_MAP[latinKey];
            const arabicShiftChar = ARABIC_PHONETIC_SHIFT_MAP[latinKey.toUpperCase()];
            const hasArabic = !!arabicChar;
            const isHomeRow = isArabic
              ? arabicHomeRowKeys.includes(latinKey)
              : englishHomeRowKeys.includes(latinKey);

            // Determine if this key should be highlighted
            let isHighlighted = false;
            if (isArabic) {
              isHighlighted = highlightLatinKey === latinKey;
            } else {
              isHighlighted =
                englishExpectedLower === latinKey ||
                (englishNeedsShift && englishShiftChars[latinKey] === expectedChar);
            }

            return (
              <div
                key={latinKey}
                className={cn(
                  'relative w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-75',
                  'bg-background border border-border shadow-sm',
                  isHomeRow && 'ring-1 ring-primary/30',
                  isHighlighted && 'bg-primary/20 border-primary scale-105 shadow-md ring-1 ring-primary',
                )}
              >
                {isArabic && hasArabic ? (
                  <>
                    {/* Arabic phonetic key: show Arabic char big, Latin hint small */}
                    <span
                      className={cn(
                        'text-base font-semibold leading-none transition-colors',
                        isHighlighted ? 'text-primary' : 'text-foreground'
                      )}
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      {arabicChar}
                    </span>
                    {/* Latin key hint — bottom-left */}
                    <span className="absolute bottom-0.5 left-1 text-[9px] text-muted-foreground/40 font-mono leading-none">
                      {latinKey}
                    </span>
                    {/* Shift Arabic char — top-right */}
                    {arabicShiftChar && arabicShiftChar !== arabicChar && (
                      <span
                        className={cn(
                          'absolute top-0.5 right-0.5 text-[9px] leading-none transition-colors',
                          highlightNeedsShift && isHighlighted
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground/40'
                        )}
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                      >
                        {arabicShiftChar}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {/* English key */}
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isHighlighted ? 'text-primary font-bold' : 'text-muted-foreground'
                      )}
                    >
                      {latinKey}
                    </span>
                    {englishShiftChars[latinKey] && (
                      <span
                        className={cn(
                          'absolute top-0.5 right-1 text-[10px] transition-colors',
                          englishNeedsShift && englishShiftChars[latinKey] === expectedChar
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground/50'
                        )}
                      >
                        {englishShiftChars[latinKey]}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {rowIndex === 2 && (
            <div className="w-16 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
              {getTranslation(language, 'enter')}
            </div>
          )}
        </div>
      ))}

      {/* Space bar row */}
      <div className="flex gap-1.5 items-center">
        <div
          className={cn(
            'w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs font-medium transition-all duration-75',
            highlightNeedsShift && 'bg-primary/20 border-primary scale-105 text-primary',
            !highlightNeedsShift && 'text-muted-foreground'
          )}
        >
          {getTranslation(language, 'shift')}
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Ctrl
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Alt
        </div>
        <div
          className={cn(
            'w-72 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-75',
            'bg-background border border-border shadow-sm',
            expectedChar === ' ' && 'bg-primary/20 border-primary scale-[1.02] shadow-md'
          )}
        >
          {getTranslation(language, 'space')}
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Alt
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Ctrl
        </div>
        <div
          className={cn(
            'w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs font-medium transition-all duration-75',
            highlightNeedsShift && 'bg-primary/20 border-primary scale-105 text-primary',
            !highlightNeedsShift && 'text-muted-foreground'
          )}
        >
          {getTranslation(language, 'shift')}
        </div>
      </div>

      {/* Legend for Arabic mode */}
      {isArabic && (
        <div className="mt-1 text-xs text-muted-foreground/50 flex items-center gap-3">
          <span>
            <span className="font-mono">key</span> = Arabic char &nbsp;|&nbsp;
            top-right = Shift variant
          </span>
        </div>
      )}
    </div>
  );
}
