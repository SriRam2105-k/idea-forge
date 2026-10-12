'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { createTeamSession, clearTeamSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import type { ApiResponse } from '@/types';

export async function loginTeam(
  prevState: ApiResponse | null,
  formData: FormData
): Promise<ApiResponse<{ teamCode: string; teamName: string }>> {
  const teamCode = (formData.get('team_code') as string)?.trim().toUpperCase();
  const password = (formData.get('password') as string) || '';

  if (!teamCode || !password) {
    return { success: false, error: 'VALIDATION', message: 'Team ID and password are required.' };
  }

  // Rate limiting would be added here via a server-side cache/Redis in production
  // For now, we rely on Supabase's connection limits and the generic error message

  try {
    const supabase = createAdminClient();
    const { data: team, error } = await supabase
      .from('teams')
      .select('id, team_code, team_name, password_hash, status')
      .eq('team_code', teamCode)
      .single();

    if (error || !team) {
      // Generic message — do not reveal whether team exists
      return { success: false, error: 'AUTH_FAILED', message: 'Invalid Team ID or password.' };
    }

    if (team.status !== 'active') {
      return { success: false, error: 'AUTH_FAILED', message: 'Invalid Team ID or password.' };
    }

    const passwordMatch = await bcrypt.compare(password, team.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'AUTH_FAILED', message: 'Invalid Team ID or password.' };
    }

    await createTeamSession({
      teamId: team.id,
      teamCode: team.team_code,
      teamName: team.team_name,
    });

    return { success: true, data: { teamCode: team.team_code, teamName: team.team_name } };
  } catch {
    return { success: false, error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' };
  }
}

export async function logoutTeam(): Promise<void> {
  await clearTeamSession();
  redirect('/team/login');
}
