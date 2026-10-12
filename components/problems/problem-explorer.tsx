'use client';

import { useState, useMemo, useCallback } from 'react';
import { ProblemCard } from '@/components/problems/problem-card';
import { ProblemCardSkeleton } from '@/components/ui/skeleton';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Problem } from '@/types';

interface ProblemExplorerProps {
  problems: Array<Problem & { is_locked: boolean }>;
  basePath?: string; // '/problems' for public, '/team' for team
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export function ProblemExplorer({ problems, basePath = '/problems' }: ProblemExplorerProps) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [availability, setAvailability] = useState('All');

  const hasFilters = search || difficulty !== 'All' || availability !== 'All';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return problems.filter(p => {
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.problem_code.toLowerCase().includes(q) &&
        !p.short_description.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.tags.some(t => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      if (availability === 'Available' && p.is_locked) return false;
      if (availability === 'Locked' && !p.is_locked) return false;
      return true;
    });
  }, [problems, search, difficulty, availability]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setDifficulty('All');
    setAvailability('All');
  }, []);

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search by title, code, or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] placeholder:text-gray-400"
              aria-label="Search problems"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">

            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] bg-white"
              aria-label="Filter by difficulty"
            >
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
            </select>

            <select
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-[#1B2B6B] bg-white"
              aria-label="Filter by availability"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Locked">Locked</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {filtered.length === 0
            ? 'No problems found'
            : `${filtered.length} problem${filtered.length === 1 ? '' : 's'} found`}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Available: {problems.filter(p => !p.is_locked).length}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" /> Locked: {problems.filter(p => p.is_locked).length}</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No problems match your filters</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting or clearing your search filters.</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((problem, i) => (
            <div key={problem.id} className={`animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
              <ProblemCard
                problem={problem}
                isLocked={problem.is_locked}
                href={`${basePath}/${problem.problem_code}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
