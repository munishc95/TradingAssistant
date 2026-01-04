'use client';

import { clsx } from 'clsx';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: ReactNode;
};

export function Tabs({ defaultValue, value, onValueChange, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;

  const ctx = useMemo<TabsContextValue>(
    () => ({
      value: selected,
      setValue: (v) => {
        setInternal(v);
        onValueChange?.(v);
      },
    }),
    [selected, onValueChange],
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

type TabsListProps = {
  className?: string;
  children: ReactNode;
};

export const TabsList = ({ className, children }: TabsListProps) => (
  <div
    className={clsx(
      'inline-flex h-10 items-center justify-center rounded-lg bg-surface p-1 text-sm font-medium text-gray-300 shadow-inner border border-gray-800',
      className,
    )}
  >
    {children}
  </div>
);

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');
  const active = ctx.value === value;
  return (
    <button
      type="button"
      data-state={active ? 'active' : 'inactive'}
      onClick={() => ctx.setValue(value)}
      className={clsx(
        'inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        active ? 'bg-accent text-white' : 'text-gray-300 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );
};

type TabsContentProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');
  if (ctx.value !== value) return null;
  return <div className={clsx('mt-4', className)}>{children}</div>;
};
