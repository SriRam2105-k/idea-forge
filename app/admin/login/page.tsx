'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin } from '@/lib/actions/admin-auth';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import type { ApiResponse } from '@/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ApiResponse | null, FormData>(loginAdmin, null);

  useEffect(() => {
    if (state?.success) router.push('/admin');
  }, [state, router]);

  const errorMessage = state && !state.success ? state.message : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-[#1B2B6B] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">NPR</span>
        </div>
        <div>
          <div className="text-sm font-bold text-[#1B2B6B]">NPR College</div>
          <div className="text-[10px] text-gray-500">Hackathon Portal</div>
        </div>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm animate-fade-in-scale">
        <div className="w-12 h-12 bg-[#E8EDF8] rounded-xl flex items-center justify-center mx-auto mb-5">
          <Shield className="w-6 h-6 text-[#1B2B6B]" />
        </div>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Organizer access only</p>
        </div>

        {errorMessage && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            {errorMessage}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              autoComplete="username"
              autoFocus
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] placeholder:text-gray-400"
              placeholder="admin"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full mt-2">
            {isPending ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Or</span>
          </div>
        </div>

        <Link
          href="/team/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
        >
          ← Back to Team Login
        </Link>
      </div>
    </div>
  );
}

