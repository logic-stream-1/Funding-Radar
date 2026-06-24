export interface User {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  confirmed: boolean;
  created_at: string;
}

export interface AgentConfig {
  id: string;
  user_id: string;
  background_summary: string;
  sectors: string[];
  active_regions: string[];
  funding_min_usd: number;
  delivery_channel: string;
  telegram_chat_id: string;
  run_schedule: string;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  user_id: string;
  status: "pending" | "running" | "completed" | "failed";
  regions_searched: string[];
  companies_found: number;
  digest_markdown: string;
  error_message: string | null;
  run_started_at: string;
  run_completed_at: string | null;
  quality_rating: number | null;
  api_cost_usd: number;
}

export interface CompanyResult {
  id: string;
  run_id: string;
  user_id: string;
  company_name: string;
  round_size_usd: number;
  stage: string;
  description: string;
  sector: string;
  region: string;
  pm_hiring_signal: boolean;
  relevance_score: number;
  way_in_angle: string;
  angle_confidence: "HIGH" | "MEDIUM" | "LOW";
  source_url: string;
  created_at: string;
}
