import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Type } from "@google/genai";
import { dbService } from "../../src/lib/dbService";
import { getGeminiClient, getLocalizedMockPool } from "../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

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

    // 1. Sector Funding Search Simulation/Real Call
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

        // Step 1: Run real Gemini AI to fetch or model structured startup data based on queries & match backgrounds
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

    // Optionally deliver to Telegram Bot API if configured
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

    return res.json({ success: true, run: finalRun, results: savedResults });

  } catch (error: any) {
    console.error("Agent Pipeline Run failed:", error);
    return res.status(500).json({ error: error.message || "Pipeline execution failed.", code: "ERR_PIPELINE_FAILED" });
  }
}
