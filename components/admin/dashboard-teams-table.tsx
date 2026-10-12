'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, generatePassword } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { createTeam } from '@/lib/actions/admin';
import {
  Search, Eye, EyeOff, Copy, Check, Download,
  CheckCircle2, Clock, KeyRound,
  Layers, Plus, RefreshCw, UserPlus, Users
} from 'lucide-react';

export interface DashboardTeamItem {
  id: string;
  team_code: string;
  team_name: string;
  plain_password?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  allocation: {
    id: string;
    locked_at: string;
    problem: {
      problem_code: string;
      title: string;
      category?: string;
    } | null;
  } | null;
}

export function AdminDashboardTeamsTable({
  teams,
}: {
  teams: DashboardTeamItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'selected' | 'pending'>('all');
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Team Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newMembers, setNewMembers] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copiedNewPwd, setCopiedNewPwd] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      // Filter tab
      if (filterState === 'selected' && !t.allocation) return false;
      if (filterState === 'pending' && t.allocation) return false;

      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchCode = t.team_code.toLowerCase().includes(q);
      const matchName = t.team_name.toLowerCase().includes(q);
      const matchProbCode = t.allocation?.problem?.problem_code?.toLowerCase().includes(q);
      const matchProbTitle = t.allocation?.problem?.title?.toLowerCase().includes(q);
      const matchCategory = t.allocation?.problem?.category?.toLowerCase().includes(q);

      return matchCode || matchName || matchProbCode || matchProbTitle || matchCategory;
    });
  }, [teams, search, filterState]);

  const allocatedCount = useMemo(() => teams.filter(t => !!t.allocation).length, [teams]);
  const pendingCount = teams.length - allocatedCount;

  function showBanner(message: string, ok: boolean) {
    setFeedback({ message, ok });
    setTimeout(() => setFeedback(null), 5000);
  }

  function togglePassword(id: string) {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function copyPassword(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null), 2000;
    });
  }

  function openAddTeamModal() {
    // Generate next suggested team code (e.g. TEAM-003)
    const count = teams.length + 1;
    const padded = String(count).padStart(3, '0');
    setNewTeamCode(`TEAM-${padded}`);
    setNewTeamName('');
    setNewPassword(generatePassword());
    setNewMembers('');
    setModalError(null);
    setShowCreateModal(true);
  }

  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setModalError(null);

    const membersArray = newMembers
      ? newMembers
          .split(',')
          .map(m => m.trim())
          .filter(Boolean)
          .map(name => ({ name }))
      : [];

    startTransition(async () => {
      const result = await createTeam({
        team_code: newTeamCode.trim().toUpperCase(),
        team_name: newTeamName.trim(),
        password: newPassword,
        members: membersArray,
      });

      if (result.success) {
        setShowCreateModal(false);
        showBanner(`Team "${newTeamCode.toUpperCase()}" created successfully with password "${newPassword}".`, true);
        router.refresh();
      } else {
        setModalError(result.message || 'Failed to create team.');
      }
    });
  }

  function exportCsv() {
    const headers = ['Team ID', 'Team Name', 'Password', 'Status', 'Selected Problem Code', 'Selected Problem Title', 'Locked At'];
    const rows = filteredTeams.map(t => [
      `"${t.team_code}"`,
      `"${t.team_name.replace(/"/g, '""')}"`,
      `"${(t.plain_password || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.allocation?.problem?.problem_code || 'None'}"`,
      `"${(t.allocation?.problem?.title || '').replace(/"/g, '""')}"`,
      `"${t.allocation ? formatDate(t.allocation.locked_at) : 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `npr_teams_passwords_statements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Feedback banner */}
      {feedback && (
        <div
          role="alert"
          className={`px-6 py-3 text-sm font-medium border-b flex items-center justify-between ${
            feedback.ok
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#1B2B6B]" />
            <h2 className="text-base font-bold text-gray-900">Teams, Passwords & Problem Allocations</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete list of all registered teams with access credentials and their selected problem statements.
          </p>
        </div>

        {/* Quick summary badges, Export CSV, and Add Team Button */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{allocatedCount} Selected</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending</span>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
            title="Export filtered teams with passwords to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openAddTeamModal}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-4 bg-[#F8FAFC] border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search team ID, team name, or problem code/title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter tabs */}
          <div className="inline-flex p-0.5 bg-gray-200 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({teams.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('selected')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'selected' ? 'bg-white text-[#1B2B6B] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Selected ({allocatedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterState('pending')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>

          {/* Global Show/Hide password toggle */}
          <button
            type="button"
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{showAllPasswords ? 'Hide All Passwords' : 'Show All Passwords'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Team</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Team Password</th>
              <th className="py-3 px-4">Selected Problem Statement</th>
              <th className="py-3 px-4 text-right">Selection Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-gray-300" />
                    <span>{search ? 'No teams match your search filter.' : 'No teams found.'}</span>
                    {!search && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={openAddTeamModal}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add First Team
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTeams.map(team => {
                const isPasswordVisible = showAllPasswords || !!visiblePasswords[team.id];
                const password = team.plain_password || null;

                return (
                  <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                    {/* Team ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1B2B6B] bg-[#E8EDF8] px-2 py-0.5 rounded border border-[#1B2B6B]/10">
                          {team.team_code}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm">{team.team_name}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={team.status} />
                    </td>

                    {/* Password with eye & copy button */}
                    <td className="py-3.5 px-4">
                      {password ? (
                        <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                          <span className="font-mono text-xs font-medium text-gray-800 select-all min-w-[80px]">
                            {isPasswordVisible ? password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePassword(team.id)}
                            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                            title={isPasswordVisible ? 'Hide password' : 'Show password'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyPassword(team.id, password)}
                            className="p-1 text-gray-400 hover:text-[#1B2B6B] transition-colors"
                            title="Copy password"
                          >
                            {copiedId === team.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-gray-300" />
                          Hashed / Reset to view
                        </span>
                      )}
                    </td>

                    {/* Selected Problem Statement */}
                    <td className="py-3.5 px-4">
                      {team.allocation?.problem ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-white bg-[#1B2B6B] px-2 py-0.5 rounded">
                              {team.allocation.problem.problem_code}
                            </span>
                            {team.allocation.problem.category && (
                              <span className="text-[10px] uppercase font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {team.allocation.problem.category}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-800 mt-1 line-clamp-1">
                            {team.allocation.problem.title}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Not selected yet</span>
                        </div>
                      )}
                    </td>

                    {/* Selection Time */}
                    <td className="py-3.5 px-4 text-right">
                      {team.allocation ? (
                        <span className="text-xs text-gray-500 font-mono">
                          {formatDate(team.allocation.locked_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Team Modal Dialog */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Team"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {modalError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3.5 py-2.5"
            >
              {modalError}
            </div>
          )}

          <div>
            <label htmlFor="modal_team_code" className="block text-xs font-semibold text-gray-700 mb-1">
              Team ID / Code *
            </label>
            <input
              id="modal_team_code"
              name="team_code"
              type="text"
              required
              value={newTeamCode}
              onChange={e => setNewTeamCode(e.target.value.toUpperCase())}
              placeholder="e.g. TEAM-001"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] uppercase font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">Unique identifier used by teams to log in.</p>
          </div>

          <div>
            <label htmlFor="modal_team_name" className="block text-xs font-semibold text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              id="modal_team_name"
              name="team_name"
              type="text"
              required
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              placeholder="e.g. Phoenix Innovators"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]"
            />
          </div>

          <div>
            <label htmlFor="modal_password" className="block text-xs font-semibold text-gray-700 mb-1">
              Password *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="modal_password"
                  name="password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Set or generate password"
                  className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewPassword(generatePassword())}
                title="Generate secure random password"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Generate
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(newPassword);
                  setCopiedNewPwd(true);
                  setTimeout(() => setCopiedNewPwd(false), 2000);
                }}
                title="Copy password"
              >
                {copiedNewPwd ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="modal_members" className="block text-xs font-semibold text-gray-700 mb-1">
              Members (Optional)
            </label>
            <input
              id="modal_members"
              name="members"
              type="text"
              value={newMembers}
              onChange={e => setNewMembers(e.target.value)}
              placeholder="e.g. John Doe, Jane Smith, Alex Ray (comma separated)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]"
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Create Team
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
