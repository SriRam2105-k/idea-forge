import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase/server';
import { ArrowRight } from 'lucide-react';
import { ProblemCard } from '@/components/problems/problem-card';



async function getStats() {
  try {
    const supabase = createAdminClient();
    const [{ count: teamCount }, { count: problemCount }, { count: allocCount }] = await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
      supabase.from('allocations').select('*', { count: 'exact', head: true }),
    ]);
    return {
      teams: teamCount || 0,
      problems: problemCount || 0,
      locked: allocCount || 0,
    };
  } catch (error) {
    console.error('Error in getStats():', error);
    return { teams: 0, problems: 0, locked: 0 };
  }
}

async function getPreviewProblems() {
  try {
    const supabase = createAdminClient();
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('problem_code', { ascending: true })
      .limit(6);

    if (problemsError) {
      console.error('Error fetching preview problems:', problemsError);
      return [];
    }
    if (!problems) return [];

    const { data: allocations, error: allocError } = await supabase.from('allocations').select('problem_id');
    if (allocError) {
      console.error('Error fetching allocations for preview:', allocError);
    }
    const lockedIds = new Set((allocations || []).map(a => a.problem_id));

    return problems.map(p => ({ ...p, is_locked: lockedIds.has(p.id) }));
  } catch (error) {
    console.error('Exception in getPreviewProblems():', error);
    return [];
  }
}

