import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { ProblemExplorer } from '@/components/problems/problem-explorer';
import type { Problem } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Problem Statements',
  description: 'Browse all published problem statements for the NPR Hackathon 2025. Filter by category, difficulty, and availability.',
};

async function getProblemsWithLockStatus(): Promise<Array<Problem & { is_locked: boolean }>> {
  try {
    const supabase = createAdminClient();
    const [{ data: problems, error: problemsError }, { data: allocations, error: allocError }] = await Promise.all([
      supabase
        .from('problems')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('problem_code', { ascending: true }),
      supabase
        .from('allocations')
        .select('problem_id'),
    ]);

    if (problemsError) {
      console.error('Error fetching problems from Supabase:', problemsError);
      return [];
    }
    if (allocError) {
      console.error('Error fetching allocations from Supabase:', allocError);
    }
    if (!problems) return [];

    const lockedIds = new Set((allocations || []).map(a => a.problem_id));
    return problems.map(p => ({ ...p, is_locked: lockedIds.has(p.id) }));
  } catch (error) {
    console.error('Exception in getProblemsWithLockStatus():', error);
    return [];
  }
}

export default async function ProblemsPage() {
  const problems = await getProblemsWithLockStatus();

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900">Problem Statements</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse all {problems.length} published problem statements. Login as a team to select one.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProblemExplorer problems={problems} basePath="/problems" />
        </div>
      </main>
  );
}

