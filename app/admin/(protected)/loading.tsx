import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <main className="flex-1 p-6 lg:p-8 overflow-auto flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2B6B]" />
        <p className="text-sm font-medium">Loading data…</p>
      </div>
    </main>
  );
}
