'use client';

import { motion } from 'framer-motion';
import { Timer, Zap, Target, TrendingUp } from 'lucide-react';
import { useTypingStore } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';
import type { TypingStats } from '@/lib/typing/types';

interface StatsPanelProps {
  stats: TypingStats;
  isTyping: boolean;
  isComplete: boolean;
  timerMode: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRemainingTime(elapsed: number, timerMode: string): number | null {
  if (timerMode === '1min') return Math.max(0, 60 - elapsed);
  if (timerMode === '5min') return Math.max(0, 300 - elapsed);
  return null;
}

export function StatsPanel({ stats, timerMode }: StatsPanelProps) {
  const { language } = useTypingStore();
  const remainingTime = getRemainingTime(stats.elapsedTime, timerMode);

  const statItems = [
    {
      icon: Zap,
      label: getTranslation(language, 'wpm'),
      value: stats.wpm,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Target,
      label: getTranslation(language, 'accuracy'),
      value: `${stats.accuracy}%`,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Timer,
      label: getTranslation(language, 'time'),
      value: remainingTime !== null ? formatTime(remainingTime) : formatTime(stats.elapsedTime),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: getTranslation(language, 'characters'),
      value: `${stats.correctCharacters}/${stats.totalCharacters}`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${item.bgColor} border border-border/50`}
        >
          <item.icon className={`w-5 h-5 ${item.color}`} />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className={`text-xl font-bold ${item.color}`}>
              {item.value}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
