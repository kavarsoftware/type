'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard';
import { StatsPanel } from '@/components/typing/StatsPanel';
import { ResultsScreen } from '@/components/typing/ResultsScreen';
import { TimerSettings } from '@/components/typing/TimerSettings';
import { MainMenu } from '@/components/typing/MainMenu';
import { LessonSelector } from '@/components/typing/LessonSelector';
import { CategorySelector } from '@/components/typing/CategorySelector';
import { CustomTextInput } from '@/components/typing/CustomTextInput';
import { useTypingStore, allLessons } from '@/store/typing-store';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import type { AppMode, Lesson, Category } from '@/lib/typing/types';
import Image from 'next/image';

export default function TypingApp() {
  const {
    mode,
    setMode,
    currentText,
    setCurrentText,
    resetTyping,
    resetSession,
    selectedLesson,
    setSelectedLesson,
    selectedCategory,
    setSelectedCategory,
    selectedParagraphIndex,
    setSelectedParagraphIndex,
    contentSource,
    setContentSource,
    timerSettings,
    setTimerSettings,
    markLessonComplete,
    customTexts,
    setCustomTexts,
    customTextIndex,
    setCustomTextIndex,
  } = useTypingStore();

  const {
    typedText,
    isTyping,
    isComplete,
    stats,
    restart,
    getCharacterStatus,
  } = useTypingEngine();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Initialize text when starting a session
  useEffect(() => {
    if (mode === 'lesson' && selectedLesson) {
      const exerciseText = selectedLesson.content[currentExerciseIndex] || selectedLesson.content[0];
      setCurrentText(exerciseText);
      setContentSource('lesson');
    } else if (mode === 'practice' && selectedCategory) {
      const paragraph = selectedCategory.paragraphs[selectedParagraphIndex] || selectedCategory.paragraphs[0];
      setCurrentText(paragraph);
      setContentSource('category');
    } else if (mode === 'custom' && customTexts && customTexts.length > 0) {
      const cText = customTexts[customTextIndex] || customTexts[0];
      setCurrentText(cText);
      setContentSource('custom');
    }
  }, [mode, selectedLesson, selectedCategory, currentExerciseIndex, selectedParagraphIndex, customTexts, customTextIndex, setCurrentText, setContentSource]);

  // Handle navigation
  const handleNavigate = useCallback((newMode: AppMode) => {
    resetSession();
    setMode(newMode);
    setCurrentExerciseIndex(0);
    setSelectedParagraphIndex(0);
  }, [resetSession, setMode, setSelectedParagraphIndex]);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentText(lesson.content[0]);
    setContentSource('lesson');
    resetTyping();
  }, [setSelectedLesson, setCurrentText, setContentSource, resetTyping]);

  const handleSelectCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    setCurrentText(category.paragraphs[0]);
    setContentSource('category');
    resetTyping();
  }, [setSelectedCategory, setCurrentText, setContentSource, resetTyping]);

  const handleCustomText = useCallback((texts: string[]) => {
    setCustomTexts(texts);
    setCustomTextIndex(0);
    setCurrentText(texts[0]);
    setContentSource('custom');
    resetTyping();
  }, [setCustomTexts, setCustomTextIndex, setCurrentText, setContentSource, resetTyping]);

  const handleRestart = useCallback(() => {
    restart();
  }, [restart]);

  const handleGoHome = useCallback(() => {
    resetSession();
    setMode('menu');
    setCurrentExerciseIndex(0);
  }, [resetSession, setMode]);

  // Navigate exercises in lessons
  const hasNextExercise = selectedLesson && currentExerciseIndex < selectedLesson.content.length - 1;
  const hasPrevExercise = currentExerciseIndex > 0;

  const handleNextExercise = useCallback(() => {
    if (hasNextExercise && selectedLesson) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentText(selectedLesson.content[currentExerciseIndex + 1]);
      resetTyping();
    }
  }, [hasNextExercise, selectedLesson, currentExerciseIndex, setCurrentText, resetTyping]);

  const handlePrevExercise = useCallback(() => {
    if (hasPrevExercise && selectedLesson) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentText(selectedLesson.content[currentExerciseIndex - 1]);
      resetTyping();
    }
  }, [hasPrevExercise, selectedLesson, currentExerciseIndex, setCurrentText, resetTyping]);

  // Navigate paragraphs in practice
  const hasNextParagraph = selectedCategory && selectedParagraphIndex < selectedCategory.paragraphs.length - 1;
  const hasPrevParagraph = selectedParagraphIndex > 0;

  const handleNextParagraph = useCallback(() => {
    if (hasNextParagraph && selectedCategory) {
      setSelectedParagraphIndex(prev => prev + 1);
      setCurrentText(selectedCategory.paragraphs[selectedParagraphIndex + 1]);
      resetTyping();
    }
  }, [hasNextParagraph, selectedCategory, selectedParagraphIndex, setSelectedParagraphIndex, setCurrentText, resetTyping]);

  const handlePrevParagraph = useCallback(() => {
    if (hasPrevParagraph && selectedCategory) {
      setSelectedParagraphIndex(prev => prev - 1);
      setCurrentText(selectedCategory.paragraphs[selectedParagraphIndex - 1]);
      resetTyping();
    }
  }, [hasPrevParagraph, selectedCategory, selectedParagraphIndex, setSelectedParagraphIndex, setCurrentText, resetTyping]);

  // Navigate custom texts
  const hasNextCustom = contentSource === 'custom' && customTexts && customTextIndex < customTexts.length - 1;
  const hasPrevCustom = contentSource === 'custom' && customTextIndex > 0;

  const handleNextCustom = useCallback(() => {
    if (hasNextCustom) {
      setCustomTextIndex(customTextIndex + 1);
      setCurrentText(customTexts[customTextIndex + 1]);
      resetTyping();
    }
  }, [hasNextCustom, customTextIndex, customTexts, setCustomTextIndex, setCurrentText, resetTyping]);

  const handlePrevCustom = useCallback(() => {
    if (hasPrevCustom) {
      setCustomTextIndex(customTextIndex - 1);
      setCurrentText(customTexts[customTextIndex - 1]);
      resetTyping();
    }
  }, [hasPrevCustom, customTextIndex, customTexts, setCustomTextIndex, setCurrentText, resetTyping]);

  // Mark lesson complete when done
  useEffect(() => {
    if (isComplete && selectedLesson && currentExerciseIndex === selectedLesson.content.length - 1) {
      markLessonComplete(selectedLesson.id);
    }
  }, [isComplete, selectedLesson, currentExerciseIndex, markLessonComplete]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/background.png"
          alt="Background"
          fill
          className="object-cover opacity-20 dark:opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Main Menu */}
          {mode === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-6"
            >
              <MainMenu onNavigate={handleNavigate} />
            </motion.div>
          )}

          {/* Lesson Selector */}
          {mode === 'lesson' && !currentText && (
            <motion.div
              key="lesson-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-6"
            >
              <LessonSelector
                onSelectLesson={handleSelectLesson}
                onBack={() => handleNavigate('menu')}
              />
            </motion.div>
          )}

          {/* Category Selector */}
          {mode === 'practice' && !currentText && (
            <motion.div
              key="category-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-6"
            >
              <CategorySelector
                onSelectCategory={handleSelectCategory}
                onBack={() => handleNavigate('menu')}
              />
            </motion.div>
          )}

          {/* Custom Text Input */}
          {mode === 'custom' && !currentText && (
            <motion.div
              key="custom-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-6"
            >
              <CustomTextInput
                onStartTyping={handleCustomText}
                onBack={() => handleNavigate('menu')}
              />
            </motion.div>
          )}

          {/* Typing Practice */}
          {currentText && !isComplete && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-4 md:p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleGoHome}>
                    <Home className="w-5 h-5" />
                  </Button>
                  {selectedLesson && (
                    <div className="text-sm text-muted-foreground">
                      {selectedLesson.title}
                      <span className="ml-2 text-xs">
                        ({currentExerciseIndex + 1}/{selectedLesson.content.length})
                      </span>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.name}</span>
                      <span className="text-xs">
                        ({selectedParagraphIndex + 1}/{selectedCategory.paragraphs.length})
                      </span>
                    </div>
                  )}
                  {contentSource === 'custom' && customTexts && customTexts.length > 1 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📝</span>
                      <span>Custom Text</span>
                      <span className="text-xs">
                        ({customTextIndex + 1}/{customTexts.length})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isTyping && (
                    <TimerSettings
                      settings={timerSettings}
                      onSettingsChange={setTimerSettings}
                    />
                  )}
                  <Button variant="outline" size="icon" onClick={handleRestart}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Panel */}
              <div className="mb-6">
                <StatsPanel
                  stats={stats}
                  isTyping={isTyping}
                  isComplete={isComplete}
                  timerMode={timerSettings.mode}
                />
              </div>

              {/* Typing Display */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center mb-8">
                  <div className="max-w-4xl w-full p-6 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
                    <TypingDisplay text={currentText} typedText={typedText} />
                  </div>
                </div>

                {/* Virtual Keyboard */}
                <div className="flex justify-center mb-4">
                  <VirtualKeyboard />
                </div>

                {/* Navigation for exercises/paragraphs */}
                {((contentSource === 'lesson' && selectedLesson && selectedLesson.content.length > 1) ||
                  (contentSource === 'category' && selectedCategory && selectedCategory.paragraphs.length > 1) ||
                  (contentSource === 'custom' && customTexts && customTexts.length > 1)) && (
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={contentSource === 'lesson' ? handlePrevExercise : (contentSource === 'category' ? handlePrevParagraph : handlePrevCustom)}
                      disabled={contentSource === 'lesson' ? !hasPrevExercise : (contentSource === 'category' ? !hasPrevParagraph : !hasPrevCustom)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={contentSource === 'lesson' ? handleNextExercise : (contentSource === 'category' ? handleNextParagraph : handleNextCustom)}
                      disabled={contentSource === 'lesson' ? !hasNextExercise : (contentSource === 'category' ? !hasNextParagraph : !hasNextCustom)}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Results Screen */}
          {isComplete && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <ResultsScreen
                stats={stats}
                onRestart={handleRestart}
                onGoHome={handleGoHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-sm text-muted-foreground border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p>TypeMaster • Practice touch typing with educational content</p>
      </footer>
    </div>
  );
}
