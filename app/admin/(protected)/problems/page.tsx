import { createAdminClient } from '@/lib/supabase/server';
import { AdminProblemsClient } from '@/components/admin/problems-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProblems() {
  const supabase = createAdminClient();
  const [{ data: problems }, { data: allocations }] = await Promise.all([
    supabase.from('problems').select('*').order('problem_code', { ascending: true }),
    supabase.from('allocations').select('problem_id, teams(team_code, team_name)'),
  ]);

  const allocationMap = new Map(
    (allocations || []).map((a: { problem_id: string; teams: unknown }) => [a.problem_id, a.teams])
  );

  return (problems || []).map(p => ({
    ...p,
    allocation: allocationMap.get(p.id) || null,
  }));
}

export default async function AdminProblemsPage() {
  const problems = await getProblems();

  return (
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Problem Management</h1>
            <p className="text-sm text-gray-500 mt-1">{problems.length} problems total</p>
          </div>
          <AdminProblemsClient initialProblems={problems} />
        </div>
      </main>
  );
}

