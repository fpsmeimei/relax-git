'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import { HINT_INLINE_CONTAINER_CLASS, HINT_TEXT_CLASS } from './hints-theme';

export function LoadingHint({
  message,
  withSpinner = true,
  className = '',
  iconClassName = 'h-4 w-4',
}: {
  message: React.ReactNode;
  withSpinner?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`${HINT_TEXT_CLASS} ${HINT_INLINE_CONTAINER_CLASS} ${className}`}
    >
      {withSpinner && <Loader2 className={`${iconClassName} animate-spin`} />}
      <span className="truncate">{message}</span>
    </div>
  );
}
