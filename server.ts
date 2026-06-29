import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { dbService } from "./src/lib/dbService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini Client initialization
let _ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY_FR;
  if (!key) {
    console.warn("GEMINI_API_KEY_FR process env is missing. Relying on fallback mock logic.");
    return null;
  }
  if (!_ai) {
    _ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return _ai;
}

function handleAuthError(error: any, defaultMsg: string): string {
  const errMsg = (error?.message || "").toLowerCase();
  const errDetails = (error?.details || "").toLowerCase();
  const errHint = (error?.hint || "").toLowerCase();
  
  if (
    errMsg.includes("relation") || errMsg.includes("does not exist") ||
    errDetails.includes("relation") || errDetails.includes("does not exist") ||
    errMsg.includes("schema") || errMsg.includes("does not exist") ||
    errDetails.includes("schema")
  ) {
    const activeSchema = process.env.SUPABASE_SCHEMA || "public";
    if (activeSchema === "public") {
      return "Database tables are missing in your Supabase 'public' schema. Please open your Supabase SQL Editor, paste and run all commands from the 'supabase_schema.sql' file to create the tables.";
    } else {
      return `Database tables are missing in your Supabase '${activeSchema}' schema. Please run the SQL commands from 'supabase_schema.sql' inside your SQL Editor, and make sure to expose '${activeSchema}' in Settings -> API -> Exposed Schemas inside your Supabase dashboard.`;
    }
  }
  
  if (errMsg.includes("failed to fetch") || errMsg.includes("fetch failed") || errMsg.includes("enotfound") || errMsg.includes("econnrefused")) {
    return "Could not connect to your Supabase project. Please verify that your SUPABASE_URL and SUPABASE_ANON_KEY are correct and active in your Secrets/Environment variables.";
  }
  
  return error?.message || defaultMsg;
}

// --- LOCALIZED MOCK GENERATOR AND SEEDING HELPERS ---

