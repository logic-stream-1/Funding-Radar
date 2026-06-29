import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../../src/lib/dbService";
import { seedDefaultRunForUser } from "../../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

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
}
