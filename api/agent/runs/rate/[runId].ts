import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { runId } = req.query;
  const { rating } = req.body;

  if (typeof runId !== "string") {
    return res.status(400).json({ error: "Invalid run ID." });
  }

  try {
    const updatedRun = await dbService.updateAgentRun(runId, { quality_rating: Number(rating) });
    if (!updatedRun) {
      return res.status(404).json({ error: "Run not found." });
    }

    return res.json({ success: true, run: updatedRun });
  } catch (error: any) {
    console.error("RateRun error:", error);
    return res.status(500).json({ error: "Internal rate run handler error." });
  }
}
