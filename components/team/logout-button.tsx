'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutTeam } from '@/lib/actions/team-auth';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  variant?: 'dark' | 'light' | 'danger';
  className?: string;
  showText?: boolean;
}

export function LogoutButton({
  variant = 'dark',
  className,
  showText = true,
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutTeam();
    } catch (err: unknown) {
      const error = err as { message?: string; digest?: string };
      if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith?.('NEXT_REDIRECT')) {
        throw err;
      }
      // Fallback in case of navigation interception
      router.push('/team/login');
      router.refresh();
    }
  }

  const variantStyles = {
    dark: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm',
    light: 'bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 shadow-sm',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400',
        variantStyles[variant],
        className
      )}
      aria-label="Logout from team session"
    >
      <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
      {showText && (loading ? 'Logging out…' : 'Logout')}
    </button>
  );
}
