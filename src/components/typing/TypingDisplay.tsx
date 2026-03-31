'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CharacterStatus } from '@/lib/typing/types';

interface TypingDisplayProps {
  text: string;
  typedText: string;
}

export function TypingDisplay({ text, typedText }: TypingDisplayProps) {
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
    const charsPerLine = 70; // Approximate characters per line

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

  // Calculate how many lines are completed (before visible start)
  const completedLinesCount = visibleStartLine;

  return (
    <div className="font-mono text-xl leading-relaxed tracking-wide min-h-[180px]">
      {/* Show completed lines indicator */}
      {completedLinesCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground/50 mb-2 text-center"
        >
          ✓ {completedLinesCount} line{completedLinesCount > 1 ? 's' : ''} completed
        </motion.div>
      )}
      
      <AnimatePresence mode="sync">
        {visibleLines.map((line, lineIndex) => {
          const actualLineIndex = visibleStartLine + lineIndex;
          const isCurrentLine = actualLineIndex === currentLineIndex;
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
                    "relative inline-block transition-colors duration-0",
                    status === 'correct' && "text-foreground",
                    status === 'incorrect' && "text-destructive bg-destructive/20 underline",
                    status === 'current' && "text-muted-foreground",
                    status === 'pending' && "text-muted-foreground/40"
                  )}
                >
                  {status === 'current' && (
                    <motion.span 
                      className="absolute left-0 top-0 w-0.5 h-full bg-primary"
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
      {visibleEndLine < lines.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground/50 mt-2 text-center"
        >
          {lines.length - visibleEndLine} more line{lines.length - visibleEndLine > 1 ? 's' : ''} remaining
        </motion.div>
      )}
    </div>
  );
}
