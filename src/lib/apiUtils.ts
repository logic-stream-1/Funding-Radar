import { GoogleGenAI } from "@google/genai";
import { dbService } from "./dbService";

// Lazy Gemini Client initialization
let _ai: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI | null {
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

export function handleAuthError(error: any, defaultMsg: string): string {
  const errMsg = (error?.message || "").toLowerCase();
  const errDetails = (error?.details || "").toLowerCase();
  
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

export function getLocalizedMockPool(activeRegion: string): any[] {
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

export async function seedDefaultRunForUser(userId: string, activeRegion: string) {
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
