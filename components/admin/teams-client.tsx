'use client';

import { useState, useMemo, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTeam, importTeams, updateTeam, resetTeamPassword } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/badge';
import { generatePassword } from '@/lib/utils';
import {
  Plus, Search, Upload, RefreshCw, UserCheck, UserX,
  KeyRound, Eye, EyeOff, Copy, Check
} from 'lucide-react';
import Papa from 'papaparse';

interface TeamRow {
  id: string;
  team_code: string;
  team_name: string;
  plain_password?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  allocation: { problem_code: string; title: string } | null;
}

export function AdminTeamsClient({
  initialTeams,
  adminUsername,
}: {
  initialTeams: TeamRow[];
  adminUsername: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showReset, setShowReset] = useState<TeamRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() =>
    initialTeams.filter(t =>
      t.team_code.toLowerCase().includes(search.toLowerCase()) ||
      t.team_name.toLowerCase().includes(search.toLowerCase())
    ),
    [initialTeams, search]
  );

  function showFeedback(message: string, ok: boolean) {
    setFeedback({ message, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  function toggleTeamPassword(id: string) {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function copyTeamPassword(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedTeamId(id);
    setTimeout(() => setCopiedTeamId(null), 2000);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = await createTeam({
      team_code: fd.get('team_code') as string,
      team_name: fd.get('team_name') as string,
      password: fd.get('password') as string,
    });
    if (result.success) {
      setShowCreate(false);
      showFeedback('Team created successfully.', true);
      router.refresh();
    } else {
      showFeedback(result.message, false);
    }
  }

  async function handleToggleStatus(team: TeamRow) {
    const result = await updateTeam(team.id, {
      status: team.status === 'active' ? 'inactive' : 'active',
    });
    if (result.success) {
      showFeedback(`Team ${team.status === 'active' ? 'disabled' : 'enabled'}.`, true);
      router.refresh();
    } else {
      showFeedback(result.message, false);
    }
  }

  async function handleResetPassword() {
    if (!showReset || !newPassword) return;
    const result = await resetTeamPassword(showReset.id, newPassword);
    if (result.success) {
      setShowReset(null);
      setNewPassword('');
      showFeedback('Password reset successfully.', true);
    } else {
      showFeedback(result.message, false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Array<{ team_code: string; team_name: string; password: string }>;
        const validRows = rows.filter(r => r.team_code && r.team_name && r.password);
        if (validRows.length === 0) {
          showFeedback('No valid rows found. CSV must have team_code, team_name, password columns.', false);
          return;
        }
        const result = await importTeams(validRows);
        if (result.success) {
          const { created, errors } = result.data;
          showFeedback(
            `Imported ${created} team(s).${errors.length > 0 ? ` ${errors.length} error(s).` : ''}`,
            errors.length === 0
          );
          setShowImport(false);
          router.refresh();
        } else {
          showFeedback(result.message, false);
        }
      },
    });
    e.target.value = '';
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Feedback */}
      {feedback && (
        <div
          role="alert"
          className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            feedback.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          } animate-fade-in`}
        >
          {feedback.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search teams…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B]"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            Add Team
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Password</th>
                <th>Problem Selected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    {search ? 'No teams match your search.' : 'No teams yet. Add one to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map(team => {
                  const isVisible = !!visiblePasswords[team.id];
                  const pwd = team.plain_password;

                  return (
                    <tr key={team.id}>
                      <td>
                        <span className="font-mono text-xs font-semibold text-[#1B2B6B] bg-[#E8EDF8] px-2 py-0.5 rounded">
                          {team.team_code}
                        </span>
                      </td>
                      <td className="font-medium text-gray-900 text-sm">{team.team_name}</td>
                      <td><StatusBadge status={team.status} /></td>
                      <td>
                        {pwd ? (
                          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs">
                            <span className="font-mono text-gray-800">
                              {isVisible ? pwd : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleTeamPassword(team.id)}
                              className="text-gray-400 hover:text-gray-600 p-0.5"
                              title={isVisible ? 'Hide' : 'Show'}
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyTeamPassword(team.id, pwd)}
                              className="text-gray-400 hover:text-[#1B2B6B] p-0.5"
                              title="Copy"
                            >
                              {copiedTeamId === team.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Hashed</span>
                        )}
                      </td>
                      <td>
                        {team.allocation ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-semibold text-[#1B2B6B]">
                              {(team.allocation as { problem_code: string }).problem_code}
                            </span>
                            <span className="text-xs text-gray-600 line-clamp-1">
                              {(team.allocation as { title: string }).title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Not selected
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setNewPassword(generatePassword());
                              setShowReset(team);
                            }}
                            className="p-1.5 rounded text-gray-400 hover:text-[#1B2B6B] hover:bg-[#E8EDF8] transition-colors"
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(team)}
                            className={`p-1.5 rounded transition-colors ${
                              team.status === 'active'
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={team.status === 'active' ? 'Disable team' : 'Enable team'}
                          >
                            {team.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create team dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Add Team" maxWidth="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="team_code" className="block text-sm font-medium text-gray-700 mb-1">Team ID *</label>
            <input id="team_code" name="team_code" required placeholder="TEAM-001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] uppercase" style={{ textTransform: 'uppercase' }} />
          </div>
          <div>
            <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <input id="team_name" name="team_name" required placeholder="Team Phoenix" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="flex gap-2">
              <input id="password" name="password" required placeholder="Enter password" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]" />
              <Button type="button" variant="outline" size="sm" onClick={() => {
                const input = document.getElementById('password') as HTMLInputElement;
                if (input) input.value = generatePassword();
              }}>
                Generate
              </Button>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Team</Button>
          </div>
        </form>
      </Dialog>

      {/* Reset password dialog */}
      {showReset && (
        <Dialog open={!!showReset} onClose={() => setShowReset(null)} title={`Reset Password — ${showReset.team_code}`} maxWidth="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Set a new password for <strong>{showReset.team_name}</strong>.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setNewPassword(generatePassword())}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(newPassword)}>
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowReset(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleResetPassword} disabled={!newPassword}>Reset Password</Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Import CSV dialog */}
      <Dialog open={showImport} onClose={() => setShowImport(false)} title="Import Teams from CSV" maxWidth="sm">
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Required CSV columns:</p>
            <code className="text-xs text-[#1B2B6B]">team_code, team_name, password</code>
          </div>
          <p className="text-sm text-gray-500">Rows with duplicate team codes will be skipped. Invalid rows will be reported.</p>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportFile}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4" />
              Choose CSV File
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
