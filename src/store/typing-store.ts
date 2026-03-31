'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimerSettings, AppMode, SessionResult, Progress, Lesson, Category } from '@/lib/typing/types';
import { allLessons, categories } from '@/lib/typing/lessons';

interface TypingState {
  // Navigation
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  // Current typing content
  currentText: string;
  setCurrentText: (text: string) => void;
  
  // Typing state
  typedText: string;
  setTypedText: (text: string) => void;
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  isComplete: boolean;
  setIsComplete: (isComplete: boolean) => void;
  
  // Timing
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  timerSettings: TimerSettings;
  setTimerSettings: (settings: TimerSettings) => void;
  
  // Stats
  errors: number;
  setErrors: (errors: number) => void;
  
  // Lesson/Practice selection
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson | null) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  selectedParagraphIndex: number;
  setSelectedParagraphIndex: (index: number) => void;
  
  // Content source
  contentSource: 'lesson' | 'category' | 'custom';
  setContentSource: (source: 'lesson' | 'category' | 'custom') => void;
  
  // Custom text segments
  customTexts: string[];
  setCustomTexts: (texts: string[]) => void;
  customTextIndex: number;
  setCustomTextIndex: (index: number) => void;
  
  // Progress tracking
  progress: Progress;
  addSessionResult: (result: SessionResult) => void;
  markLessonComplete: (lessonId: string) => void;
  
  // Reset
  resetTyping: () => void;
  resetSession: () => void;
}

const initialProgress: Progress = {
  completedLessons: [],
  totalSessions: 0,
  averageWpm: 0,
  averageAccuracy: 0,
  bestWpm: 0,
  bestAccuracy: 0,
  totalPracticeTime: 0,
  recentSessions: [],
};

export const useTypingStore = create<TypingState>()(
  persist(
    (set, get) => ({
      // Navigation
      mode: 'menu',
      setMode: (mode) => set({ mode }),
      
      // Current typing content
      currentText: '',
      setCurrentText: (text) => set({ currentText: text }),
      
      // Typing state
      typedText: '',
      setTypedText: (text) => set({ typedText: text }),
      isTyping: false,
      setIsTyping: (isTyping) => set({ isTyping }),
      isComplete: false,
      setIsComplete: (isComplete) => set({ isComplete }),
      
      // Timing
      startTime: null,
      setStartTime: (time) => set({ startTime: time }),
      elapsedTime: 0,
      setElapsedTime: (time) => set({ elapsedTime: time }),
      timerSettings: { mode: 'none' },
      setTimerSettings: (settings) => set({ timerSettings: settings }),
      
      // Stats
      errors: 0,
      setErrors: (errors) => set({ errors }),
      
      // Lesson/Practice selection
      selectedLesson: null,
      setSelectedLesson: (lesson) => set({ selectedLesson: lesson }),
      selectedCategory: null,
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      selectedParagraphIndex: 0,
      setSelectedParagraphIndex: (index) => set({ selectedParagraphIndex: index }),
      
      // Content source
      contentSource: 'lesson',
      setContentSource: (source) => set({ contentSource: source }),
      
      // Custom text segments
      customTexts: [],
      setCustomTexts: (texts) => set({ customTexts: texts }),
      customTextIndex: 0,
      setCustomTextIndex: (index) => set({ customTextIndex: index }),
      
      // Progress tracking
      progress: initialProgress,
      addSessionResult: (result) => {
        const current = get().progress;
        const newSessions = [...current.recentSessions, result].slice(-50); // Keep last 50 sessions
        
        const totalWpm = newSessions.reduce((sum, s) => sum + s.wpm, 0);
        const totalAccuracy = newSessions.reduce((sum, s) => sum + s.accuracy, 0);
        
        set({
          progress: {
            ...current,
            totalSessions: current.totalSessions + 1,
            averageWpm: Math.round(totalWpm / newSessions.length),
            averageAccuracy: Math.round(totalAccuracy / newSessions.length),
            bestWpm: Math.max(current.bestWpm, result.wpm),
            bestAccuracy: Math.max(current.bestAccuracy, result.accuracy),
            totalPracticeTime: current.totalPracticeTime + result.duration,
            recentSessions: newSessions,
          },
        });
      },
      markLessonComplete: (lessonId) => {
        const current = get().progress;
        if (!current.completedLessons.includes(lessonId)) {
          set({
            progress: {
              ...current,
              completedLessons: [...current.completedLessons, lessonId],
            },
          });
        }
      },
      
      // Reset
      resetTyping: () => set({
        typedText: '',
        isTyping: false,
        isComplete: false,
        startTime: null,
        elapsedTime: 0,
        errors: 0,
      }),
      resetSession: () => set({
        typedText: '',
        isTyping: false,
        isComplete: false,
        startTime: null,
        elapsedTime: 0,
        errors: 0,
        currentText: '',
        selectedLesson: null,
        selectedCategory: null,
        selectedParagraphIndex: 0,
        customTexts: [],
        customTextIndex: 0,
      }),
    }),
    {
      name: 'typing-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);

// Export data accessors
export { allLessons, categories };
