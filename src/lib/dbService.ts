import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, AgentConfig, AgentRun, CompanyResult } from "../types";

// Database Configuration
const isServerless = process.env.VERCEL === "1" || process.env.LAMBDA_TASK_ROOT || process.cwd().startsWith("/var/task");
const DB_PATH = isServerless 
  ? path.join("/tmp", "db.json") 
  : path.join(process.cwd(), "data", "db.json");

// Initial Database Seeds for fallback file database
const INITIAL_DATABASE = {
  users: [
    {
      id: "usr-default-alexander",
      email: "a.sterling@exec-path.com",
      password: "Password123!",
      full_name: "Alexander Sterling",
      role: "Senior Product Leader",
      avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqBGBazV99w0pfS5IFqGV9ecNY7ovi7TufiTlZqLDOr6aptU_6Bp5XzuJ5LnYdTBvu0pXu8mw4YDual941Hz5DY0wKI9J8l2jex1IHgSqilu-Y1jtJBXvFZR2-U5eFJUdtI4VkK0_4l30jvAhMaqTvpb7Ty3X_a5L-MWpIdAlUXyQzmcL2GrxH9mlD6s_cTy8H5JlMG8wjpcT2Ja7OoeIluUvygAFKb6lDD6W7jqNDF_4Q4dTqejR4BjEBPHbr-4mVNiITaPju522T",
      confirmed: true,
      created_at: "2025-01-15T09:00:00Z"
    }
  ],
  agent_configs: [
    {
      id: "cfg-default-alexander",
      user_id: "usr-default-alexander",
      background_summary: "10 years of experience in product management at companies like AWS, Optum, and Stripe. Specialized in scaling infrastructure, provider networks, and cross-border payment settlements. Led multi-functional engineering teams to launch high-availability B2B SaaS platforms.",
      sectors: ["HealthTech", "Fintech", "EdTech", "SaaS"],
      active_regions: ["India"],
      funding_min_usd: 500000,
      delivery_channel: "telegram",
      telegram_chat_id: "123456789",
      run_schedule: "manual",
      created_at: "2025-01-15T09:00:00Z",
      updated_at: "2025-01-15T09:00:00Z"
    }
  ],
  agent_runs: [
    {
      id: "run-mock-1",
      user_id: "usr-default-alexander",
      status: "completed",
      regions_searched: ["India"],
      companies_found: 6,
      digest_markdown: `# Weekly Funding Radar Digest\n\nIdentified **6 high-probability opportunities** aligned with your profile.\n\n### 1. SkyScale — $22M Series B (Match: 4.9/5)\n*Sector: SaaS | Region: India*\nThey are currently hiring for 12 roles in infra. Your 6 years at AWS provides the "expert-level" credibility they need for GTM.\n[View Signal](https://techcrunch.com)\n\n### 2. HealthFlow — $12M Series A (Match: 4.8/5)\n*Sector: HealthTech | Region: India*\nLeverage your background at Optum to help them scale their provider network and navigate regulatory hurdles in the Northeast market.\n[View Signal](https://inc42.com)\n\n### 3. GreenFlow — $31M Series A (Match: 4.7/5)\n*Sector: SaaS | Region: India*\nThey are migrating to a marketplace model. Your tenure at Airbnb during their hyper-growth phase is exactly the playbook they need.\n[View Signal](https://yourstory.com)\n\n### 4. LedgerEdge — $45M Series C (Match: 4.5/5)\n*Sector: Fintech | Region: India*\nYour experience in cross-border settlements at Stripe is the missing link for their European expansion strategy.\n[View Signal](https://ettech.com)`,
      error_message: null,
      run_started_at: "2026-06-23T14:30:00Z",
      run_completed_at: "2026-06-23T14:31:12Z",
      quality_rating: 5,
      api_cost_usd: 0.125
    }
  ],
  company_results: [
    {
      id: "res-mock-1",
      run_id: "run-mock-1",
      user_id: "usr-default-alexander",
      company_name: "SkyScale",
      round_size_usd: 22000000,
      stage: "Series B",
      description: "Cloud cost optimization and automated Kubernetes cluster management for multi-region hybrid systems.",
      sector: "SaaS",
      region: "India",
      pm_hiring_signal: true,
      relevance_score: 5,
      way_in_angle: "They are currently hiring for 12 roles in infra. Your 6 years at AWS provides the \"expert-level\" credibility they need for GTM.",
      angle_confidence: "HIGH",
      source_url: "https://techcrunch.com",
      created_at: "2026-06-23T14:31:12Z"
    },
    {
      id: "res-mock-2",
      run_id: "run-mock-1",
      user_id: "usr-default-alexander",
      company_name: "HealthFlow",
      round_size_usd: 12000000,
      stage: "Series A",
      description: "Digital health API platform connecting local clinics to standard medical insurance networks.",
      sector: "HealthTech",
      region: "India",
      pm_hiring_signal: true,
      relevance_score: 5,
      way_in_angle: "Leverage your background at Optum to help them scale their provider network and navigate regulatory hurdles in the Northeast market.",
      angle_confidence: "HIGH",
      source_url: "https://inc42.com",
      created_at: "2026-06-23T14:31:12Z"
    },
    {
      id: "res-mock-3",
      run_id: "run-mock-1",
      user_id: "usr-default-alexander",
      company_name: "GreenFlow",
      round_size_usd: 31000000,
      stage: "Series A",
      description: "Carbon offset and ESG compliance marketplace for medium-to-large shipping operations.",
      sector: "SaaS",
      region: "India",
      pm_hiring_signal: false,
      relevance_score: 4,
      way_in_angle: "They are migrating to a marketplace model. Your tenure at Airbnb during their hyper-growth phase is exactly the playbook they need.",
      angle_confidence: "HIGH",
      source_url: "https://yourstory.com",
      created_at: "2026-06-23T14:31:12Z"
    },
    {
      id: "res-mock-4",
      run_id: "run-mock-1",
      user_id: "usr-default-alexander",
      company_name: "LedgerEdge",
      round_size_usd: 45000000,
      stage: "Series C",
      description: "Automated treasury management system with cross-border settlement for international commerce.",
      sector: "Fintech",
      region: "India",
      pm_hiring_signal: true,
      relevance_score: 4,
      way_in_angle: "Your experience in cross-border settlements at Stripe is the missing link for their European expansion strategy.",
      angle_confidence: "HIGH",
      source_url: "https://ettech.com",
      created_at: "2026-06-23T14:31:12Z"
    },
    {
      id: "res-mock-5",
      run_id: "run-mock-1",
      user_id: "usr-default-alexander",
      company_name: "EduSphere",
      round_size_usd: 8000000,
      stage: "Seed+",
      description: "AI-driven peer feedback and custom test preparation platform for secondary school students.",
      sector: "EdTech",
      region: "India",
      pm_hiring_signal: true,
      relevance_score: 4,
      way_in_angle: "Target the CEO directly regarding their recent \"AI Tutor\" patent; your research at Stanford aligns perfectly with their tech stack.",
      angle_confidence: "MEDIUM",
      source_url: "https://yourstory.com",
      created_at: "2026-06-23T14:31:12Z"
    },
    {
      id: "res-mock-6",
      run_id: "run-mock-1",
      user_id: "usr-default-alexander",
      company_name: "CoreSaaS",
      round_size_usd: 5000000,
      stage: "Seed",
      description: "Low-code customer retention tools for enterprise telecom sales operations.",
      sector: "SaaS",
      region: "India",
      pm_hiring_signal: false,
      relevance_score: 4,
      way_in_angle: "Fresh funding signal usually precedes a CMO hire. Connect with Lead Investor [VC Name] via your shared contact at Techstars.",
      angle_confidence: "MEDIUM",
      source_url: "https://techcrunch.com",
      created_at: "2026-06-23T14:31:12Z"
    }
  ]
};