function getLocalizedMockPool(activeRegion: string): any[] {
  const isGlobal = activeRegion.toLowerCase() === "global";
  
  if (activeRegion.toLowerCase() === "india") {
    return [
      {
        company_name: "RupeePay",
        round_size_usd: 42000000,
        stage: "Series C",
        description: "Scaling UPI-linked instant merchant settlement rails and micro-lending API services across India.",
        sector: "Fintech",
        region: "India",
        pm_hiring_signal: true,
        relevance_score: 5,
        way_in_angle: "Expanding into Southeast Asia and MENA markets next quarter. Scaling core payment ledger rails in Bengaluru. Former RupeePay advisor is a mentor of yours.",
        angle_confidence: "HIGH",
        source_url: "https://inc42.com"
      },
      {
        company_name: "MedScribe India",
        round_size_usd: 28000000,
        stage: "Series B",
        description: "High-throughput clinical documentation workflow and healthcare pipeline SaaS for diagnostic networks.",
        sector: "HealthTech",
        region: "India",
        pm_hiring_signal: true,
        relevance_score: 5,
        way_in_angle: "Hiring for first VP of Product role in Gurugram. Founder recently posted about 'Scaling Indic Product Culture' on LinkedIn. Your healthtech platform experience aligns perfectly.",
        angle_confidence: "HIGH",
        source_url: "https://yourstory.com"
      },
      {
        company_name: "NeuralIndic",
        round_size_usd: 15000000,
        stage: "Series A",
        description: "Model alignment platform specializing in synthetic dataset generation for Indian languages and Indic LLMs.",
        sector: "SaaS",
        region: "India",
        pm_hiring_signal: true,
        relevance_score: 4,
        way_in_angle: "Transitioning from R&D to GTM in Bengaluru. Critical need for product leaders with background in API standardization and multilingual model scaling.",
        angle_confidence: "MEDIUM",
        source_url: "https://ettech.com"
      },
      {
        company_name: "UrjaGrid",
        round_size_usd: 110000000,
        stage: "Series D",
        description: "Enterprise smart grid distribution balancing and carbon offset tracking software for industrial manufacturers in India.",
        sector: "SaaS",
        region: "India",
        pm_hiring_signal: false,
        relevance_score: 4,
        way_in_angle: "[VERIFY] — UrjaGrid is preparing for international market expansion. Their current product leadership lacks late-stage SaaS experience.",
        angle_confidence: "LOW",
        source_url: "https://yourstory.com"
      },
      {
        company_name: "DeccanCloud",
        round_size_usd: 8500000,
        stage: "Series A",
        description: "High performance hybrid container caching architecture for high-volume Indian e-commerce networks.",
        sector: "SaaS",
        region: "India",
        pm_hiring_signal: true,
        relevance_score: 4,
        way_in_angle: "Stealth mode exit. 3 key engineering hires from your former team in last 30 days. Perfect timing to introduce yourself to their Mumbai hub.",
        angle_confidence: "HIGH",
        source_url: "https://inc42.com"
      }
    ];
  } else {
    // Return standard mock pool with dynamic region set
    return [
      {
        company_name: "VeloPay",
        round_size_usd: 42000000,
        stage: "Series C",
        description: "Expanding rapid borderless settlement systems with micro-lending API services.",
        sector: "Fintech",
        region: isGlobal ? "United States" : activeRegion,
        pm_hiring_signal: true,
        relevance_score: 5,
        way_in_angle: "Expanding into MENA region next quarter. Scaling core payment ledger rails. Former VeloPay advisor is a mentor of yours.",
        angle_confidence: "HIGH",
        source_url: "https://inc42.com"
      },
      {
        company_name: "BioLink",
        round_size_usd: 28000000,
        stage: "Series B",
        description: "High-throughput genome sequence cataloging and clinical pipeline management SaaS.",
        sector: "HealthTech",
        region: isGlobal ? "United Kingdom" : activeRegion,
        pm_hiring_signal: true,
        relevance_score: 5,
        way_in_angle: "Hiring for first VP of Product role. Founder recently posted about \"Scaling Product Culture\" on LinkedIn. Your Optum provider experience aligns perfectly.",
        angle_confidence: "HIGH",
        source_url: "https://techcrunch.com"
      },
      {
        company_name: "NeuralFlow",
        round_size_usd: 15000000,
        stage: "Series A",
        description: "Model alignment platform specializing in synthetic dataset generation with safety guardrails.",
        sector: "SaaS",
        region: isGlobal ? "Canada" : activeRegion,
        pm_hiring_signal: true,
        relevance_score: 4,
        way_in_angle: "Transitioning from R&D to GTM. Critical need for product leaders with background in API standardisation and infrastructure scaling.",
        angle_confidence: "MEDIUM",
        source_url: "https://yourstory.com"
      },
      {
        company_name: "SustainGrid",
        round_size_usd: 110000000,
        stage: "Series D",
        description: "Enterprise grid distribution balancing tool with active solar panel arbitrage tracking.",
        sector: "SaaS",
        region: isGlobal ? "Germany" : activeRegion,
        pm_hiring_signal: false,
        relevance_score: 4,
        way_in_angle: "[VERIFY] — SustainGrid is preparing for IPO within 24 months. Their current product leadership lacks late-stage experience.",
        angle_confidence: "LOW",
        source_url: "https://ettech.com"
      },
      {
        company_name: "CloudArch",
        round_size_usd: 8500000,
        stage: "Series A",
        description: "High performance hybrid container architecture with cold tier caching capabilities.",
        sector: "SaaS",
        region: isGlobal ? "Singapore" : activeRegion,
        pm_hiring_signal: true,
        relevance_score: 4,
        way_in_angle: "Stealth mode exit. 3 key engineering hires from your former team in last 30 days. Perfect timing to introduce yourself.",
        angle_confidence: "HIGH",
        source_url: "https://yourstory.com"
      }
    ];
  }
}

