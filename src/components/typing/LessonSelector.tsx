'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTypingStore, getLessons } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';
import type { Lesson } from '@/lib/typing/types';

interface LessonSelectorProps {
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export function LessonSelector({ onSelectLesson, onBack }: LessonSelectorProps) {
  const { progress, language } = useTypingStore();
  const currentLessons = getLessons(language);

  const completedCount = currentLessons.filter(l => progress.completedLessons.includes(l.id)).length;
  const recommended = currentLessons.find(l => !progress.completedLessons.includes(l.id));

  const beginner = currentLessons.filter(l => l.level === 'beginner');
  const intermediate = currentLessons.filter(l => l.level === 'intermediate');
  const advanced = currentLessons.filter(l => l.level === 'advanced');

  const isLessonUnlocked = (index: number, lessons: Lesson[]) => {
    const globalIndex = currentLessons.findIndex(l => l.id === lessons[index].id);
    return globalIndex === 0 || progress.completedLessons.includes(currentLessons[globalIndex - 1].id);
  };

  const renderLessons = (lessons: Lesson[], title: string) => (
    lessons.length > 0 ? (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2 z-10">
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
              <button type="button" disabled={!isUnlocked} onClick={() => onSelectLesson(lesson)} className="w-full text-start rounded-xl focus-visible:outline-2 focus-visible:outline-primary">
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isUnlocked 
                    ? 'hover:shadow-md hover:border-primary/50' 
                    : 'opacity-60 cursor-not-allowed'
                } ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}`}

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
                      {getTranslation(language, lesson.type) || lesson.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {lesson.content.length} {language === 'ar' ? 'تمارين' : 'exercises'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
              </button>
            </motion.div>
          );
        })}
      </div>
    ) : null
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{getTranslation(language, 'selectLesson')}</h2>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'تدرج عبر الدروس لإتقان الكتابة السريعة باللمس' 
              : 'Progress through lessons to master touch typing'}
          </p>
        </div>
      </div>

      {recommended && <Button className="w-full" onClick={() => onSelectLesson(recommended)}>
        {language === 'ar' ? 'تابع التعلم' : 'Continue learning'}: {recommended.title}
      </Button>}
      <p className="text-sm text-muted-foreground">{language === 'ar' ? 'أكمل كل تمرين بدقة ٩٠٪ لفتح الدرس التالي. يحفظ تقدمك على هذا الجهاز.' : 'Complete every exercise with 90% accuracy to unlock the next lesson. Progress is saved on this device.'}</p>
      {/* Progress */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{getTranslation(language, 'lessonsProgress')}</span>
            <span className="font-medium">
              {completedCount} / {currentLessons.length} {getTranslation(language, 'lessonsDone')}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (completedCount / currentLessons.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-8">
          {renderLessons(beginner, getTranslation(language, 'beginner'))}
          {renderLessons(intermediate, getTranslation(language, 'intermediate'))}
          {renderLessons(advanced, getTranslation(language, 'advanced'))}
        </div>
      </ScrollArea>
    </div>
  );
}
