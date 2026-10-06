'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Home, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
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
import { useTypingStore } from '@/store/typing-store';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { getTranslation } from '@/lib/i18n/translations';
import type { AppMode, Lesson, Category } from '@/lib/typing/types';
import Image from 'next/image';
import { getLessons } from '@/lib/typing/lessons';
import { LessonGuide } from '@/components/typing/LessonGuide';

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
    markExerciseComplete,
    progress,
    customTexts,
    setCustomTexts,
    customTextIndex,
    setCustomTextIndex,
    language,
    setLanguage,
  } = useTypingStore();

  const {
    typedText,
    isTyping,
    isComplete,
    stats,
    restart,
  } = useTypingEngine();

  const focusPractice = useCallback((node: HTMLDivElement | null) => node?.focus(), []);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Sync document root direction and lang
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

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
    const completed = useTypingStore.getState().progress.lessonExercises?.[lesson.id] || [];
    const nextExercise = lesson.content.findIndex((_, index) => !completed.includes(index));
    setCurrentExerciseIndex(nextExercise < 0 ? 0 : nextExercise);
    setTimerSettings({ mode: 'none' });
    setSelectedLesson(lesson);
    setCurrentText(lesson.content[nextExercise < 0 ? 0 : nextExercise]);
    setContentSource('lesson');
    resetTyping();
  }, [setSelectedLesson, setCurrentText, setContentSource, resetTyping, setTimerSettings]);

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

  // Toggle Language
  const toggleLanguage = useCallback(() => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
  }, [language, setLanguage]);

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
      const nextIndex = selectedParagraphIndex + 1;
      setSelectedParagraphIndex(nextIndex);
      setCurrentText(selectedCategory.paragraphs[nextIndex]);
      resetTyping();
    }
  }, [hasNextParagraph, selectedCategory, selectedParagraphIndex, setSelectedParagraphIndex, setCurrentText, resetTyping]);

  const handlePrevParagraph = useCallback(() => {
    if (hasPrevParagraph && selectedCategory) {
      const prevIndex = selectedParagraphIndex - 1;
      setSelectedParagraphIndex(prevIndex);
      setCurrentText(selectedCategory.paragraphs[prevIndex]);
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

  const exercisePassed = isComplete && typedText.length === currentText.length && stats.accuracy >= 90;
  const passedExercises = selectedLesson ? progress.lessonExercises?.[selectedLesson.id] || [] : [];
  const nextLesson = selectedLesson ? getLessons(language)[getLessons(language).findIndex(l => l.id === selectedLesson.id) + 1] : undefined;
  const lessonFinished = !!selectedLesson && selectedLesson.content.every((_, index) => passedExercises.includes(index));

  useEffect(() => {
    if (mode === 'lesson' && selectedLesson && exercisePassed) {
      markExerciseComplete(selectedLesson.id, currentExerciseIndex);
    }
  }, [mode, selectedLesson, exercisePassed, currentExerciseIndex, markExerciseComplete]);

  useEffect(() => {
    if (mode === 'lesson' && selectedLesson && lessonFinished) markLessonComplete(selectedLesson.id);
  }, [mode, selectedLesson, lessonFinished, markLessonComplete]);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="relative min-h-screen flex flex-col">
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

      {/* Header Bar with Language Switcher */}
      <header className="relative z-20 px-6 py-3 border-b border-border/50 bg-background/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome}>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {getTranslation(language, 'appTitle')}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 border-primary/30 hover:bg-primary/10 transition-colors"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          </Button>
        </div>
      </header>

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
              ref={focusPractice}
              tabIndex={-1}
              aria-label={language === 'ar' ? 'منطقة تدريب الكتابة' : 'Typing practice area'}
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
                      <span className="mx-2 text-xs">
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
                      <span>{getTranslation(language, 'custom')}</span>
                      <span className="text-xs">
                        ({customTextIndex + 1}/{customTexts.length})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isTyping && mode !== 'lesson' && (
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

              {mode === 'lesson' && selectedLesson && (
                <LessonGuide lesson={selectedLesson} exerciseIndex={currentExerciseIndex} />
              )}
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
                <div className="overflow-x-auto mb-4" dir="ltr">
                  <div className="flex justify-center min-w-[700px]">
                  <VirtualKeyboard />
                  </div>
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
                      <ChevronLeft className="w-4 h-4 mx-1 rtl:rotate-180" />
                      {getTranslation(language, 'previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={contentSource === 'lesson' ? handleNextExercise : (contentSource === 'category' ? handleNextParagraph : handleNextCustom)}
                      disabled={contentSource === 'lesson' ? (!hasNextExercise || !passedExercises.includes(currentExerciseIndex)) : (contentSource === 'category' ? !hasNextParagraph : !hasNextCustom)}
                    >
                      {getTranslation(language, 'next')}
                      <ChevronRight className="w-4 h-4 mx-1 rtl:rotate-180" />
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
                lessonFeedback={mode === 'lesson' ? (exercisePassed
                  ? (lessonFinished ? (language === 'ar' ? 'أكملت جميع تمارين الدرس!' : 'Lesson mastered! Every exercise is complete.') : (language === 'ar' ? 'أحسنت! تابع إلى التمرين التالي.' : 'Well done! Continue to the next exercise.'))
                  : (language === 'ar' ? 'أعد التمرين بدقة ٩٠٪ على الأقل. ركز على الدقة قبل السرعة.' : 'Repeat this exercise with at least 90% accuracy. Slow down and focus on the correct fingers.')) : undefined}
                onContinue={mode === 'lesson' && exercisePassed && (hasNextExercise || nextLesson) ? () => {
                  if (hasNextExercise) handleNextExercise();
                  else if (nextLesson) handleSelectLesson(nextLesson);
                } : undefined}
                continueLabel={hasNextExercise ? (language === 'ar' ? 'التمرين التالي' : 'Next exercise') : (language === 'ar' ? 'الدرس التالي' : 'Next lesson')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-sm text-muted-foreground border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p>{getTranslation(language, 'appTitle')} • {getTranslation(language, 'appSubtitle')}</p>
      </footer>
    </div>
  );
}
