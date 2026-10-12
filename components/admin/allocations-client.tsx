'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { releaseAllocation } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { DifficultyBadge, Badge } from '@/components/ui/badge';
import { Search, Trash2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AllocationRow {
  id: string;
  locked_at: string;
  teams: { id: string; team_code: string; team_name: string };
  problems: { id: string; problem_code: string; title: string; category: string; difficulty: string };
}

export function AdminAllocationsClient({
  initialAllocations,
  adminUsername,
}: {
  initialAllocations: AllocationRow[];
  adminUsername: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [releaseTarget, setReleaseTarget] = useState<AllocationRow | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);

  const filtered = useMemo(() =>
    initialAllocations.filter(a =>
      a.teams.team_code.toLowerCase().includes(search.toLowerCase()) ||
      a.teams.team_name.toLowerCase().includes(search.toLowerCase()) ||
      a.problems.problem_code.toLowerCase().includes(search.toLowerCase()) ||
      a.problems.title.toLowerCase().includes(search.toLowerCase())
    ),
    [initialAllocations, search]
  );

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ message: msg, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleRelease() {
    if (!releaseTarget) return;
    setReleasing(true);
    const result = await releaseAllocation(releaseTarget.id);
    setReleasing(false);
    if (result.success) {
      setReleaseTarget(null);
      showFeedback('Allocation released. The problem is now available.', true);
      router.refresh();
    } else {
      setReleaseTarget(null);
      showFeedback(result.message, false);
    }
  }

  return (
    <div>
      {feedback && (
        <div role="alert" className={`mb-4 px-4 py-3 rounded-lg text-sm border animate-fade-in ${
          feedback.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by team or problem…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {search ? 'No allocations match your search.' : 'No allocations yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Problem</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Locked At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{a.teams.team_name}</div>
                      <div className="text-xs font-mono text-gray-500">{a.teams.team_code}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#1B2B6B] bg-[#E8EDF8] px-2 py-0.5 rounded">
                          {a.problems.problem_code}
                        </span>
                        <span className="text-sm text-gray-700 max-w-[160px] truncate">{a.problems.title}</span>
                      </div>
                    </td>
                    <td><Badge variant="navy">{a.problems.category}</Badge></td>
                    <td><DifficultyBadge difficulty={a.problems.difficulty} /></td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(a.locked_at)}</td>
                    <td>
                      <button
                        onClick={() => setReleaseTarget(a)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!releaseTarget}
        onClose={() => setReleaseTarget(null)}
        onConfirm={handleRelease}
        loading={releasing}
        title="Release Allocation"
        message={
          releaseTarget
            ? `This will release "${releaseTarget.problems.title}" from ${releaseTarget.teams.team_name}. The problem will become available for other teams to select.`
            : ''
        }
        confirmLabel="Release Allocation"
        confirmVariant="danger"
      />
    </div>
  );
}
