'use client';

import { useActionState, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginTeam } from '@/lib/actions/team-auth';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ArrowLeft, Lock, Shield } from 'lucide-react';
import type { ApiResponse } from '@/types';

function TeamLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/team';

  const [state, formAction, isPending] = useActionState<ApiResponse | null, FormData>(loginTeam, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      router.push(redirect);
    }
  }, [state, router, redirect]);

  const errorMessage = state && !state.success ? state.message : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B2B6B] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">NPR</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#1B2B6B]">NPR College</div>
              <div className="text-[10px] text-gray-500">Hackathon Portal</div>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#1B2B6B] transition-colors bg-gray-100 hover:bg-gray-200 px-2 sm:px-2.5 py-1.5 rounded-md"
            >
              <Shield className="w-3.5 h-3.5 text-[#1B2B6B]" />
              <span className="hidden xs:inline">Admin Login</span>
              <span className="xs:hidden">Admin</span>
            </Link>
            <Link href="/" className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back to Home</span>
              <span className="xs:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Login card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-fade-in-scale">
            {/* Icon */}
            <div className="w-12 h-12 bg-[#E8EDF8] rounded-xl flex items-center justify-center mx-auto mb-5">
              <Lock className="w-6 h-6 text-[#1B2B6B]" />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-gray-900">Team Login</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your team credentials to continue</p>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5"
              >
                {errorMessage}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="team_code" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Team ID
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="team_code"
                    name="team_code"
                    placeholder="e.g. TEAM-001"
                    required
                    autoComplete="username"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] placeholder:text-gray-400 uppercase"
                    style={{ textTransform: 'uppercase' }}
                    aria-describedby={errorMessage ? 'login-error' : undefined}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isPending}
                className="w-full mt-2"
              >
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
              href="/admin/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              <Shield className="w-4 h-4 text-[#1B2B6B]" />
              Login as Organizer / Admin
            </Link>

            <p className="text-center text-xs text-gray-500 mt-6">
              For password issues, contact the organizer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading...</div>}>
      <TeamLoginContent />
    </Suspense>
  );
}

