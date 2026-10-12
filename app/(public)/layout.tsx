import { PublicNav } from '@/components/layout/public-nav';
import { Footer } from '@/components/layout/footer';
import { getTeamSession } from '@/lib/auth/session';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getTeamSession();

  return (
    <div className="flex flex-col bg-white relative min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden overflow-x-hidden">
      <div className="relative z-50 flex-shrink-0">
        <PublicNav session={session ? { teamCode: session.teamCode, teamName: session.teamName } : null} />
      </div>
      <div className="flex-grow flex flex-col relative z-10 lg:overflow-y-auto overflow-x-hidden">
        {children}
      </div>
      <div className="flex-shrink-0 z-10">
        <Footer />
      </div>
    </div>
  );
}
