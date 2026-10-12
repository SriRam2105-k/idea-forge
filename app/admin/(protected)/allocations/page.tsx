import { getAdminSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminAllocationsClient } from '@/components/admin/allocations-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllocations() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('allocations')
    .select(`
      id, locked_at, created_at,
      teams (id, team_code, team_name),
      problems (id, problem_code, title, category, difficulty)
    `)
    .order('locked_at', { ascending: false });

  return (data || []) as unknown as Array<{
    id: string;
    locked_at: string;
    created_at: string;
    teams: { id: string; team_code: string; team_name: string };
    problems: { id: string; problem_code: string; title: string; category: string; difficulty: string };
  }>;
}

export default async function AdminAllocationsPage() {
  const session = await getAdminSession();
  const allocations = await getAllocations();

  return (
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Allocation Management</h1>
            <p className="text-sm text-gray-500 mt-1">{allocations.length} active allocation{allocations.length !== 1 ? 's' : ''}</p>
          </div>
          <AdminAllocationsClient initialAllocations={allocations} adminUsername={session?.username || 'admin'} />
        </div>
      </main>
  );
}

