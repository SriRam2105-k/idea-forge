import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'navy' | 'gold';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error:   'bg-red-50 text-red-700 border-red-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    navy:    'bg-[#E8EDF8] text-[#1B2B6B] border-[#1B2B6B]/20',
    gold:    'bg-[#FEF3C7] text-[#92400E] border-[#F5C518]/40',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface DifficultyBadgeProps {
  difficulty: string;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const dots = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;
  const colors = {
    Easy:   'bg-green-50 text-green-700 border-green-200',
    Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Hard:   'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
      )}
    >
      <span className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              i <= dots ? 'opacity-100' : 'opacity-25',
              difficulty === 'Easy' ? 'bg-green-600' :
              difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
            )}
          />
        ))}
      </span>
      {difficulty}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'PUBLISHED' | 'DRAFT' | 'available' | 'locked' | 'active' | 'inactive';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    PUBLISHED: { label: 'Published', variant: 'success' as const },
    DRAFT:     { label: 'Draft',     variant: 'warning' as const },
    available: { label: 'Available', variant: 'success' as const },
    locked:    { label: 'Locked',    variant: 'error' as const },
    active:    { label: 'Active',    variant: 'success' as const },
    inactive:  { label: 'Inactive',  variant: 'default' as const },
  };

  const { label, variant } = map[status] || { label: status, variant: 'default' as const };

  return <Badge variant={variant}>{label}</Badge>;
}
