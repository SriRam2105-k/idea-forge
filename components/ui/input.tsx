import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ── Input ──────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'block w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors duration-150',
          'placeholder:text-gray-400 text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B]',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300 hover:border-gray-400',
          className
        )}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// ── Textarea ────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'block w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors duration-150 resize-y min-h-[100px]',
          'placeholder:text-gray-400 text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B]',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300 hover:border-gray-400',
          className
        )}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p id={`${id}-error`} className="text-xs text-red-600" role="alert">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'block w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B]',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300 hover:border-gray-400',
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