export default async function LandingPage() {
  const [stats, previewProblems] = await Promise.all([getStats(), getPreviewProblems()]);

  // Configurable asset path for the bulb illustration.
  // When the image is ready, set this to the correct path (e.g., '/images/hackathon-bulb.png')
  const bulbImagePath = "/bulb-image.png";

  return (
    <>
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80%] sm:w-[60%] h-[240px] sm:h-[400px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 right-0 w-full h-full fill-[#F5C518] opacity-60 sm:opacity-100">
            <path d="M50,0 C100,0 100,50 100,100 L100,0 Z" />
          </svg>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 right-0 w-[90%] h-[90%] fill-[#1B2B6B] opacity-80 sm:opacity-100">
            <path d="M60,0 C100,0 100,40 100,80 L100,0 Z" />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-[60%] sm:w-[40%] h-[240px] sm:h-[400px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 right-0 w-full h-full fill-[#F5C518] opacity-50 sm:opacity-100">
            <path d="M100,100 C50,100 0,100 0,50 L100,50 Z" transform="scale(1, -1) translate(0, -100)" />
          </svg>
        </div>
      </div>

      <main className="flex-grow flex flex-col relative z-10">
        {/* Hero Section */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-6 min-h-0 lg:min-h-[calc(100dvh-168px)] flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-8 items-center w-full">
            <div className="animate-fade-in max-w-xl">
              <div className="text-xs sm:text-sm md:text-[16px] font-bold tracking-widest text-[#F5C518] uppercase mb-2 sm:mb-4">
                HACKATHON 2025
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold text-[#1B2B6B] leading-[1.12] sm:leading-[1.1] mb-3 sm:mb-4 tracking-tight">
                Build Today,<br />
                Solve Tomorrow
              </h1>
              <p className="text-gray-600 text-base sm:text-lg lg:text-[18px] mb-6 sm:mb-8 max-w-xl leading-relaxed">
                Explore {stats.problems || '50'}+ problem statements, choose the one that inspires you, and make an impact.
              </p>
              <div className="mb-8 sm:mb-10">
                <Link
                  href="/problems"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#1B2B6B] text-white font-semibold rounded-full hover:bg-[#142055] transition-all duration-200 shadow-lg shadow-[#1B2B6B]/20 hover:-translate-y-0.5 text-base active:scale-[0.98]"
                >
                  <span>Explore Problem Statements</span>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" />
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-2">
                {/* Stat 1 */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-0 bg-[#F8FAFC] sm:bg-transparent rounded-xl sm:rounded-none border border-gray-100 sm:border-0 shadow-xs sm:shadow-none">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#E8EDF8] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B2B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#1B2B6B] leading-none">{stats.problems || '50'}+</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Problem Statements</div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-0 bg-[#F8FAFC] sm:bg-transparent rounded-xl sm:rounded-none border border-gray-100 sm:border-0 shadow-xs sm:shadow-none">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#E8EDF8] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B2B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#1B2B6B] leading-none">{stats.teams || '48'}+</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Teams</div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-0 bg-[#F8FAFC] sm:bg-transparent rounded-xl sm:rounded-none border border-gray-100 sm:border-0 shadow-xs sm:shadow-none">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#E8EDF8] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B2B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#1B2B6B] leading-none">One</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Problem per Team</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lightbulb Illustration */}
            <div className="flex justify-center items-center relative h-[260px] sm:h-[340px] lg:h-[450px] mt-4 sm:mt-8 lg:mt-0 max-w-full overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">

                {/* Soft circular shapes behind the illustration */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px] bg-[#F8FAFC] rounded-full opacity-80 mix-blend-multiply"></div>
                  <div className="absolute w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] lg:w-[300px] lg:h-[300px] bg-[#E8EDF8] rounded-full opacity-60"></div>
                </div>

                {/* Decorative abstract curves */}
                <svg className="absolute w-full h-full pointer-events-none z-0 max-w-[450px]" viewBox="0 0 500 500" fill="none">
                  {/* Left Yellow swoop */}
                  <path d="M 80 200 C 0 300, 100 450, 250 450" stroke="#F5C518" strokeWidth="12" strokeLinecap="round" className="opacity-80" />
                  {/* Top Right Blue swoop */}
                  <path d="M 300 80 C 450 100, 480 250, 400 350" stroke="#1B2B6B" strokeWidth="12" strokeLinecap="round" className="opacity-80" />
                  {/* Stars */}
                  <path d="M 400 120 L 405 140 L 425 145 L 405 150 L 400 170 L 395 150 L 375 145 L 395 140 Z" fill="#F5C518" />
                  <path d="M 120 150 L 123 160 L 133 163 L 123 166 L 120 176 L 117 166 L 107 163 L 117 160 Z" fill="#F5C518" />
                </svg>

                {/* Configurable Image or Placeholder */}
                <div className="relative z-10 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] lg:w-[300px] lg:h-[300px] flex items-center justify-center">
                  {bulbImagePath ? (
                    <Image
                      src={bulbImagePath}
                      alt="Hackathon Bulb"
                      fill
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 260px, 300px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E8EDF8] rounded-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1B2B6B]/30 shadow-sm">
                      <div className="w-12 h-12 mb-3 text-[#1B2B6B]/40">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <span className="text-[#1B2B6B] font-medium text-center text-xs sm:text-sm">
                        Bulb illustration goes here
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Problem Statement Preview */}
        <section className="w-full bg-white py-12 sm:py-16 lg:py-24 border-t border-gray-100 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-npr-navy rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 shadow-xl border border-npr-navy-dark">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                    Explore <span className="text-npr-gold">Problem Statements</span>
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-blue-100 max-w-2xl">
                    Discover challenges across technology, innovation, sustainability, and more.
                  </p>
                </div>
                <Link
                  href="/problems"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#F5C518] transition-colors group text-sm sm:text-base self-start sm:self-auto py-1"
                >
                  <span>View All Problem Statements</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {previewProblems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {previewProblems.map((problem) => (
                    <ProblemCard
                      key={problem.id}
                      problem={problem as any}
                      isLocked={problem.is_locked}
                      href={`/problems/${problem.problem_code}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/10 rounded-2xl border border-white/20">
                  <p className="text-white text-base sm:text-lg font-medium">No problem statements available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="about" className="w-full bg-gray-50 py-12 sm:py-16 lg:py-24 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B2B6B] mb-8 sm:mb-12 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-white sm:bg-transparent rounded-2xl sm:rounded-none border border-gray-100 sm:border-0 shadow-xs sm:shadow-none">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8EDF8] text-[#1B2B6B] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1B2B6B] mb-2 sm:mb-3">1. Explore</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Browse through {stats.problems || '50'}+ problem statements and find the one that inspires your team.</p>
              </div>
              <div className="text-center p-6 bg-white sm:bg-transparent rounded-2xl sm:rounded-none border border-gray-100 sm:border-0 shadow-xs sm:shadow-none">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8EDF8] text-[#1B2B6B] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1B2B6B] mb-2 sm:mb-3">2. Lock</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Login with your team credentials and lock your chosen problem. One problem per team.</p>
              </div>
              <div className="text-center p-6 bg-white sm:bg-transparent rounded-2xl sm:rounded-none border border-gray-100 sm:border-0 shadow-xs sm:shadow-none">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8EDF8] text-[#1B2B6B] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1B2B6B] mb-2 sm:mb-3">3. Build</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Collaborate, innovate, and build your solution during the hackathon.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full bg-[#1B2B6B] py-12 sm:py-16 lg:py-20 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Get in Touch</h2>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 max-w-2xl leading-relaxed">
              For further updates and doubt classification, contact the hackathon club members.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

