'use client';

import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Target, Zap, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTypingStore } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';
import type { TypingStats } from '@/lib/typing/types';

interface ResultsScreenProps {
  stats: TypingStats;
  onRestart: () => void;
  onGoHome: () => void;
}

function formatTime(seconds: number, isArabic: boolean): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return isArabic ? `${mins} دقيقة ${secs} ثانية` : `${mins}m ${secs}s`;
  }
  return isArabic ? `${secs} ثانية` : `${secs}s`;
}

export function ResultsScreen({ stats, onRestart, onGoHome }: ResultsScreenProps) {
  const { language } = useTypingStore();
  const isArabic = language === 'ar';
  
  const isGoodWpm = stats.wpm >= 40;
  const isGreatWpm = stats.wpm >= 60;
  const isExcellentWpm = stats.wpm >= 80;
  const isPerfectAccuracy = stats.accuracy === 100;

  const getWpmMessage = () => {
    if (isArabic) {
      if (isExcellentWpm) return "سرعة فائقة ومدهشة! أنت محترف كتابة حقيقي!";
      if (isGreatWpm) return "عمل رائع جداً! سرعتك ممتازة ومثيرة للإعجاب!";
      if (isGoodWpm) return "أداء جيد جداً! واصل التدريب لتحقيق نتائج أفضل!";
      return "جهد طيب! بالممارسة المستمرة ستصل للقمة!";
    }
    if (isExcellentWpm) return "Incredible speed! You're a typing master!";
    if (isGreatWpm) return "Great job! Your speed is impressive!";
    if (isGoodWpm) return "Good work! Keep practicing to improve!";
    return "Nice effort! Practice makes perfect!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-8 p-8 max-w-lg mx-auto"
    >
      {/* Trophy Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        {(isGreatWpm || isPerfectAccuracy) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold"
          >
            ✓
          </motion.div>
        )}
      </motion.div>

      {/* Message */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {getTranslation(language, 'sessionComplete')}
        </h2>
        <p className="text-muted-foreground">{getWpmMessage()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">{getTranslation(language, 'wpmAchieved')}</span>
          </div>
          <div className="text-3xl font-bold text-amber-500">{stats.wpm}</div>
          <div className="text-xs text-muted-foreground">{getTranslation(language, 'wpm')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">{getTranslation(language, 'accuracyAchieved')}</span>
          </div>
          <div className="text-3xl font-bold text-emerald-500">{stats.accuracy}%</div>
          <div className="text-xs text-muted-foreground">{isArabic ? 'صحيح' : 'correct'}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">{getTranslation(language, 'timeElapsed')}</span>
          </div>
          <div className="text-3xl font-bold text-blue-500">{formatTime(stats.elapsedTime, isArabic)}</div>
          <div className="text-xs text-muted-foreground">{isArabic ? 'الوقت الكلي' : 'total time'}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">{getTranslation(language, 'characters')}</span>
          </div>
          <div className="text-3xl font-bold text-purple-500">{stats.correctCharacters}</div>
          <div className="text-xs text-muted-foreground">{isArabic ? `من ${stats.totalCharacters}` : `of ${stats.totalCharacters}`}</div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <Button
          variant="outline"
          onClick={onGoHome}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          {getTranslation(language, 'returnHome')}
        </Button>
        <Button
          onClick={onRestart}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {getTranslation(language, 'tryAgain')}
        </Button>
      </div>
    </motion.div>
  );
}
