'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingStore } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import type { CharacterStatus } from '@/lib/typing/types';

interface TypingDisplayProps {
  text: string;
  typedText: string;
}

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function TypingDisplay({ text, typedText }: TypingDisplayProps) {
  const { language } = useTypingStore();
  const isRtl = isArabicText(text) || language === 'ar';

  // Pre-calculate all character statuses
  const characters = useMemo(() => {
    return text.split('').map((char, index) => {
      let status: CharacterStatus = 'pending';
      if (index < typedText.length) {
        status = typedText[index] === char ? 'correct' : 'incorrect';
      } else if (index === typedText.length) {
        status = 'current';
      }
      return { char, status, index };
    });
  }, [text, typedText]);

  // Split into lines for better display
  const lines: Array<Array<{ char: string; status: CharacterStatus; index: number }>> = useMemo(() => {
    const result: Array<Array<{ char: string; status: CharacterStatus; index: number }>> = [];
    let currentLine: Array<{ char: string; status: CharacterStatus; index: number }> = [];
    let charCount = 0;
    const charsPerLine = 70;

    characters.forEach((charData) => {
      currentLine.push(charData);
      charCount++;
      
      // Break at word boundaries
      if (charData.char === ' ' && charCount >= charsPerLine) {
        result.push(currentLine);
        currentLine = [];
        charCount = 0;
      }
    });

    if (currentLine.length > 0) {
      result.push(currentLine);
    }

    return result;
  }, [characters]);

  // Calculate which line the cursor is currently on
  const currentLineIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      count += lines[i].length;
      if (count > typedText.length) {
        return i;
      }
    }
    return lines.length - 1;
  }, [lines, typedText.length]);

  // Show 5 lines: 2 before current, current, and 2 after
  const visibleStartLine = Math.max(0, currentLineIndex - 1);
  const visibleEndLine = Math.min(lines.length, currentLineIndex + 4);
  const visibleLines = lines.slice(visibleStartLine, visibleEndLine);

  // Calculate completed lines count
  const completedLinesCount = visibleStartLine;
  const remainingLinesCount = lines.length - visibleEndLine;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn(
        "text-xl leading-relaxed min-h-[180px]",
        isRtl
          ? "text-right font-sans tracking-normal"
          : "text-left font-mono tracking-wide"
      )}
    >
      {/* Show completed lines indicator */}
      {completedLinesCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground/50 mb-2 text-center"
        >
          ✓ {completedLinesCount} {getTranslation(language, 'linesCompleted')}
        </motion.div>
      )}
      
      <AnimatePresence mode="sync">
        {visibleLines.map((line, lineIndex) => {
          const actualLineIndex = visibleStartLine + lineIndex;
          const isCompletedLine = actualLineIndex < currentLineIndex;
          
          return (
            <motion.div
              key={actualLineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "inline",
                isCompletedLine && "opacity-30"
              )}
            >
              {line.map(({ char, status, index }) => (
                <span
                  key={index}
                  className={cn(
                    // Use `inline` (not `inline-block`) so the browser's Arabic text-shaping
                    // engine can join letters across adjacent spans (ligatures, etc.)
                    "relative inline transition-colors duration-0",
                    status === 'correct' && "text-foreground",
                    status === 'incorrect' && "text-destructive underline",
                    status === 'current' && "text-muted-foreground",
                    status === 'pending' && "text-muted-foreground/40"
                  )}
                >
                  {status === 'current' && (
                    <motion.span 
                      className={cn(
                        "absolute top-0 w-0.5 h-full bg-primary",
                        isRtl ? "right-0" : "left-0"
                      )}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                  <span className={cn(
                    "relative",
                    status === 'current' && "bg-primary/10"
                  )}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                </span>
              ))}
              {actualLineIndex < lines.length - 1 && <span> </span>}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Show remaining lines indicator */}
      {remainingLinesCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground/50 mt-2 text-center"
        >
          {remainingLinesCount} {getTranslation(language, 'linesRemaining')}
        </motion.div>
      )}
    </div>
  );
}
