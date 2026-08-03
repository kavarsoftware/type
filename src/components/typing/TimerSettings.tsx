'use client';

import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTypingStore } from '@/store/typing-store';
import { getTranslation } from '@/lib/i18n/translations';
import type { TimerMode, TimerSettings } from '@/lib/typing/types';
import { cn } from '@/lib/utils';

interface TimerSettingsProps {
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
}

export function TimerSettings({ settings, onSettingsChange }: TimerSettingsProps) {
  const { language } = useTypingStore();

  const timerOptions: { mode: TimerMode; labelKey: any }[] = [
    { mode: 'none', labelKey: 'noTimer' },
    { mode: '1min', labelKey: 'oneMin' },
    { mode: '5min', labelKey: 'fiveMin' },
    { mode: 'custom', labelKey: 'customTimer' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="w-4 h-4" />
        {getTranslation(language, 'timerSettings')}
      </div>
      <div className="flex flex-wrap gap-2">
        {timerOptions.map((option) => (
          <Button
            key={option.mode}
            variant={settings.mode === option.mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSettingsChange({ ...settings, mode: option.mode })}
            className={cn(
              "transition-all",
              settings.mode === option.mode && "shadow-md"
            )}
          >
            {getTranslation(language, option.labelKey)}
          </Button>
        ))}
      </div>
      {settings.mode === 'custom' && (
        <div className="flex items-center gap-3 mt-2">
          <Label htmlFor="custom-time" className="text-sm text-muted-foreground whitespace-nowrap">
            {getTranslation(language, 'seconds')}:
          </Label>
          <Input
            id="custom-time"
            type="number"
            min={10}
            max={3600}
            value={settings.customSeconds || 60}
            onChange={(e) => onSettingsChange({
              ...settings,
              customSeconds: Math.max(10, Math.min(3600, parseInt(e.target.value) || 60))
            })}
            className="w-24"
          />
        </div>
      )}
    </div>
  );
}