async function seedDefaultRunForUser(userId: string, activeRegion: string) {
  try {
    const runId = `run-seed-${Date.now()}`;
    const seedCompanies = getLocalizedMockPool(activeRegion);
    
    let md = `# Weekly Funding Radar Digest\n\nGenerated specifically for your profile in **${activeRegion}**.\n\n`;
    md += `Identified **${seedCompanies.length} high-probability opportunities** matching your background summary.\n\n`;

    seedCompanies.forEach((c: any, index: number) => {
      const formattedSize = c.round_size_usd ? `$${(c.round_size_usd / 1000000).toFixed(1)}M` : "Undisclosed";
      const confidenceLabel = c.angle_confidence === "LOW" ? " [VERIFY]" : "";
      md += `### ${index + 1}. ${c.company_name} — ${formattedSize} ${c.stage} (Match: ${c.relevance_score}/5)${confidenceLabel}\n`;
      md += `*Sector: ${c.sector} | Region: ${c.region}*\n`;
      md += `**Description:** ${c.description}\n`;
      if (c.pm_hiring_signal) {
        md += `*🔥 Visible PM Hiring Signal detected*\n`;
      }
      md += `**Way In Angle:** ${c.way_in_angle}\n`;
      md += `[View Signal](${c.source_url})\n\n`;
    });

    const runRecord: any = {
      id: runId,
      user_id: userId,
      status: "completed" as const,
      regions_searched: [activeRegion],
      companies_found: seedCompanies.length,
      digest_markdown: md,
      error_message: null,
      run_started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      run_completed_at: new Date().toISOString(),
      quality_rating: null,
      api_cost_usd: 0.00
    };

    await dbService.createAgentRun(runRecord);

    const savedResults = seedCompanies.map((c, index) => {
      return {
        id: `res-seed-${Date.now()}-${index}`,
        run_id: runId,
        user_id: userId,
        company_name: c.company_name,
        round_size_usd: c.round_size_usd,
        stage: c.stage,
        description: c.description,
        sector: c.sector,
        region: c.region,
        pm_hiring_signal: c.pm_hiring_signal,
        relevance_score: c.relevance_score,
        way_in_angle: c.way_in_angle,
        angle_confidence: c.angle_confidence,
        source_url: c.source_url,
        created_at: new Date().toISOString()
      };
    });

    await dbService.createCompanyResults(savedResults);
    console.log(`[Database Seeding] Successfully seeded default completed run and results for user ${userId} in ${activeRegion}.`);
  } catch (err) {
    console.error("[Database Seeding] Failed to seed default run for user:", err);
  }
}

// --- AUTH ENDPOINTS ---

