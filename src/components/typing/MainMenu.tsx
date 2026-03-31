'use client';

import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Lightbulb, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTypingStore } from '@/store/typing-store';
import type { AppMode } from '@/lib/typing/types';

interface MainMenuProps {
  onNavigate: (mode: AppMode) => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const { progress } = useTypingStore();
  
  const lessonProgress = progress.completedLessons.length > 0 
    ? Math.round((progress.completedLessons.length / 20) * 100) 
    : 0;

  const menuItems = [
    {
      icon: GraduationCap,
      title: 'Beginner Lessons',
      description: 'Start from the basics. Learn home row, then expand to all keys.',
      mode: 'lesson' as AppMode,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'hover:border-emerald-500/50',
    },
    {
      icon: Lightbulb,
      title: 'Practice Topics',
      description: 'Type educational content from biology, psychology, technology, and more.',
      mode: 'practice' as AppMode,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'hover:border-amber-500/50',
    },
    {
      icon: FileText,
      title: 'Custom Text',
      description: 'Paste your own text or upload files (.txt, .pdf, .docx) to practice.',
      mode: 'custom' as AppMode,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'hover:border-purple-500/50',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            TypeMaster
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Master touch typing with structured lessons and educational content.
          Learn while you type!
        </p>
      </motion.div>

      {/* Progress Overview */}
      {progress.totalSessions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-muted/30 border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Your Progress
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {progress.totalSessions} sessions completed
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-amber-500">{progress.bestWpm}</div>
                  <div className="text-xs text-muted-foreground">Best WPM</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-emerald-500">{progress.averageAccuracy}%</div>
                  <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-blue-500">{Math.floor(progress.totalPracticeTime / 60)}</div>
                  <div className="text-xs text-muted-foreground">Minutes Practiced</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-purple-500">{progress.completedLessons.length}</div>
                  <div className="text-xs text-muted-foreground">Lessons Done</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lessons Progress</span>
                  <span className="font-medium">{lessonProgress}%</span>
                </div>
                <Progress value={lessonProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Menu Items */}
      <div className="grid gap-4 md:grid-cols-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.borderColor}`}
              onClick={() => onNavigate(item.mode)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-3`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>Press any key to start typing once you select a mode</p>
      </motion.div>
    </div>
  );
}
