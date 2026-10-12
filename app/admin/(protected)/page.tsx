import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import {
  Users, FileText, CheckCircle2, Lock,
  ArrowRight
} from 'lucide-react';
import { AdminDashboardTeamsTable } from '@/components/admin/dashboard-teams-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getDashboardData() {
  const supabase = createAdminClient();
  const [
    { count: totalTeams },
    { count: activeTeams },
    { count: totalProblems },
    { count: publishedProblems },
    { count: totalAllocations },
    { data: teamsData },
    { data: allocationsData },
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('problems').select('*', { count: 'exact', head: true }),
    supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
    supabase.from('allocations').select('*', { count: 'exact', head: true }),
    supabase
      .from('teams')
      .select('id, team_code, team_name, plain_password, status, created_at')
      .order('team_code', { ascending: true }),
    supabase
      .from('allocations')
      .select(`
        id, team_id, locked_at,
        problems (problem_code, title, category)
      `),
  ]);

  interface AllocationRecord {
    id: string;
    team_id: string;
    locked_at: string;
    problems: {
      problem_code: string;
      title: string;
      category?: string;
    } | null;
  }

  const allocationMap = new Map<string, { id: string; locked_at: string; problem: AllocationRecord['problems'] }>(
    ((allocationsData as unknown as AllocationRecord[]) || []).map((a) => [
      a.team_id,
      {
        id: a.id,
        locked_at: a.locked_at,
        problem: a.problems,
      },
    ])
  );

  interface TeamRecord {
    id: string;
    team_code: string;
    team_name: string;
    plain_password?: string | null;
    status: 'active' | 'inactive';
    created_at: string;
  }

  const teamsWithAllocations = ((teamsData as unknown as TeamRecord[]) || []).map((t) => ({
    ...t,
    allocation: allocationMap.get(t.id) || null,
  }));

  return {
    stats: {
      totalTeams: totalTeams || 0,
      activeTeams: activeTeams || 0,
      totalProblems: totalProblems || 0,
      publishedProblems: publishedProblems || 0,
      availableProblems: (publishedProblems || 0) - (totalAllocations || 0),
      lockedProblems: totalAllocations || 0,
    },
    teams: teamsWithAllocations,
  };
}

export default async function AdminDashboardPage() {
  const { stats, teams } = await getDashboardData();

  return (
    <main className="flex-1 p-6 lg:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time overview of teams, credentials, and problem statement allocations</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/teams"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Users className="w-4 h-4 text-[#1B2B6B]" />
              Manage Teams
            </Link>
            <Link
              href="/admin/allocations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B2B6B] rounded-lg hover:bg-[#1B2B6B]/90 transition-colors shadow-sm"
            >
              <span>Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Teams"
            value={stats.totalTeams}
            sub={`${stats.activeTeams} active`}
            color="navy"
          />
          <StatCard
            icon={FileText}
            label="Total Problems"
            value={stats.totalProblems}
            sub={`${stats.publishedProblems} published`}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Available Problems"
            value={stats.availableProblems}
            sub="open for selection"
            color="green"
          />
          <StatCard
            icon={Lock}
            label="Locked Statements"
            value={stats.lockedProblems}
            sub="teams allocated"
            color="orange"
          />
        </div>

        {/* Teams with Passwords and Selected Statements */}
        <AdminDashboardTeamsTable teams={teams} />
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  color: 'navy' | 'blue' | 'green' | 'orange';
}) {
  const colors = {
    navy:   'bg-[#E8EDF8] text-[#1B2B6B]',
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs font-medium text-gray-700 mt-0.5">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

