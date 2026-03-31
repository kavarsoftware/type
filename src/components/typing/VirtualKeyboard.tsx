'use client';

import { useTypingStore } from '@/store/typing-store';
import { cn } from '@/lib/utils';

const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const shiftChars: Record<string, string> = {
  '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
  '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
  '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
};

const homeRowKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

export function VirtualKeyboard() {
  const { currentText, typedText } = useTypingStore();
  
  // Get the current expected character
  const expectedChar = currentText[typedText.length] || '';
  const isShifted = expectedChar === expectedChar.toUpperCase() && expectedChar !== expectedChar.toLowerCase();
  const expectedLower = expectedChar.toLowerCase();

  return (
    <div className="flex flex-col items-center gap-1.5 p-4 bg-muted/30 rounded-xl backdrop-blur-sm">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {rowIndex === 2 && (
            <div className="w-14 h-10" /> // Spacer for offset
          )}
          {rowIndex === 3 && (
            <div className="w-20 h-10" /> // Spacer for offset
          )}
          {row.map((key) => {
            const isHomeRow = homeRowKeys.includes(key);
            const isExpected = expectedLower === key;
            const showShift = isShifted && shiftChars[key] === expectedChar;
            const isHighlighted = isExpected || showShift;

            return (
              <div
                key={key}
                className={cn(
                  "relative w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-75",
                  "bg-background border border-border shadow-sm",
                  isHomeRow && "ring-1 ring-primary/30",
                  isHighlighted && "bg-primary/20 border-primary scale-105 shadow-md",
                  isExpected && expectedChar === key && "bg-green-500/20 border-green-500",
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isHighlighted ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  {key}
                </span>
                {shiftChars[key] && (
                  <span className={cn(
                    "absolute top-0.5 right-1 text-xs transition-colors",
                    showShift ? "text-primary font-bold" : "text-muted-foreground/50"
                  )}>
                    {shiftChars[key]}
                  </span>
                )}
              </div>
            );
          })}
          {rowIndex === 2 && (
            <div className="w-16 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
              Enter
            </div>
          )}
        </div>
      ))}
      {/* Space bar row */}
      <div className="flex gap-1.5 items-center">
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Shift
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Ctrl
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Alt
        </div>
        <div
          className={cn(
            "w-72 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-75",
            "bg-background border border-border shadow-sm",
            expectedChar === ' ' && "bg-primary/20 border-primary scale-[1.02] shadow-md"
          )}
        >
          Space
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Alt
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Ctrl
        </div>
        <div className="w-14 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground">
          Shift
        </div>
      </div>
    </div>
  );
}
