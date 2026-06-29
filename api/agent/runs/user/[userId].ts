import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { userId } = req.query;

  if (typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    const runs = await dbService.getAgentRunsByUserId(userId);
    return res.json({ runs });
  } catch (error: any) {
    console.error("GetAgentRuns error:", error);
    return res.status(500).json({ error: "Internal get runs handler error." });
  }
}
