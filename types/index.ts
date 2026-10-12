// ============================================================
// Shared TypeScript types for NPR Hackathon Portal
// ============================================================

export type TeamStatus = 'active' | 'inactive';
export type ProblemStatus = 'DRAFT' | 'PUBLISHED';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type AdminRole = 'super_admin' | 'admin';
export type ActorType = 'admin' | 'team' | 'system';

export interface Team {
  id: string;
  team_code: string;
  team_name: string;
  password_hash: string;
  plain_password?: string;
  members: TeamMember[];
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  name: string;
  role?: string;
}

export interface Problem {
  id: string;
  problem_code: string;
  title: string;
  short_description: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  expected_outcome: string;
  recommended_technologies: string[];
  constraints: string;
  resources: Resource[];
  status: ProblemStatus;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  label: string;
  url: string;
}

export interface Allocation {
  id: string;
  team_id: string;
  problem_id: string;
  locked_at: string;
  created_at: string;
}

export interface AllocationWithDetails extends Allocation {
  team: Pick<Team, 'id' | 'team_code' | 'team_name'>;
  problem: Pick<Problem, 'id' | 'problem_code' | 'title' | 'category' | 'difficulty'>;
}

export interface Admin {
  id: string;
  username: string;
  display_name: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_type: ActorType;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HackathonSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

// ============================================================
// Public-safe types (no passwords, no private data)
// ============================================================

export type PublicTeam = Pick<Team, 'id' | 'team_code' | 'team_name' | 'status'>;

export type PublicProblem = Omit<Problem, 'updated_at'> & {
  is_locked: boolean;
};

// ============================================================
// Auth session types
// ============================================================

export interface TeamSession {
  teamId: string;
  teamCode: string;
  teamName: string;
  iat: number;
  exp: number;
}

export interface AdminSession {
  adminId: string;
  username: string;
  displayName: string;
  role: AdminRole;
  iat: number;
  exp: number;
}

// ============================================================
// API response types
// ============================================================

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface LockResult {
  success: boolean;
  allocation_id?: string;
  problem_code?: string;
  problem_title?: string;
  locked_at?: string;
  error?: string;
  message?: string;
}

// ============================================================
// Form/input types
// ============================================================

export interface CreateTeamInput {
  team_code: string;
  team_name: string;
  password: string;
  members?: TeamMember[];
}

export interface CreateProblemInput {
  problem_code: string;
  title: string;
  short_description: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  expected_outcome: string;
  recommended_technologies: string[];
  constraints: string;
  resources: Resource[];
  status: ProblemStatus;
}

export interface CsvTeamRow {
  team_code: string;
  team_name: string;
  password: string;
  members?: string; // JSON string
}

// ============================================================
// Dashboard stat types
// ============================================================

export interface DashboardStats {
  totalTeams: number;
  activeTeams: number;
  totalProblems: number;
  publishedProblems: number;
  availableProblems: number;
  lockedProblems: number;
  totalAllocations: number;
}
