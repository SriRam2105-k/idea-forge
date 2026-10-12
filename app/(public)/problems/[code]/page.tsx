import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { DifficultyBadge, Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Lock, LogIn, Tag, ChevronRight,
  ExternalLink, CheckCircle2, AlertCircle
} from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ code: string }>;
}

async function getProblemWithStatus(code: string) {
  const supabase = createAdminClient();
  const { data: problem } = await supabase
    .from('problems')
    .select('*')
    .eq('problem_code', code.toUpperCase())
    .eq('status', 'PUBLISHED')
    .single();

  if (!problem) return null;

  const { data: allocation } = await supabase
    .from('allocations')
    .select('id')
    .eq('problem_id', problem.id)
    .single();

  return { ...problem, is_locked: !!allocation };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const problem = await getProblemWithStatus(code);
  if (!problem) return { title: 'Problem Not Found' };

  return {
    title: `${problem.problem_code} — ${problem.title}`,
    description: problem.short_description,
    openGraph: {
      title: `${problem.problem_code}: ${problem.title}`,
      description: problem.short_description,
      type: 'article',
    },
  };
}

export default async function ProblemDetailPage({ params }: Props) {
  const { code } = await params;
  const problem = await getProblemWithStatus(code);

  if (!problem) notFound();

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/problems" className="hover:text-[#1B2B6B] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Problem Statements
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-mono text-[#1B2B6B] font-semibold">{problem.problem_code}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-xs font-mono font-bold text-[#1B2B6B] bg-[#E8EDF8] px-3 py-1 rounded-lg">
                    {problem.problem_code}
                  </span>
                  {problem.is_locked ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Available
                    </span>
                  )}
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h1>
                <p className="text-sm text-gray-600 mb-4">{problem.short_description}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="navy">{problem.category}</Badge>
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.tags?.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Problem statement */}
              <Section title="Problem Statement">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {problem.description}
                </div>
              </Section>

              {/* Expected outcome */}
              {problem.expected_outcome && (
                <Section title="Expected Outcome">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{problem.expected_outcome}</div>
                </Section>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <Section title="Constraints &amp; Requirements">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{problem.constraints}</div>
                </Section>
              )}

              {/* Resources */}
              {problem.resources && problem.resources.length > 0 && (
                <Section title="References &amp; Resources">
                  <ul className="space-y-2">
                    {problem.resources.map((r: { label: string; url: string }, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-[#1B2B6B] flex-shrink-0" />
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#1B2B6B] hover:underline"
                        >
                          {r.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Info</h2>
                <dl className="space-y-3">
                  <InfoRow label="Category" value={problem.category} />
                  <InfoRow label="Difficulty">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </InfoRow>
                  {problem.recommended_technologies?.length > 0 && (
                    <div>
                      <dt className="text-xs text-gray-500 mb-1.5">Technologies</dt>
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

              {/* CTA card */}
              <div className={`rounded-xl border p-5 ${problem.is_locked ? 'bg-red-50 border-red-200' : 'bg-[#1B2B6B] border-[#1B2B6B]'}`}>
                {problem.is_locked ? (
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-red-900 text-sm mb-1">Problem Locked</h3>
                    <p className="text-xs text-red-700">This problem has already been selected by another team.</p>
                    <Link
                      href="/problems"
                      className="mt-4 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-medium"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Browse other problems
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <CheckCircle2 className="w-8 h-8 text-[#F5C518] mx-auto mb-2" />
                    <h3 className="font-semibold text-white text-sm mb-1">Available</h3>
                    <p className="text-xs text-blue-200 mb-4">Login as a team to select this problem.</p>
                    <Link
                      href={`/team/login?redirect=/problems/${problem.problem_code}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#F5C518] text-[#1B2B6B] font-semibold rounded-lg hover:bg-[#D4A800] transition-colors text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      Login to Choose
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{children || value}</dd>
    </div>
  );
}
