'use client';

import { Badge } from '@/components/ui/badge';
import { Globe, Eye, Lock } from 'lucide-react';

type RepositoryVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';

interface VisibilityBadgeProps {
  visibility: RepositoryVisibility;
  className?: string;
}

const visibilityConfig = {
  PUBLIC: {
    label: '全部公开',
    icon: Globe,
    variant: 'default' as const,
    className:
      'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-500/20',
  },
  INTERNAL: {
    label: '仅可查看',
    icon: Eye,
    variant: 'secondary' as const,
    className:
      'bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20',
  },
  PRIVATE: {
    label: '私有',
    icon: Lock,
    variant: 'destructive' as const,
    className:
      'bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 border-red-500/20',
  },
};

export function VisibilityBadge({
  visibility,
  className,
}: VisibilityBadgeProps) {
  const config = visibilityConfig[visibility];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className || ''}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
