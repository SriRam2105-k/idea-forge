'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProblem, updateProblem, publishProblem,
  unpublishProblem, deleteProblem
} from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Dialog, ConfirmDialog } from '@/components/ui/dialog';
import { StatusBadge, DifficultyBadge, Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, EyeOff, Trash2, Edit2, Lock } from 'lucide-react';
import type { Problem } from '@/types';

interface ProblemRow extends Problem {
  allocation: { team_code: string; team_name: string } | null;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['AI/ML', 'Web', 'IoT', 'Cybersecurity', 'Blockchain', 'Health', 'Sustainability', 'Other'];

export function AdminProblemsClient({ initialProblems }: { initialProblems: ProblemRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editProblem, setEditProblem] = useState<ProblemRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProblemRow | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);

  const filtered = useMemo(() =>
    initialProblems.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problem_code.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ),
    [initialProblems, search]
  );

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ message: msg, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSubmitProblem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      problem_code: fd.get('problem_code') as string,
      title: fd.get('title') as string,
      short_description: fd.get('short_description') as string,
      description: fd.get('description') as string,
      category: fd.get('category') as string,
      difficulty: fd.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
      tags: (fd.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      expected_outcome: fd.get('expected_outcome') as string,
      recommended_technologies: (fd.get('recommended_technologies') as string).split(',').map(t => t.trim()).filter(Boolean),
      constraints: fd.get('constraints') as string,
      resources: [],
      status: fd.get('status') as 'DRAFT' | 'PUBLISHED',
    };

    if (editProblem) {
      const result = await updateProblem(editProblem.id, input);
      if (result.success) {
        setEditProblem(null);
        showFeedback('Problem updated.', true);
        router.refresh();
      } else {
        showFeedback(result.message, false);
      }
    } else {
      const result = await createProblem(input);
      if (result.success) {
        setShowCreate(false);
        showFeedback('Problem created.', true);
        router.refresh();
      } else {
        showFeedback(result.message, false);
      }
    }
  }

  async function handleTogglePublish(problem: ProblemRow) {
    const fn = problem.status === 'PUBLISHED' ? unpublishProblem : publishProblem;
    const result = await fn(problem.id);
    if (result.success) {
      showFeedback(problem.status === 'PUBLISHED' ? 'Problem unpublished.' : 'Problem published.', true);
      router.refresh();
    } else {
      showFeedback(result.message, false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    const result = await deleteProblem(deleteConfirm.id);
    if (result.success) {
      setDeleteConfirm(null);
      showFeedback('Problem deleted.', true);
      router.refresh();
    } else {
      showFeedback(result.message, false);
      setDeleteConfirm(null);
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

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search problems…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]"
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Add Problem
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Allocation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                    {search ? 'No problems match your search.' : 'No problems yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-[#1B2B6B] bg-[#E8EDF8] px-2 py-0.5 rounded">
                        {p.problem_code}
                      </span>
                    </td>
                    <td className="font-medium text-gray-900 text-sm max-w-[200px] truncate">{p.title}</td>
                    <td><Badge variant="navy">{p.category}</Badge></td>
                    <td><DifficultyBadge difficulty={p.difficulty} /></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      {p.allocation ? (
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-mono text-red-700">{(p.allocation as { team_code: string }).team_code}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditProblem(p)}
                          className="p-1.5 rounded text-gray-400 hover:text-[#1B2B6B] hover:bg-[#E8EDF8] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`p-1.5 rounded transition-colors ${
                            p.status === 'PUBLISHED'
                              ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        >
                          {p.status === 'PUBLISHED' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {!p.allocation && (
                          <button
                            onClick={() => setDeleteConfirm(p)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreate || !!editProblem}
        onClose={() => { setShowCreate(false); setEditProblem(null); }}
        title={editProblem ? `Edit: ${editProblem.problem_code}` : 'Add Problem'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitProblem} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Code *</label>
              <input name="problem_code" required defaultValue={editProblem?.problem_code} placeholder="PS-001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] uppercase" style={{ textTransform: 'uppercase' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={editProblem?.status || 'DRAFT'} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" required defaultValue={editProblem?.title} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <input name="short_description" required defaultValue={editProblem?.short_description} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" required defaultValue={editProblem?.category || ''} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
              <select name="difficulty" required defaultValue={editProblem?.difficulty || ''} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]">
                <option value="">Select…</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input name="tags" defaultValue={editProblem?.tags?.join(', ')} placeholder="AI, IoT, Security" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
            <textarea name="description" required rows={4} defaultValue={editProblem?.description} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] resize-y" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Outcome</label>
            <textarea name="expected_outcome" rows={2} defaultValue={editProblem?.expected_outcome} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] resize-y" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Constraints &amp; Requirements</label>
            <textarea name="constraints" rows={2} defaultValue={editProblem?.constraints} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] resize-y" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Technologies (comma-separated)</label>
            <input name="recommended_technologies" defaultValue={editProblem?.recommended_technologies?.join(', ')} placeholder="Python, TensorFlow, React" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setEditProblem(null); }}>Cancel</Button>
            <Button type="submit" variant="primary">{editProblem ? 'Save Changes' : 'Create Problem'}</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Problem"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