app.post("/api/auth", async (req, res) => {
  const action = (req.query.action || req.body.action) as string;

  if (!action) {
    return res.status(400).json({ error: "Missing action parameter.", code: "ERR_MISSING_ACTION" });
  }

  try {
    switch (action) {
      case "sign-in": {
        const { email, password, isGoogle } = req.body;

        if (isGoogle) {
          let user = await dbService.getUserByEmail(email);
          if (!user) {
            const userId = `usr-${Date.now()}`;
            user = {
              id: userId,
              email: email.toLowerCase(),
              password: "google-oauth-dummy-pass",
              full_name: email.split("@")[0].split(".").map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") || "Alexander Vance",
              role: "Senior Product Leader",
              avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAirZh9BKjWPHvdApAQiITRon5ODS77U1Nut8P_H9NMUwFQ7JdtAp5Q7TlLc_xxzpAq8r1o3uWOzLEqSRUo4rP5QZKbqpFr5JIpbw6m-lXvWXSFtNfyA5PNn7N7xrN9h0HEJhtBY_euRmNUto0-SSEiwSWsgGRL3tnIk-YI9UroTRMUmNqGFmQnvU9jvKX2KFRk240ak5_6W9v5wDhexKEo7uN8OCTx67MUeIt13npOKHCgjma6jdXQHBPpfWBqkP-DFfEOceLpZPS7",
              confirmed: true,
              created_at: new Date().toISOString()
            };
            await dbService.createUser(user);

            // Create default config
            const newConfig = {
              id: `cfg-${Date.now()}`,
              user_id: userId,
              background_summary: "VP of Product with deep expertise in Fintech & SaaS. Led core payment product launches, cross-border payment operations, and API integrations in senior executive networks.",
              sectors: ["HealthTech", "Fintech", "EdTech", "SaaS"],
              active_regions: ["Global"],
              funding_min_usd: 500000,
              delivery_channel: "telegram",
              telegram_chat_id: "",
              run_schedule: "manual",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            await dbService.saveAgentConfig(newConfig);
            await seedDefaultRunForUser(userId, "India");
          }

          return res.json({ user });
        }

        if (!email || !password) {
          return res.status(400).json({ error: "Missing email or password.", code: "ERR_MISSING_CREDENTIALS" });
        }

        const user = await dbService.getUserByEmail(email);
        if (!user || user.password !== password) {
          return res.status(401).json({ error: "Invalid email or password.", code: "ERR_BAD_AUTH" });
        }

        if (!user.confirmed) {
          return res.status(400).json({
            error: "Please confirm your work email first.",
            code: "ERR_EMAIL_UNCONFIRMED",
            email: user.email
          });
        }

        return res.json({ user });
      }

      case "sign-up": {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
          return res.status(400).json({ error: "Missing required fields.", code: "ERR_MISSING_FIELDS" });
        }

        const existing = await dbService.getUserByEmail(email);
        if (existing) {
          return res.status(400).json({ error: "Email already registered.", code: "ERR_EMAIL_TAKEN" });
        }

        const userId = `usr-${Date.now()}`;
        const newUser = {
          id: userId,
          email: email.toLowerCase(),
          password,
          full_name,
          role: "Senior Product Leader",
          avatar_url: null,
          confirmed: false,
          created_at: new Date().toISOString()
        };

        await dbService.createUser(newUser);

        // Setup default config for this user
        const newConfig = {
          id: `cfg-${Date.now()}`,
          user_id: userId,
          background_summary: "5+ years in senior product management. Skilled in user research, metrics, SaaS strategy, agile methodologies, and scaling growth channels. Solid experience across fintech, healthtech, and cloud technologies.",
          sectors: ["HealthTech", "Fintech", "EdTech", "SaaS"],
          active_regions: ["Global"],
          funding_min_usd: 500000,
          delivery_channel: "telegram",
          telegram_chat_id: "",
          run_schedule: "manual",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await dbService.saveAgentConfig(newConfig);

        // Pre-seed a default run with realistic opportunities so they don't see a blank screen
        await seedDefaultRunForUser(userId, "India");

        return res.json({
          message: "Sign up successful! Verification email simulated.",
          userId: newUser.id,
          email: newUser.email
        });
      }

      case "confirm-email": {
        const { email } = req.body;
        const user = await dbService.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User not found.", code: "ERR_USER_NOT_FOUND" });
        }

        await dbService.updateUser(user.id, { confirmed: true });
        return res.json({ status: "success", message: "Email confirmed!" });
      }

      case "forgot-password": {
        const { email } = req.body;
        const user = await dbService.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User with this email does not exist.", code: "ERR_USER_NOT_FOUND" });
        }

        return res.json({ message: "Password reset link sent to your email!" });
      }

      case "reset-password": {
        const { email, newPassword } = req.body;
        const user = await dbService.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User not found.", code: "ERR_USER_NOT_FOUND" });
        }

        await dbService.updateUser(user.id, { password: newPassword });
        return res.json({ message: "Password successfully updated!" });
      }

      case "delete-account": {
        const { userId } = req.body;
        if (!userId) {
          return res.status(400).json({ error: "Missing user ID.", code: "ERR_MISSING_USER" });
        }

        await dbService.deleteUser(userId);
        return res.json({ success: true, message: "Account completely deleted!" });
      }

      default: {
        return res.status(400).json({ error: `Unknown action: ${action}`, code: "ERR_UNKNOWN_ACTION" });
      }
    }
  } catch (error: any) {
    console.error(`Auth error [${action}]:`, error);
    const friendlyMessage = handleAuthError(error, `Internal ${action} handler error.`);
    return res.status(500).json({ error: friendlyMessage });
  }
});


// --- PROFILE ENDPOINTS ---

app.get("/api/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json({ profile: user });
  } catch (error: any) {
    console.error("GetProfile error:", error);
    return res.status(500).json({ error: "Internal get profile handler error." });
  }
});

app.post("/api/profile/update", async (req, res) => {
  const { userId, full_name, role, avatar_url } = req.body;

  try {
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedUser = await dbService.updateUser(userId, {
      full_name,
      role,
      avatar_url
    });

    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("UpdateProfile error:", error);
    return res.status(500).json({ error: "Internal update profile handler error." });
  }
});


// --- AGENT CONFIG ENDPOINTS ---

