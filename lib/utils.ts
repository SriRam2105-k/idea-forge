import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(date));
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':   return 'text-green-700 bg-green-50 border-green-200';
    case 'Medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'Hard':   return 'text-red-700 bg-red-50 border-red-200';
    default:       return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

export function getDifficultyDots(difficulty: string): number {
  switch (difficulty) {
    case 'Easy':   return 1;
    case 'Medium': return 2;
    case 'Hard':   return 3;
    default:       return 1;
  }
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

export function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
