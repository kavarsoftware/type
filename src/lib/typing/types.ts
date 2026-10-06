// Types for the touch typing application

export type Language = 'en' | 'ar';

export type CharacterStatus = 'pending' | 'correct' | 'incorrect' | 'current';

export interface CharacterState {
  char: string;
  status: CharacterStatus;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalWords: number;
  elapsedTime: number; // in seconds
}

export interface SessionResult {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
  mode: 'lesson' | 'practice' | 'custom';
  category?: string;
  lessonId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'letters' | 'words' | 'sentences' | 'paragraph';
  content: string[];
  category?: string;
  focusKeys?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  paragraphs: string[];
}

export type TimerMode = 'none' | '1min' | '5min' | 'custom';

export interface TimerSettings {
  mode: TimerMode;
  customSeconds?: number;
}

export type AppMode = 'menu' | 'lesson' | 'practice' | 'custom' | 'results';

export interface Progress {
  completedLessons: string[];
  lessonExercises?: Record<string, number[]>;
  totalSessions: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  totalPracticeTime: number; // in seconds
  recentSessions: SessionResult[];
}
