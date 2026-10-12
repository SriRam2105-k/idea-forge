'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/team/logout-button';

interface PublicNavProps {
  session?: {
    teamCode: string;
    teamName: string;
  } | null;
}

const navLinks = [
  { href: '/',         label: 'Home'     },
  { href: '/#about',   label: 'About'    },
  { href: '/#contact', label: 'Contact'  },
];

export function PublicNav({ session }: PublicNavProps = {}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[80px] flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 focus-visible:outline-none rounded">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 flex-shrink-0 shadow-md rounded-full overflow-hidden">
              <Image src="/npr new logo.png" alt="NPR Logo" fill sizes="48px" priority className="object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[17px] font-bold text-[#1B2B6B] leading-tight tracking-wide">NPR</div>
              <div className="text-[13px] font-bold text-[#1B2B6B] leading-tight tracking-wide">COLLEGE OF ENGINEERING</div>
              <div className="text-[9px] font-semibold text-[#F5C518] leading-tight tracking-wider uppercase mt-0.5">(An Autonomous Institution)</div>
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors duration-150',
                pathname === link.href || link.href === '/' // assuming we are on home
                  ? 'text-[#1B2B6B] font-semibold'
                  : 'text-gray-500 hover:text-[#1B2B6B]'
              )}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <div className="ml-4 flex items-center gap-3">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B2B6B] text-white text-sm font-semibold rounded-full hover:bg-[#142055] transition-colors duration-150 shadow-md hover:shadow-lg focus-visible:outline-none"
              >
                <span>Dashboard</span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-mono">{session.teamCode}</span>
              </Link>
              <LogoutButton variant="light" />
            </div>
          ) : (
            <Link
              href="/team/login"
              className="ml-4 inline-flex items-center justify-center px-8 py-2.5 bg-[#1B2B6B] text-white text-sm font-semibold rounded-full hover:bg-[#142055] transition-colors duration-150 shadow-md hover:shadow-lg focus-visible:outline-none"
            >
              Team Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in shadow-lg absolute w-full">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href || link.href === '/'
                    ? 'bg-[#E8EDF8] text-[#1B2B6B]'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {session ? (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="px-4 py-2.5 bg-[#E8EDF8] rounded-lg">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Logged in as</div>
                  <div className="text-sm font-bold text-[#1B2B6B] truncate mt-0.5">{session.teamName}</div>
                  <div className="text-xs text-blue-700 font-mono mt-0.5">{session.teamCode}</div>
                </div>
                <Link
                  href="/team"
                  className="block px-4 py-3 bg-[#1B2B6B] text-white rounded-lg text-sm font-semibold text-center hover:bg-[#142055] transition-colors shadow-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Go to Team Dashboard
                </Link>
                <div className="pt-1 flex justify-center">
                  <LogoutButton variant="light" className="w-full justify-center py-2.5" />
                </div>
              </div>
            ) : (
              <Link
                href="/team/login"
                className="block px-4 py-3 bg-[#1B2B6B] text-white rounded-lg text-sm font-semibold text-center hover:bg-[#142055] transition-colors mt-4"
                onClick={() => setMenuOpen(false)}
              >
                Team Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
