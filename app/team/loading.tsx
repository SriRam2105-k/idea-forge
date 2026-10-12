import { Loader2 } from 'lucide-react';

export default function TeamLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2B6B]" />
        <p className="text-sm font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );
}
