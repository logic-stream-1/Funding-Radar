import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { userId } = req.query;

  if (typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Profile not found." });
    }

    return res.json({ profile: user });
  } catch (error: any) {
    console.error("GetProfile error:", error);
    return res.status(500).json({ error: "Internal get profile handler error." });
  }
}
