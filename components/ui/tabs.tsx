'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { clsx } from 'clsx';

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={clsx(
      'inline-flex h-10 items-center justify-center rounded-lg bg-surface p-1 text-sm font-medium text-gray-300 shadow-inner border border-gray-800',
      className,
    )}
    {...props}
  />
);
export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={clsx(
      'inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-white',
      className,
    )}
    {...props}
  />
);
export const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={clsx('mt-4', className)} {...props} />
);
