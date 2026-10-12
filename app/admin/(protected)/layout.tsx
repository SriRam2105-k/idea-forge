import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar active="layout" adminName={session.displayName} />
      {children}
    </div>
  );
}
