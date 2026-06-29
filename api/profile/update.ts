import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { userId, full_name, role, avatar_url } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID." });
  }

  try {
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedUser = await dbService.updateUser(userId, {
      full_name,
      role,
      avatar_url
    });

    return res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("UpdateProfile error:", error);
    return res.status(500).json({ error: "Internal update profile handler error." });
  }
}
