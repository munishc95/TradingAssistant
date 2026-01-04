import { clsx } from 'clsx';

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'green' | 'red' | 'yellow' }) {
  const palette: Record<string, string> = {
    gray: 'bg-gray-800 text-gray-200',
    green: 'bg-emerald-700 text-emerald-100',
    red: 'bg-red-700 text-red-100',
    yellow: 'bg-yellow-700 text-yellow-100',
  };
  return <span className={clsx('px-2 py-1 text-xs rounded-md font-semibold', palette[color])}>{children}</span>;
}
