'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useTypingStore } from '@/store/typing-store';
import type { TypingStats, SessionResult } from '@/lib/typing/types';
import { isArabicText, mapKeyToArabic } from '@/lib/typing/arabicTransliteration';

export function useTypingEngine() {
  const {
    currentText,
    typedText,
    setTypedText,
    isTyping,
    setIsTyping,
    isComplete,
    setIsComplete,
    startTime,
    setStartTime,
    elapsedTime,
    setElapsedTime,
    timerSettings,
    errors,
    setErrors,
    contentSource,
    addSessionResult,
    resetTyping,
  } = useTypingStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completeRef = useRef<() => void>(() => {});

  // Calculate stats
  const calculateStats = useCallback((): TypingStats => {
    const totalCharacters = typedText.length;
    let correctCharacters = 0;
    let incorrectCharacters = 0;

    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === currentText[i]) {
        correctCharacters++;
      } else {
        incorrectCharacters++;
      }
    }

    // WPM calculation: (characters / 5) / minutes
    const minutes = elapsedTime / 60 || 1 / 60; // Minimum 1 second
    const words = correctCharacters / 5;
    const wpm = Math.round(words / minutes) || 0;

    // Accuracy calculation
    const attempts = correctCharacters + errors;
    const accuracy = attempts > 0 ? Math.round((correctCharacters / attempts) * 100) : 100;

    return {
      wpm,
      accuracy,
      totalCharacters,
      correctCharacters,
      incorrectCharacters,
      totalWords: Math.round(totalCharacters / 5),
      elapsedTime,
    };
  }, [typedText, currentText, elapsedTime, errors]);

  const handleComplete = useCallback(() => {
    setIsTyping(false);
    setIsComplete(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Save session result
    const stats = calculateStats();
    const result: SessionResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      duration: stats.elapsedTime,
      lessonId: useTypingStore.getState().selectedLesson?.id,
      mode: contentSource === 'lesson' ? 'lesson' : contentSource === 'category' ? 'practice' : 'custom',
    };
    
    addSessionResult(result);
  }, [calculateStats, contentSource, addSessionResult, setIsTyping, setIsComplete]);

  // Keep ref updated
  useEffect(() => {
    completeRef.current = handleComplete;
  }, [handleComplete]);

  // Timer logic
  useEffect(() => {
    if (isTyping && !isComplete) {
      timerRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
        setElapsedTime(newElapsed);

        // Check timer mode limits
        if (timerSettings.mode === '1min' && newElapsed >= 60) {
          completeRef.current();
        } else if (timerSettings.mode === '5min' && newElapsed >= 300) {
          completeRef.current();
        } else if (timerSettings.mode === 'custom' && timerSettings.customSeconds && newElapsed >= timerSettings.customSeconds) {
          completeRef.current();
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTyping, isComplete, startTime, timerSettings, setElapsedTime]);

  // Check for completion (non-timer mode)
  useEffect(() => {
    if (!isComplete && currentText && typedText.length >= currentText.length) {
      completeRef.current();
    }
  }, [typedText, currentText, isComplete]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { currentText, typedText, isTyping, isComplete, errors } = useTypingStore.getState();
    const target = e.target as HTMLElement | null;
    if (!currentText || isComplete || target?.closest('button, input, textarea, select, a, [contenteditable="true"], [role="button"]')) return;

    // Prevent default for certain keys during typing
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
    }

    // Start timer on first keystroke
    if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      setIsTyping(true);
      setStartTime(Date.now());
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (typedText.length > 0) {
        setTypedText(typedText.slice(0, -1));
      }
      return;
    }

    // Handle regular character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Map Latin key to Arabic character when in Arabic mode
      const isArabic = isArabicText(currentText);
      const char = isArabic ? mapKeyToArabic(e.key) : e.key;
      if (typedText.length >= currentText.length) return;
      const newTyped = typedText + char;
      
      // Check if character is incorrect
      const expectedChar = currentText[typedText.length];
      if (char !== expectedChar) {
        setErrors(errors + 1);
      }
      
      setTypedText(newTyped);
    }
  }, [isComplete, isTyping, typedText, currentText, errors, setIsTyping, setStartTime, setTypedText, setErrors]);

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Get character status for display
  const getCharacterStatus = useCallback((index: number) => {
    if (index < typedText.length) {
      return typedText[index] === currentText[index] ? 'correct' : 'incorrect';
    }
    if (index === typedText.length) {
      return 'current';
    }
    return 'pending';
  }, [typedText, currentText]);

  // Restart current session
  const restart = useCallback(() => {
    resetTyping();
  }, [resetTyping]);

  return {
    typedText,
    isTyping,
    isComplete,
    elapsedTime,
    stats: calculateStats(),
    getCharacterStatus,
    restart,
    timerSettings,
  };
}
