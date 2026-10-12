import { getAdminSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminTeamsClient } from '@/components/admin/teams-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTeams() {
  const supabase = createAdminClient();
  const [{ data: teams }, { data: allocations }] = await Promise.all([
    supabase
      .from('teams')
      .select('id, team_code, team_name, plain_password, members, status, created_at')
      .order('team_code', { ascending: true }),
    supabase.from('allocations').select('team_id, problems(problem_code, title)'),
  ]);

  const allocationMap = new Map(
    (allocations || []).map((a: { team_id: string; problems: unknown }) => [a.team_id, a.problems])
  );

  return (teams || []).map(t => ({
    ...t,
    allocation: (allocationMap.get(t.id) as { problem_code: string; title: string }) || null,
  }));
}

export default async function AdminTeamsPage() {
  const session = await getAdminSession();
  const teams = await getTeams();

  return (
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm text-gray-500 mt-1">{teams.length} teams registered</p>
          </div>
          <AdminTeamsClient initialTeams={teams} adminUsername={session?.username || 'admin'} />
        </div>
      </main>
  );
}

