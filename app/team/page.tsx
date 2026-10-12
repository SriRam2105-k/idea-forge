import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTeamSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/team/logout-button';
import { ProblemExplorer } from '@/components/problems/problem-explorer';
import { DifficultyBadge, Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  CheckCircle2, Clock, AlertCircle, ArrowRight, Lock
} from 'lucide-react';
import type { Problem } from '@/types';

async function getTeamDashboardData(teamId: string) {
  const supabase = createAdminClient();

  const [{ data: allocation }, { data: problems }, { data: allocations }] = await Promise.all([
    // Team's allocation with problem details
    supabase
      .from('allocations')
      .select(`
        id, locked_at,
        problems (
          id, problem_code, title, short_description, category, difficulty, tags,
          description, expected_outcome, recommended_technologies, constraints, resources
        )
      `)
      .eq('team_id', teamId)
      .single(),

    // All published problems
    supabase
      .from('problems')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('problem_code', { ascending: true }),

    // All allocations (to mark locked problems)
    supabase.from('allocations').select('problem_id'),
  ]);

  const lockedIds = new Set((allocations || []).map((a: { problem_id: string }) => a.problem_id));
  const problemsWithStatus: Array<Problem & { is_locked: boolean }> = (problems || []).map(p => ({
    ...p,
    is_locked: lockedIds.has(p.id),
  }));

  return { allocation, problems: problemsWithStatus };
}

export default async function TeamDashboardPage() {
  const session = await getTeamSession();
  if (!session) redirect('/team/login');

  const { allocation, problems } = await getTeamDashboardData(session.teamId);
  const hasSelection = !!allocation;
  const selectedProblem = allocation?.problems as unknown as Problem | null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Team header */}
      <header className="bg-[#1B2B6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">NPR</span>
            </div>
            <div>
              <span className="text-sm font-semibold">{session.teamName}</span>
              <span className="text-xs text-blue-300 ml-2">({session.teamCode})</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection status */}
        {hasSelection && selectedProblem ? (
          <SelectedProblemCard
            allocation={allocation}
            problem={selectedProblem}
          />
        ) : (
          <NoSelectionBanner />
        )}

        {/* Problem explorer */}
        {!hasSelection && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Browse Problem Statements</h2>
              <span className="text-sm text-gray-500">{problems.filter(p => !p.is_locked).length} available</span>
            </div>
            <ProblemExplorer problems={problems} basePath="/team/problems" />
          </div>
        )}
      </div>
    </div>
  );
}

function NoSelectionBanner() {
  return (
    <div className="bg-white rounded-xl border border-[#1B2B6B]/20 border-dashed p-8 text-center">
      <div className="w-14 h-14 bg-[#E8EDF8] rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-7 h-7 text-[#1B2B6B]" />
      </div>
      <h1 className="text-lg font-bold text-gray-900 mb-2">You haven&apos;t selected a problem yet</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Browse the problem statements below and lock the one that best fits your team&apos;s skills. You can select only one.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B2B6B] text-white text-sm font-medium rounded-lg">
        Browse below to choose
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}

function SelectedProblemCard({
  allocation,
  problem,
}: {
  allocation: { id: string; locked_at: string };
  problem: Problem;
}) {
  return (
    <div className="space-y-4">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-900">Problem selected!</p>
          <p className="text-xs text-green-700 mt-0.5">
            Contact the organizer if you need to change your selection.
          </p>
        </div>
      </div>

      {/* Selected problem card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#1B2B6B] bg-[#E8EDF8] px-2.5 py-1 rounded-lg">
              {problem.problem_code}
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">{problem.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{problem.short_description}</p>
          </div>
          <Lock className="w-5 h-5 text-[#1B2B6B] flex-shrink-0 mt-1" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="navy">{problem.category}</Badge>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            Locked {formatDate(allocation.locked_at)}
          </div>
          <Link
            href={`/team/problems/${problem.problem_code}`}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#1B2B6B] text-white text-sm font-medium rounded-lg hover:bg-[#2D3E8C] transition-colors"
          >
            View Problem
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