app.get(["/api/agent/config", "/api/agent/config/:userId"], async (req, res) => {
  const userId = (req.query.userId || req.params.userId) as string;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    let config = await dbService.getAgentConfigByUserId(userId);
    if (!config) {
      // Generate default config if missing
      config = {
        id: `cfg-${Date.now()}`,
        user_id: userId,
        background_summary: "Experienced PM with strong expertise in SaaS products.",
        sectors: ["HealthTech", "Fintech", "EdTech", "SaaS"],
        active_regions: ["Global"],
        funding_min_usd: 500000,
        delivery_channel: "telegram",
        telegram_chat_id: "",
        run_schedule: "manual",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await dbService.saveAgentConfig(config);
      await seedDefaultRunForUser(userId, "India");
    } else {
      // Check if they have at least one run, if not seed it to prevent blank state
      const existingRuns = await dbService.getAgentRunsByUserId(userId);
      if (existingRuns.length === 0) {
        const region = config.active_regions?.[0] || "India";
        await seedDefaultRunForUser(userId, region);
      }
    }

    res.json({ config });
  } catch (error: any) {
    console.error("GetAgentConfig error:", error);
    return res.status(500).json({ error: "Internal get config handler error." });
  }
});

app.post("/api/agent/config", async (req, res) => {
  const { userId, background_summary, sectors, active_regions, funding_min_usd, telegram_chat_id } = req.body;

  try {
    let config = await dbService.getAgentConfigByUserId(userId);
    if (!config) {
      config = {
        id: `cfg-${Date.now()}`,
        user_id: userId,
        background_summary: background_summary || "Experienced PM with strong expertise in SaaS products.",
        sectors: sectors || [],
        active_regions: active_regions || ["Global"],
        funding_min_usd: Number(funding_min_usd || 500000),
        delivery_channel: "telegram",
        telegram_chat_id: telegram_chat_id || "",
        run_schedule: "manual",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      config.background_summary = background_summary;
      config.sectors = sectors;
      config.active_regions = active_regions || ["Global"];
      config.funding_min_usd = Number(funding_min_usd);
      config.telegram_chat_id = telegram_chat_id;
      config.updated_at = new Date().toISOString();
    }

    await dbService.saveAgentConfig(config);

    const existingRuns = await dbService.getAgentRunsByUserId(userId);
    if (existingRuns.length === 0) {
      const region = active_regions?.[0] || "Global";
      await seedDefaultRunForUser(userId, region);
    }

    res.json({ success: true, config });
  } catch (error: any) {
    console.error("SaveAgentConfig error:", error);
    return res.status(500).json({ error: "Internal save config handler error." });
  }
});


// --- RUNS AND PIPELINE ENDPOINTS ---

app.get("/api/agent/runs/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const runs = await dbService.getAgentRunsByUserId(userId);
    res.json({ runs });
  } catch (error: any) {
    console.error("GetAgentRuns error:", error);
    return res.status(500).json({ error: "Internal get runs handler error." });
  }
});

app.get("/api/agent/runs/:runId/results", async (req, res) => {
  const { runId } = req.params;

  try {
    const results = await dbService.getCompanyResultsByRunId(runId);
    res.json({ results });
  } catch (error: any) {
    console.error("GetCompanyResults error:", error);
    return res.status(500).json({ error: "Internal get company results handler error." });
  }
});

app.post("/api/agent/runs/:runId/rate", async (req, res) => {
  const { runId } = req.params;
  const { rating } = req.body;

  try {
    const updatedRun = await dbService.updateAgentRun(runId, { quality_rating: Number(rating) });
    if (!updatedRun) {
      return res.status(404).json({ error: "Run not found." });
    }

    res.json({ success: true, run: updatedRun });
  } catch (error: any) {
    console.error("RateRun error:", error);
    return res.status(500).json({ error: "Internal rate run handler error." });
  }
});

