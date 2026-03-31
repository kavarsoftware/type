'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTypingStore, allLessons } from '@/store/typing-store';
import { beginnerLessons, intermediateLessons } from '@/lib/typing/lessons';
import type { Lesson } from '@/lib/typing/types';

interface LessonSelectorProps {
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export function LessonSelector({ onSelectLesson, onBack }: LessonSelectorProps) {
  const { progress } = useTypingStore();

  const isLessonUnlocked = (index: number, lessons: Lesson[]) => {
    if (index === 0) return true;
    return progress.completedLessons.includes(lessons[index - 1].id);
  };

  const renderLessons = (lessons: Lesson[], title: string) => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2">
        {title}
      </h3>
      {lessons.map((lesson, index) => {
        const isCompleted = progress.completedLessons.includes(lesson.id);
        const isUnlocked = isLessonUnlocked(index, lessons);
        
        return (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                isUnlocked 
                  ? 'hover:shadow-md hover:border-primary/50' 
                  : 'opacity-60 cursor-not-allowed'
              } ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}`}
              onClick={() => isUnlocked && onSelectLesson(lesson)}
            >
              <CardHeader className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {lesson.title}
                      {isCompleted && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {lesson.description}
                    </CardDescription>
                  </div>
                  {!isUnlocked && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {lesson.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {lesson.content.length} exercises
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Typing Lessons</h2>
          <p className="text-muted-foreground">
            Progress through lessons to master touch typing
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">
              {progress.completedLessons.length} / {allLessons.length} lessons
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(progress.completedLessons.length / allLessons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-8">
          {renderLessons(beginnerLessons, 'Beginner Lessons')}
          {renderLessons(intermediateLessons, 'Intermediate Lessons')}
        </div>
      </ScrollArea>
    </div>
  );
}
