"use client";

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Language = 'en' | 'ur';

interface LanguageToggleProps {
  en: ReactNode;
  ur: ReactNode;
  className?: string;
}

export function LanguageToggle({ en, ur, className }: LanguageToggleProps) {
  const [lang, setLang] = useState<Language>('en');

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        <Button variant={lang === 'en' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLang('en')}>English</Button>
        <Button variant={lang === 'ur' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLang('ur')}>اردو</Button>
      </div>
      <div className={cn("p-4 rounded-md bg-muted/50 border text-sm", lang === 'ur' && 'text-right font-code')}>
        {lang === 'en' ? en : ur}
      </div>
    </div>
  );
}