// Initialize Supabase Client if keys are available
let supabase: any = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseSchema = process.env.SUPABASE_SCHEMA || "public";

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "MY_SUPABASE_URL" && supabaseAnonKey !== "MY_SUPABASE_ANON_KEY") {
  console.log(`[Supabase] Configuration detected! Directing database traffic to schema: ${supabaseSchema}`);
  if (supabaseSchema && supabaseSchema !== "public") {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: supabaseSchema
      }
    });
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} else {
  console.log("[Database] No Supabase credentials detected. Running in local JSON fallback mode.");
}

// Local Database JSON Read/Write helpers
function loadLocalDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATABASE, null, 2));
    return INITIAL_DATABASE;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    return INITIAL_DATABASE;
  }
}

function saveLocalDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to database:", err);
  }
}

// Unified Database Service Layer
export const dbService = {
  isSupabaseActive(): boolean {
    return supabase !== null;
  },

  // --- USER OPERATIONS ---
  async getUserByEmail(email: string): Promise<User | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      
      if (error) {
        console.error("Supabase getUserByEmail error:", error);
        throw error;
      }
      return data || null;
    } else {
      const db = loadLocalDB();
      const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Supabase getUserById error:", error);
        throw error;
      }
      return data || null;
    } else {
      const db = loadLocalDB();
      const user = db.users.find((u: any) => u.id === id);
      return user || null;
    }
  },

  async createUser(user: User & { password?: string }): Promise<User> {
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email.toLowerCase(),
          password: user.password || "Password123!",
          full_name: user.full_name,
          role: user.role || "Senior Product Leader",
          avatar_url: user.avatar_url,
          confirmed: user.confirmed,
          created_at: user.created_at || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase createUser error:", error);
        throw error;
      }
      return data;
    } else {
      const db = loadLocalDB();
      db.users.push(user);
      saveLocalDB(db);
      return user;
    }
  },

  async updateUser(id: string, updates: Partial<User & { password?: string }>): Promise<User | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase updateUser error:", error);
        throw error;
      }
      return data || null;
    } else {
      const db = loadLocalDB();
      const user = db.users.find((u: any) => u.id === id);
      if (user) {
        Object.assign(user, updates);
        saveLocalDB(db);
        return user;
      }
      return null;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    if (supabase) {
      // Supabase cascade deletes thanks to foreign key triggers
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase deleteUser error:", error);
        return false;
      }
      return true;
    } else {
      const db = loadLocalDB();
      db.users = db.users.filter((u: any) => u.id !== id);
      db.agent_configs = db.agent_configs.filter((c: any) => c.user_id !== id);
      db.agent_runs = db.agent_runs.filter((r: any) => r.user_id !== id);
      db.company_results = db.company_results.filter((res: any) => res.user_id !== id);
      saveLocalDB(db);
      return true;
    }
  },

  // --- AGENT CONFIG OPERATIONS ---
  async getAgentConfigByUserId(userId: string): Promise<AgentConfig | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Supabase getAgentConfigByUserId error:", error);
        throw error;
      }
      return data || null;
    } else {
      const db = loadLocalDB();
      const config = db.agent_configs.find((c: any) => c.user_id === userId);
      return config || null;
    }
  },

  async saveAgentConfig(config: AgentConfig): Promise<AgentConfig> {
    if (supabase) {
      // Upsert configuration directly
      const { data, error } = await supabase
        .from("agent_configs")
        .upsert({
          id: config.id,
          user_id: config.user_id,
          background_summary: config.background_summary,
          sectors: config.sectors,
          active_regions: config.active_regions,
          funding_min_usd: Number(config.funding_min_usd),
          delivery_channel: config.delivery_channel,
          telegram_chat_id: config.telegram_chat_id,
          run_schedule: config.run_schedule,
          created_at: config.created_at,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase saveAgentConfig error:", error);
        throw error;
      }
      return data;
    } else {
      const db = loadLocalDB();
      const index = db.agent_configs.findIndex((c: any) => c.user_id === config.user_id);
      
      const configToSave = {
        ...config,
        funding_min_usd: Number(config.funding_min_usd),
        updated_at: new Date().toISOString()
      };

      if (index !== -1) {
        db.agent_configs[index] = configToSave;
      } else {
        db.agent_configs.push(configToSave);
      }
      
      saveLocalDB(db);
      return configToSave;
    }
  },

  // --- AGENT RUN OPERATIONS ---
  async getAgentRunsByUserId(userId: string): Promise<AgentRun[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("agent_runs")
        .select("*")
        .eq("user_id", userId)
        .order("run_started_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Supabase getAgentRunsByUserId error:", error);
        throw error;
      }
      return data || [];
    } else {
      const db = loadLocalDB();
      const runs = db.agent_runs
        .filter((r: any) => r.user_id === userId)
        .sort((a: any, b: any) => new Date(b.run_started_at).getTime() - new Date(a.run_started_at).getTime());
      return runs.slice(0, 10);
    }
  },

  async createAgentRun(run: AgentRun): Promise<AgentRun> {
    if (supabase) {
      const { data, error } = await supabase
        .from("agent_runs")
        .insert(run)
        .select()
        .single();

      if (error) {
        console.error("Supabase createAgentRun error:", error);
        throw error;
      }
      return data;
    } else {
      const db = loadLocalDB();
      db.agent_runs.push(run);
      saveLocalDB(db);
      return run;
    }
  },

  async updateAgentRun(runId: string, updates: Partial<AgentRun>): Promise<AgentRun | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("agent_runs")
        .update(updates)
        .eq("id", runId)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase updateAgentRun error:", error);
        throw error;
      }
      return data || null;
    } else {
      const db = loadLocalDB();
      const run = db.agent_runs.find((r: any) => r.id === runId);
      if (run) {
        Object.assign(run, updates);
        saveLocalDB(db);
        return run;
      }
      return null;
    }
  },

  // --- COMPANY RESULT OPERATIONS ---
  async getCompanyResultsByRunId(runId: string): Promise<CompanyResult[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("company_results")
        .select("*")
        .eq("run_id", runId);

      if (error) {
        console.error("Supabase getCompanyResultsByRunId error:", error);
        throw error;
      }
      return data || [];
    } else {
      const db = loadLocalDB();
      return db.company_results.filter((c: any) => c.run_id === runId);
    }
  },

  async createCompanyResults(results: CompanyResult[]): Promise<CompanyResult[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("company_results")
        .insert(results)
        .select();

      if (error) {
        console.error("Supabase createCompanyResults error:", error);
        throw error;
      }
      return data || [];
    } else {
      const db = loadLocalDB();
      db.company_results.push(...results);
      saveLocalDB(db);
      return results;
    }
  }
};
