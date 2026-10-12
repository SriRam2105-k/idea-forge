import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getTeamSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';
import { LockProblemButton } from '@/components/team/lock-problem-button';
import { LogoutButton } from '@/components/team/logout-button';
import { DifficultyBadge, Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Lock, ChevronRight, ExternalLink, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ code: string }>;
}

async function getTeamProblemData(code: string, teamId: string) {
  const supabase = createAdminClient();

  const [{ data: problem }, { data: teamAllocation }, { data: problemAllocation }] = await Promise.all([
    supabase
      .from('problems')
      .select('*')
      .eq('problem_code', code.toUpperCase())
      .eq('status', 'PUBLISHED')
      .single(),
    supabase
      .from('allocations')
      .select('id, locked_at, problem_id, problems(problem_code, title)')
      .eq('team_id', teamId)
      .single(),
    supabase
      .from('allocations')
      .select('id')
      .eq('problem_id', (await supabase
        .from('problems')
        .select('id')
        .eq('problem_code', code.toUpperCase())
        .single()
      ).data?.id || '')
      .single(),
  ]);

  return {
    problem,
    teamAllocation,
    isProblemLocked: !!problemAllocation,
    teamAlreadyHasSelection: !!teamAllocation,
  };
}

export default async function TeamProblemDetailPage({ params }: Props) {
  const { code } = await params;
  const session = await getTeamSession();
  if (!session) redirect('/team/login');

  const { problem, teamAllocation, isProblemLocked, teamAlreadyHasSelection } = await getTeamProblemData(code, session.teamId);

  if (!problem) notFound();

  const isTheirProblem = teamAllocation && (teamAllocation.problem_id === problem.id || (teamAllocation.problems as unknown as { problem_code: string })?.problem_code === problem.problem_code);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1B2B6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/team" className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[#F5C518] text-xs">{problem.problem_code}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-blue-300 font-mono">{session.teamCode}</span>
            <LogoutButton variant="dark" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="text-xs font-mono font-bold text-[#1B2B6B] bg-[#E8EDF8] px-3 py-1 rounded-lg">
                  {problem.problem_code}
                </span>
                <div>
                  {isTheirProblem ? (
                    <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> Your Selection</Badge>
                  ) : isProblemLocked ? (
                    <Badge variant="error"><Lock className="w-3 h-3" /> Locked</Badge>
                  ) : (
                    <Badge variant="success">Available</Badge>
                  )}
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h1>
              <p className="text-sm text-gray-600">{problem.short_description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="navy">{problem.category}</Badge>
                <DifficultyBadge difficulty={problem.difficulty} />
                {problem.tags?.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem description */}
            {problem.description && (
              <ContentSection title="Problem Statement">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{problem.description}</div>
              </ContentSection>
            )}

            {problem.expected_outcome && (
              <ContentSection title="Expected Outcome">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{problem.expected_outcome}</div>
              </ContentSection>
            )}

            {problem.constraints && (
              <ContentSection title="Constraints &amp; Requirements">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{problem.constraints}</div>
              </ContentSection>
            )}

            {problem.resources?.length > 0 && (
              <ContentSection title="References">
                <ul className="space-y-2">
                  {problem.resources.map((r: { label: string; url: string }, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-[#1B2B6B]" />
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1B2B6B] hover:underline">
                        {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Lock / status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {isTheirProblem && teamAllocation ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900 text-sm mb-1">Your Selection</h2>
                  <p className="text-xs text-gray-500">Locked {formatDate(teamAllocation.locked_at)}</p>
                </div>
              ) : teamAlreadyHasSelection ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900 text-sm mb-1">Already Selected</h2>
                  <p className="text-xs text-gray-500 mb-3">Your team has already selected a different problem.</p>
                  <Link href="/team" className="text-xs text-[#1B2B6B] hover:underline">← Back to Dashboard</Link>
                </div>
              ) : isProblemLocked ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900 text-sm mb-1">Already Locked</h2>
                  <p className="text-xs text-gray-500 mb-3">This problem has been selected by another team.</p>
                  <Link href="/team" className="text-xs text-[#1B2B6B] hover:underline">Browse other problems</Link>
                </div>
              ) : (
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm mb-3">Select This Problem</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    You can select only one problem. Once locked, contact the organizer to change your selection.
                  </p>
                  <LockProblemButton
                    problemId={problem.id}
                    problemCode={problem.problem_code}
                    problemTitle={problem.title}
                  />
                </div>
              )}
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Info</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500">Category</dt>
                  <dd className="text-sm font-medium text-gray-900">{problem.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Difficulty</dt>
                  <dd><DifficultyBadge difficulty={problem.difficulty} /></dd>
                </div>
                {problem.recommended_technologies?.length > 0 && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1.5">Recommended Technologies</dt>
                    <dd className="flex flex-wrap gap-1">
                      {problem.recommended_technologies.map((tech: string) => (
                        <span key={tech} className="text-xs bg-[#E8EDF8] text-[#1B2B6B] px-2 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}
