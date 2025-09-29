'use client';

import React from 'react';
import { HINT_TEXT_CLASS } from './hints-theme';

export function EmptyHint({
  message,
  className = '',
}: {
  message: React.ReactNode;
  className?: string;
}) {
  return <div className={`${HINT_TEXT_CLASS} ${className}`}>{message}</div>;
}
