export type UserRole = "student" | "mentor" | "admin";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: "beginner" | "intermediate" | "advanced";
  created_at: string;
  skill?: Skill;
}

export type ChallengeDifficulty = "beginner" | "intermediate" | "advanced";

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  summary: string;
  description_markdown: string;
  primary_skill_id?: string;
  estimated_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  primary_skill?: Skill;
}

export type SubmissionStatus = "submitted" | "reviewing" | "evaluated" | "rejected";

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  repository_url: string;
  deployed_url?: string;
  notes?: string;
  status: SubmissionStatus;
  score?: number;
  created_at: string;
  updated_at: string;
  challenge?: Challenge;
}

export interface Feedback {
  id: string;
  submission_id: string;
  evaluator_type: "ai" | "peer" | "instructor";
  score: number;
  rubric_scores?: Record<string, number>;
  strengths: string;
  improvements: string;
  summary: string;
  created_at: string;
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  submission_id?: string;
  title: string;
  slug: string;
  summary: string;
  live_demo_url?: string;
  repository_url: string;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
}
