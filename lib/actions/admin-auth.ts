'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { createAdminSession, clearAdminSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import type { ApiResponse } from '@/types';

export async function loginAdmin(
  prevState: ApiResponse | null,
  formData: FormData
): Promise<ApiResponse<{ username: string; displayName: string }>> {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string) || '';

  if (!username || !password) {
    return { success: false, error: 'VALIDATION', message: 'Username and password are required.' };
  }

  try {
    const supabase = createAdminClient();
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, display_name, password_hash, role, status')
      .ilike('username', username)
      .single();

    if (error || !admin) {
      return { success: false, error: 'AUTH_FAILED', message: 'Invalid credentials.' };
    }

    if (admin.status !== 'active') {
      return { success: false, error: 'AUTH_FAILED', message: 'Invalid credentials.' };
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'AUTH_FAILED', message: 'Invalid credentials.' };
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: admin.username,
      actor_type: 'admin',
      action: 'ADMIN_LOGIN',
      entity_type: 'admin',
      entity_id: admin.id,
      metadata: { username: admin.username },
    });

    await createAdminSession({
      adminId: admin.id,
      username: admin.username,
      displayName: admin.display_name,
      role: admin.role,
    });

    return { success: true, data: { username: admin.username, displayName: admin.display_name } };
  } catch {
    return { success: false, error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' };
  }
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect('/admin/login');
}
