'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';

const themes = [
  { id: 'quiet-light', label: 'Quiet Light', icon: SunMedium },
  { id: 'nord', label: 'Nord', icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = useMemo(() => {
    return themes.find(t => t.id === theme) ?? themes[0];
  }, [theme]);

  if (!mounted) return null;

  const Icon = current.icon;
  const nextTheme = current.id === themes[0].id ? themes[1] : themes[0];

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme.id)}
      className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors duration-200 hover:bg-accent"
      title={`切换至 ${nextTheme.label}`}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{current.label}</span>
    </button>
  );
}
