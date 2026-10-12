import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DifficultyBadge, Badge } from '@/components/ui/badge';
import { Lock, ArrowRight, Tag } from 'lucide-react';
import type { Problem } from '@/types';

interface ProblemCardProps {
  problem: Problem;
  isLocked?: boolean;
  href: string;
  className?: string;
}

export function ProblemCard({ problem, isLocked = false, href, className }: ProblemCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block bg-white rounded-xl border border-gray-200 p-5',
        'card-hover cursor-pointer no-underline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B6B] focus-visible:ring-offset-2',
        isLocked && 'opacity-75',
        className
      )}
      aria-label={`${problem.title} — ${isLocked ? 'Locked' : 'Available'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-mono font-semibold text-[#1B2B6B] bg-[#E8EDF8] px-2 py-0.5 rounded">
          {problem.problem_code}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLocked ? (
            <Badge variant="error">
              <Lock className="w-3 h-3" />
              Locked
            </Badge>
          ) : (
            <Badge variant="success">Available</Badge>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug group-hover:text-[#1B2B6B] transition-colors duration-150">
        {problem.title}
      </h3>

      {/* Short description */}
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
        {problem.short_description}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge variant="navy">{problem.category}</Badge>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      {/* Tags */}
      {problem.tags && problem.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-gray-400 flex-shrink-0" />
          {problem.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {problem.tags.length > 4 && (
            <span className="text-xs text-gray-400">+{problem.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer arrow */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
        <span className="text-xs text-[#1B2B6B] font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-150">
          View details
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
