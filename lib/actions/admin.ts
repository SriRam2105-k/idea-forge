'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';
import type { ApiResponse, CreateTeamInput, CreateProblemInput } from '@/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}

// ============================================================
// Team management
// ============================================================

export async function createTeam(input: CreateTeamInput): Promise<ApiResponse<{ team_code: string }>> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const passwordHash = await bcrypt.hash(input.password, 12);

  const { data, error } = await supabase
    .from('teams')
    .insert({
      team_code: input.team_code.toUpperCase(),
      team_name: input.team_name,
      password_hash: passwordHash,
      plain_password: input.password,
      members: input.members || [],
      updated_at: new Date().toISOString(),
    })
    .select('team_code')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'DUPLICATE', message: `Team code "${input.team_code}" already exists.` };
    }
    return { success: false, error: 'DB_ERROR', message: error.message };
  }

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'TEAM_CREATED',
    entity_type: 'team',
    entity_id: data.team_code,
    metadata: { team_code: input.team_code, team_name: input.team_name },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/teams');

  return { success: true, data: { team_code: data.team_code } };
}

export async function importTeams(
  rows: CreateTeamInput[]
): Promise<ApiResponse<{ created: number; errors: Array<{ row: number; message: string }> }>> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const errors: Array<{ row: number; message: string }> = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const passwordHash = await bcrypt.hash(row.password, 12);
    const { error } = await supabase.from('teams').insert({
      team_code: row.team_code.toUpperCase(),
      team_name: row.team_name,
      password_hash: passwordHash,
      plain_password: row.password,
      members: row.members || [],
      updated_at: new Date().toISOString(),
    });

    if (error) {
      errors.push({
        row: i + 2,
        message: error.code === '23505' ? `Team code "${row.team_code}" already exists` : error.message,
      });
    } else {
      created++;
    }
  }

  if (created > 0) {
    await supabase.from('audit_logs').insert({
      actor_id: session.username,
      actor_type: 'admin',
      action: 'TEAMS_IMPORTED',
      entity_type: 'team',
      entity_id: null,
      metadata: { created, errors: errors.length },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/teams');

  return { success: true, data: { created, errors } };
}

export async function updateTeam(
  teamId: string,
  updates: { team_name?: string; status?: 'active' | 'inactive'; members?: unknown[] }
): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('teams')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'TEAM_UPDATED',
    entity_type: 'team',
    entity_id: teamId,
    metadata: updates,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/teams');

  return { success: true, data: null };
}

export async function resetTeamPassword(
  teamId: string,
  newPassword: string
): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const { error } = await supabase
    .from('teams')
    .update({
      password_hash: passwordHash,
      plain_password: newPassword,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'TEAM_PASSWORD_RESET',
    entity_type: 'team',
    entity_id: teamId,
    metadata: {},
  });

  revalidatePath('/admin');
  revalidatePath('/admin/teams');

  return { success: true, data: null };
}

// ============================================================
// Problem management
// ============================================================

export async function createProblem(input: CreateProblemInput): Promise<ApiResponse<{ problem_code: string }>> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('problems')
    .insert({
      ...input,
      problem_code: input.problem_code.toUpperCase(),
      updated_at: new Date().toISOString(),
    })
    .select('problem_code')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'DUPLICATE', message: `Problem code "${input.problem_code}" already exists.` };
    }
    return { success: false, error: 'DB_ERROR', message: error.message };
  }

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'PROBLEM_CREATED',
    entity_type: 'problem',
    entity_id: data.problem_code,
    metadata: { problem_code: input.problem_code, title: input.title },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/problems');
  revalidatePath('/problems');
  revalidatePath('/');

  return { success: true, data: { problem_code: data.problem_code } };
}

export async function updateProblem(
  problemId: string,
  updates: Partial<CreateProblemInput>
): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('problems')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', problemId);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'PROBLEM_UPDATED',
    entity_type: 'problem',
    entity_id: problemId,
    metadata: updates,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/problems');
  revalidatePath('/problems');
  revalidatePath('/');

  return { success: true, data: null };
}

export async function publishProblem(problemId: string): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('problems')
    .update({ status: 'PUBLISHED', updated_at: new Date().toISOString() })
    .eq('id', problemId);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'PROBLEM_PUBLISHED',
    entity_type: 'problem',
    entity_id: problemId,
    metadata: {},
  });

  revalidatePath('/admin');
  revalidatePath('/admin/problems');
  revalidatePath('/problems');
  revalidatePath('/');

  return { success: true, data: null };
}

export async function unpublishProblem(problemId: string): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  // Cannot unpublish a locked problem
  const { data: alloc } = await supabase
    .from('allocations')
    .select('id')
    .eq('problem_id', problemId)
    .single();

  if (alloc) {
    return { success: false, error: 'CONFLICT', message: 'Cannot unpublish a problem that is currently locked by a team.' };
  }

  const { error } = await supabase
    .from('problems')
    .update({ status: 'DRAFT', updated_at: new Date().toISOString() })
    .eq('id', problemId);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'PROBLEM_UNPUBLISHED',
    entity_type: 'problem',
    entity_id: problemId,
    metadata: {},
  });

  revalidatePath('/admin');
  revalidatePath('/admin/problems');
  revalidatePath('/problems');
  revalidatePath('/');

  return { success: true, data: null };
}

export async function deleteProblem(problemId: string): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { data: alloc } = await supabase
    .from('allocations')
    .select('id')
    .eq('problem_id', problemId)
    .single();

  if (alloc) {
    return { success: false, error: 'CONFLICT', message: 'Cannot delete a problem with an active allocation. Release the allocation first.' };
  }

  const { error } = await supabase
    .from('problems')
    .delete()
    .eq('id', problemId);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'PROBLEM_DELETED',
    entity_type: 'problem',
    entity_id: problemId,
    metadata: {},
  });

  revalidatePath('/admin');
  revalidatePath('/admin/problems');
  revalidatePath('/problems');
  revalidatePath('/');

  return { success: true, data: null };
}

// ============================================================
// Allocation management
// ============================================================

export async function releaseAllocation(allocationId: string): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('release_allocation', {
    p_allocation_id: allocationId,
    p_admin_id: session.username,
  });

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  const result = data as { success: boolean; message?: string; error?: string };
  if (!result.success) {
    return { success: false, error: result.error || 'UNKNOWN', message: result.message || 'Failed to release allocation.' };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/allocations');
  revalidatePath('/admin/teams');
  revalidatePath('/admin/problems');
  revalidatePath('/problems');
  revalidatePath('/team');

  return { success: true, data: null };
}

// ============================================================
// Settings management
// ============================================================

export async function updateSetting(key: string, value: unknown): Promise<ApiResponse> {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('hackathon_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) return { success: false, error: 'DB_ERROR', message: error.message };

  await supabase.from('audit_logs').insert({
    actor_id: session.username,
    actor_type: 'admin',
    action: 'SETTING_UPDATED',
    entity_type: 'setting',
    entity_id: key,
    metadata: { key, value },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  revalidatePath('/');

  return { success: true, data: null };
}
