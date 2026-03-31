'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useTypingStore } from '@/store/typing-store';
import type { TypingStats, SessionResult } from '@/lib/typing/types';

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
    const accuracy = totalCharacters > 0 
      ? Math.round((correctCharacters / totalCharacters) * 100) 
      : 100;

    return {
      wpm,
      accuracy,
      totalCharacters,
      correctCharacters,
      incorrectCharacters,
      totalWords: Math.round(totalCharacters / 5),
      elapsedTime,
    };
  }, [typedText, currentText, elapsedTime]);

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
    if (currentText && typedText.length >= currentText.length && timerSettings.mode === 'none') {
      completeRef.current();
    }
  }, [typedText, currentText, timerSettings.mode]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isComplete) return;

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
      if (typedText.length > 0) {
        setTypedText(typedText.slice(0, -1));
      }
      return;
    }

    // Handle regular character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const newTyped = typedText + e.key;
      
      // Check if character is incorrect
      const expectedChar = currentText[typedText.length];
      if (e.key !== expectedChar) {
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
