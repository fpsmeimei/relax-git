'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type TabsContextType = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState<string>(defaultValue || '');
  const isControlled = value !== undefined;
  const current = isControlled ? (value as string) : internal;

  const ctx = useMemo<TabsContextType>(
    () => ({
      value: current,
      setValue: (v: string) => {
        if (!isControlled) setInternal(v);
        onValueChange?.(v);
      },
    }),
    [current, isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div role="tablist" className={className}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...rest
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');
  const selected = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      data-state={selected ? 'active' : 'inactive'}
      className={
        'px-3 py-2 text-sm border-b-2 transition-colors ' +
        (selected
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground') +
        (className ? ' ' + className : '')
      }
      onClick={() => ctx.setValue(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');
  const selected = ctx.value === value;

  return (
    <div
      role="tabpanel"
      hidden={!selected}
      className={className}
      aria-labelledby={`tab-${value}`}
    >
      {selected ? children : null}
    </div>
  );
}
