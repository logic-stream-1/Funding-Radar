import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";
import { seedDefaultRunForUser } from "../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;

    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid user ID." });
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

      return res.json({ config });
    } catch (error: any) {
      console.error("GetAgentConfig error:", error);
      return res.status(500).json({ error: "Internal get config handler error." });
    }
  } else if (req.method === "POST") {
    const { userId, background_summary, sectors, active_regions, funding_min_usd, telegram_chat_id } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID." });
    }

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

      return res.json({ success: true, config });
    } catch (error: any) {
      console.error("SaveAgentConfig error:", error);
      return res.status(500).json({ error: "Internal save config handler error." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
