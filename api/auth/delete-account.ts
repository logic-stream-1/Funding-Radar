import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID.", code: "ERR_MISSING_USER" });
  }

  try {
    await dbService.deleteUser(userId);
    return res.json({ success: true, message: "Account completely deleted!" });
  } catch (error: any) {
    console.error("DeleteAccount error:", error);
    return res.status(500).json({ error: "Internal delete account handler error." });
  }
}
