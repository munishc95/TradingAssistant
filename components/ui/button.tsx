'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const base = 'px-3 py-2 rounded-lg text-sm font-semibold transition-colors';
    const styles =
      variant === 'primary'
        ? 'bg-accent text-white hover:bg-purple-500'
        : 'border border-gray-700 bg-surface text-gray-200 hover:border-accent';
    return <button ref={ref} className={clsx(base, styles, className)} {...props} />;
  },
);
Button.displayName = 'Button';
export { Button };
