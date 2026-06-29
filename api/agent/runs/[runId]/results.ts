import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { runId } = req.query;

  if (typeof runId !== "string") {
    return res.status(400).json({ error: "Invalid run ID." });
  }

  try {
    const results = await dbService.getCompanyResultsByRunId(runId);
    return res.json({ results });
  } catch (error: any) {
    console.error("GetCompanyResults error:", error);
    return res.status(500).json({ error: "Internal get company results handler error." });
  }
}
