import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email, newPassword } = req.body;

  try {
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found.", code: "ERR_USER_NOT_FOUND" });
    }

    await dbService.updateUser(user.id, { password: newPassword });
    return res.json({ message: "Password successfully updated!" });
  } catch (error: any) {
    console.error("ResetPassword error:", error);
    return res.status(500).json({ error: "Internal reset password handler error." });
  }
}
