'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getTeamSession } from '@/lib/auth/session';
import type { ApiResponse, LockResult } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Atomically lock a problem for the authenticated team.
 * Calls the PostgreSQL `lock_problem` function which handles
 * all validation and race conditions within a single transaction.
 */
export async function lockProblem(problemId: string): Promise<ApiResponse<LockResult>> {
  const session = await getTeamSession();
  if (!session) {
    return { success: false, error: 'UNAUTHENTICATED', message: 'You must be logged in to select a problem.' };
  }

  if (!problemId) {
    return { success: false, error: 'VALIDATION', message: 'Problem ID is required.' };
  }

  try {
    const supabase = createAdminClient();

    // Call the atomic PostgreSQL function
    const { data, error } = await supabase.rpc('lock_problem', {
      p_team_id: session.teamId,
      p_problem_id: problemId,
    });

    if (error) {
      console.error('Lock problem RPC error:', error);
      return { success: false, error: 'SERVER_ERROR', message: 'Failed to lock problem. Please try again.' };
    }

    const result = data as LockResult;
    if (!result.success) {
      return { success: false, error: result.error || 'UNKNOWN', message: result.message || 'Failed to lock problem.' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/allocations');
    revalidatePath('/admin/teams');
    revalidatePath('/problems');
    revalidatePath('/team');

    return { success: true, data: result };
  } catch {
    return { success: false, error: 'SERVER_ERROR', message: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Get the current team's allocation (if any).
 */
export async function getMyAllocation() {
  const session = await getTeamSession();
  if (!session) return null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('allocations')
      .select(`
        id,
        locked_at,
        created_at,
        problems (
          id,
          problem_code,
          title,
          short_description,
          category,
          difficulty,
          tags,
          expected_outcome,
          recommended_technologies,
          constraints,
          resources,
          description
        )
      `)
      .eq('team_id', session.teamId)
      .single();

    return data;
  } catch {
    return null;
  }
}
