"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Moon, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = [
  { id: "quiet-light", label: "Quiet Light", icon: SunMedium },
  { id: "nord", label: "Nord", icon: Moon },
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
    <Button
      type="button"
      size="sm"
      variant="outline-subtle"
      onClick={() => setTheme(nextTheme.id)}
      className="h-8 px-3 gap-2"
      title={`切换至 ${nextTheme.label}`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{current.label}</span>
    </Button>
  );
}
