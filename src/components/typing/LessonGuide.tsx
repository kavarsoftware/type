'use client';

import { useTypingStore } from '@/store/typing-store';
import { getKeyForArabic, isArabicText } from '@/lib/typing/arabicTransliteration';
import type { Lesson } from '@/lib/typing/types';

const fingers = [
  { keys: '`1qaz', en: 'Left little finger', ar: 'الخنصر الأيسر' },
  { keys: '2wsx', en: 'Left ring finger', ar: 'البنصر الأيسر' },
  { keys: '3edc', en: 'Left middle finger', ar: 'الوسطى اليسرى' },
  { keys: '45rtfgvb', en: 'Left index finger', ar: 'السبابة اليسرى' },
  { keys: '67yuhjnm', en: 'Right index finger', ar: 'السبابة اليمنى' },
  { keys: '8ik,', en: 'Right middle finger', ar: 'الوسطى اليمنى' },
  { keys: '9ol.', en: 'Right ring finger', ar: 'البنصر الأيمن' },
  { keys: "0p;/-=[]\\'", en: 'Right little finger', ar: 'الخنصر الأيمن' },
];

export function LessonGuide({ lesson, exerciseIndex }: { lesson: Lesson; exerciseIndex: number }) {
  const { language, currentText, typedText } = useTypingStore();
  const arabic = language === 'ar';
  const next = currentText[typedText.length] || '';
  const key = isArabicText(currentText) ? getKeyForArabic(next)?.key || next : next.toLowerCase();
  const finger = fingers.find(f => f.keys.includes(key));
  const needsShift = !isArabicText(currentText) && next !== next.toLowerCase();
  return (
    <section className="mx-auto mb-6 w-full max-w-4xl rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <span className="font-semibold">{lesson.title}</span>
        <span>{arabic ? 'تمرين' : 'Exercise'} {exerciseIndex + 1} / {lesson.content.length} · {arabic ? 'الهدف: دقة ٩٠٪' : 'Goal: 90% accuracy'}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${(exerciseIndex + typedText.length / currentText.length) / lesson.content.length * 100}%` }} /></div>
      <p className="text-sm text-muted-foreground">{arabic ? 'اجلس باستقامة، أرخِ يديك وانظر إلى الشاشة. لوحة العربية هنا تستخدم الحروف الصوتية الإنجليزية الموضحة أدناه.' : 'Sit upright, relax your hands, and look at the screen. Rest your fingers on A S D F and J K L ;. Return to the home row after each reach.'}</p>
      <div className="flex items-center gap-4" aria-live="polite">
        <kbd className="min-w-12 rounded-lg border bg-background px-3 py-2 text-center text-xl font-bold">{next === ' ' ? '␣' : next.toUpperCase()}</kbd>
        <div>
          <p className="font-semibold">{next === ' ' ? (arabic ? 'اضغط المسافة بإبهامك' : 'Press Space with your thumb') : finger ? (arabic ? finger.ar : finger.en) : (arabic ? 'استخدم المفتاح الموضح أدناه' : 'Use the highlighted key below')}</p>
          <p className="text-xs text-muted-foreground">{needsShift ? (arabic ? 'اضغط Shift باليد المقابلة' : 'Hold Shift with the opposite hand.') : (arabic ? 'الدقة أولاً، ستتحسن السرعة مع التدريب.' : 'Take your time. Speed will come with practice.')}</p>
        </div>
      </div>
    </section>
  );
}