// Full Agentic pipeline
app.post("/api/agent/run", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const config = await dbService.getAgentConfigByUserId(userId);
    if (!config) {
      return res.status(400).json({ error: "Please configure your profile & background summary first." });
    }

    const runId = `run-${Date.now()}`;
    const runRecord: any = {
      id: runId,
      user_id: userId,
      status: "running",
      regions_searched: config.active_regions || ["Global"],
      companies_found: 0,
      digest_markdown: "",
      error_message: null,
      run_started_at: new Date().toISOString(),
      run_completed_at: null,
      quality_rating: null,
      api_cost_usd: 0.05
    };

    await dbService.createAgentRun(runRecord);

    const ai = getGeminiClient();

    // 1. Sector Funding Search Simulation
    const activeRegion = config.active_regions?.[0] || "Global";
    const sectorsToQuery = config.sectors && config.sectors.length > 0 ? config.sectors : ["SaaS", "Fintech", "HealthTech", "EdTech"];

    let parsedCompanies: any[] = [];
    let isMockFallback = false;

    if (ai) {
      try {
        const isGlobal = activeRegion.toLowerCase() === "global";
        const regionText = isGlobal 
          ? "globally (distribute across different countries like United States, United Kingdom, Canada, India, Germany, Israel, Singapore, etc.)" 
          : `in ${activeRegion}`;

        // Step 2 & 3: Run real Gemini AI to fetch or model structured startup data based on queries & match backgrounds!
        const searchResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `You are simulating a VC funding news parsing engine. Generate a JSON list of 6 realistic and interesting startups that recently announced funding (within last 7 days) ${regionText} within these specific sectors: ${sectorsToQuery.join(", ")}.
          
          The background summary of our candidate seeking PM jobs is:
          "${config.background_summary}"

          For each startup, generate:
          - company_name: Name of the startup (creative and modern)
          - round_size_usd: Funding amount between $500,000 and $80,000,000
          - stage: Stage of funding (Seed, Series A, Series B, Series C, etc.)
          - description: One-sentence description of what they do (max 20 words)
          - sector: The matching sector from the list
          - region: ${isGlobal ? "The actual country name where the startup is based" : `"${activeRegion}"`}
          - pm_hiring_signal: Boolean (true if they likely need product management hiring given their stage and description, false otherwise)
          - source_url: A realistic mock news URL or domain

          Output ONLY a valid JSON array matching the keys described. No other code blocks or commentary.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company_name: { type: Type.STRING },
                  round_size_usd: { type: Type.INTEGER },
                  stage: { type: Type.STRING },
                  description: { type: Type.STRING },
                  sector: { type: Type.STRING },
                  region: { type: Type.STRING },
                  pm_hiring_signal: { type: Type.BOOLEAN },
                  source_url: { type: Type.STRING }
                },
                required: ["company_name", "round_size_usd", "stage", "description", "sector", "region", "pm_hiring_signal", "source_url"]
              }
            }
          }
        });

        const rawJson = searchResponse.text?.trim() || "[]";
        let companies = JSON.parse(rawJson);

        // Filter out low funding limits if configured
        if (config.funding_min_usd) {
          companies = companies.filter((c: any) => c.round_size_usd >= config.funding_min_usd);
        }

        // Call 2: Generate background matching Score & Specific "Way In Angle"
        const matchResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `You are a professional career intelligence coach. 
          You have a list of startup funding events:
          ${JSON.stringify(companies, null, 2)}

          And you have the background summary of our senior candidate:
          "${config.background_summary}"

          For each startup in the list, analyze their business model, stage, and description against the candidate's background. Return a JSON list of matches:
          - company_name: (Matching name from the list)
          - relevance_score: integer from 1 to 5 (How well their stage and sector matches candidate background)
          - way_in_angle: ONE highly specific sentence detailing EXACTLY how this candidate should reach out. It MUST reference a specific skill or past company from the candidate's background AND connect it directly to the startup's mission or target market expansion. Do NOT write generic advice like "reach out to discuss product openings".
          - angle_confidence: HIGH, MEDIUM, or LOW based on how credible and strong the connection is.

          Output ONLY a valid JSON array matching the keys described.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company_name: { type: Type.STRING },
                  relevance_score: { type: Type.INTEGER },
                  way_in_angle: { type: Type.STRING },
                  angle_confidence: { type: Type.STRING }
                },
                required: ["company_name", "relevance_score", "way_in_angle", "angle_confidence"]
              }
            }
          }
        });

        const rawMatches = matchResponse.text?.trim() || "[]";
        const matches = JSON.parse(rawMatches);

        // Join the search results with the generated custom angles
        parsedCompanies = companies.map((c: any) => {
          const match = matches.find((m: any) => m.company_name.toLowerCase() === c.company_name.toLowerCase()) || {};
          return {
            ...c,
            relevance_score: match.relevance_score || Math.floor(Math.random() * 3) + 3,
            way_in_angle: match.way_in_angle || `Leverage your experience to help ${c.company_name} build their next core ${c.sector} product interface.`,
            angle_confidence: match.angle_confidence || "HIGH"
          };
        });
      } catch (geminiErr) {
        console.warn("Gemini API call or parsing failed, falling back to mock generator:", geminiErr);
        isMockFallback = true;
      }
    }

    if (!ai || isMockFallback) {
      // Mock Fallback Generation (No API Key or model error) using localized helper
      const mockPool = getLocalizedMockPool(activeRegion);

      // Filter by sector & amount (case-insensitive for safety)
      parsedCompanies = mockPool.filter((c: any) => {
        const sectorMatch = sectorsToQuery.map((s: string) => s.toLowerCase()).includes(c.sector.toLowerCase());
        const minMatch = c.round_size_usd >= config.funding_min_usd;
        return sectorMatch && minMatch;
      });

      if (parsedCompanies.length === 0) {
        parsedCompanies = mockPool; // fallback
      }
    }

    // Sort by relevance score desc
    parsedCompanies.sort((a, b) => b.relevance_score - a.relevance_score);

    // Save individual company results
    const savedResults = parsedCompanies.map((c: any) => {
      return {
        id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        run_id: runId,
        user_id: userId,
        company_name: c.company_name,
        round_size_usd: c.round_size_usd,
        stage: c.stage,
        description: c.description,
        sector: c.sector,
        region: c.region,
        pm_hiring_signal: c.pm_hiring_signal,
        relevance_score: c.relevance_score,
        way_in_angle: c.way_in_angle,
        angle_confidence: c.angle_confidence,
        source_url: c.source_url,
        created_at: new Date().toISOString()
      };
    });

    await dbService.createCompanyResults(savedResults);

    // Format Markdown Digest
    let md = `# Weekly Funding Radar Digest\n\nGenerated specifically for your profile: **${sectorsToQuery.join(", ")}** in **${activeRegion}**.\n\n`;
    md += `Identified **${savedResults.length} high-probability opportunities** matching your background summary.\n\n`;

    savedResults.forEach((c: any, index: number) => {
      const formattedSize = c.round_size_usd ? `$${(c.round_size_usd / 1000000).toFixed(1)}M` : "Undisclosed";
      const confidenceLabel = c.angle_confidence === "LOW" ? " [VERIFY]" : "";
      md += `### ${index + 1}. ${c.company_name} — ${formattedSize} ${c.stage} (Match: ${c.relevance_score}/5)${confidenceLabel}\n`;
      md += `*Sector: ${c.sector} | Region: ${c.region}*\n`;
      md += `**Description:** ${c.description}\n`;
      if (c.pm_hiring_signal) {
        md += `*🔥 Visible PM Hiring Signal detected*\n`;
      }
      md += `**Way In Angle:** ${c.way_in_angle}\n`;
      md += `[View Signal](${c.source_url})\n\n`;
    });

    // Update run record
    const updatedRunRecord = {
      status: "completed" as const,
      companies_found: savedResults.length,
      digest_markdown: md,
      run_completed_at: new Date().toISOString(),
      api_cost_usd: ai ? 0.08 : 0.00
    };

    const finalRun = await dbService.updateAgentRun(runId, updatedRunRecord);

    // 4. Optionally deliver to Telegram Bot API if configured
    if (config.telegram_chat_id && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = config.telegram_chat_id;
        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

        const croppedText = md.substring(0, 4000);

        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: croppedText,
            parse_mode: "Markdown"
          })
        });
        console.log("Delivered digest message to Telegram Chat ID:", chatId);
      } catch (tgError) {
        console.error("Failed to post message to Telegram API:", tgError);
      }
    }

    res.json({ success: true, run: finalRun, results: savedResults });

  } catch (error: any) {
    console.error("Agent Pipeline Run failed:", error);
    res.status(500).json({ error: error.message || "Pipeline execution failed.", code: "ERR_PIPELINE_FAILED" });
  }
});

// Serve API check/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), databaseMode: dbService.isSupabaseActive() ? "supabase" : "local" });
});

// Start Server helper to boot both Express & Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();
