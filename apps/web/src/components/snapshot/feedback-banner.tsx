'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { HINT_BANNER_BASE_CLASS } from './hints-theme';

type Variant = 'error' | 'info' | 'success' | 'warn';

export function FeedbackBanner({
  variant = 'info',
  message,
  retryLabel,
  onRetry,
  className = '',
}: {
  variant?: Variant;
  message: React.ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const styles =
    variant === 'error'
      ? 'text-destructive bg-destructive/5 border border-destructive/30'
      : variant === 'success'
        ? 'text-green-700 bg-green-50 border border-green-200'
        : variant === 'warn'
          ? 'text-amber-700 bg-amber-50 border border-amber-200'
          : 'text-muted-foreground bg-muted/20 border';

  return (
    <div
      className={`flex items-center justify-between ${HINT_BANNER_BASE_CLASS} ${styles} ${className}`}
    >
      <span className="truncate">{message}</span>
      {onRetry && (
        <Button
          variant="outline-subtle"
          size="sm"
          className="h-6 px-2 ml-2 flex-shrink-0"
          onClick={onRetry}
        >
          {retryLabel || '重试'}
        </Button>
      )}
    </div>
  );
}
