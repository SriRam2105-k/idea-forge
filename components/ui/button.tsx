import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary:   'bg-[#1B2B6B] text-white hover:bg-[#2D3E8C] active:bg-[#112057] focus-visible:ring-[#1B2B6B] shadow-sm',
    secondary: 'bg-[#F5C518] text-[#1B2B6B] hover:bg-[#D4A800] active:bg-[#C09700] focus-visible:ring-[#F5C518] shadow-sm font-semibold',
    gold:      'bg-[#F5C518] text-[#1B2B6B] hover:bg-[#D4A800] active:bg-[#C09700] focus-visible:ring-[#F5C518] shadow-sm font-semibold',
    outline:   'border border-[#1B2B6B] text-[#1B2B6B] hover:bg-[#E8EDF8] active:bg-[#D5DDF5] focus-visible:ring-[#1B2B6B]',
    ghost:     'text-[#1B2B6B] hover:bg-[#F0F4FF] active:bg-[#E8EDF8] focus-visible:ring-[#1B2B6B]',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
