import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../../src/lib/dbService";
import { seedDefaultRunForUser } from "../../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

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
}
