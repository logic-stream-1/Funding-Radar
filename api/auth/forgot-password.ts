import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email } = req.body;

  try {
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist.", code: "ERR_USER_NOT_FOUND" });
    }

    // Simulated email delivery
    return res.json({ message: "Password reset link sent to your email!" });
  } catch (error: any) {
    console.error("ForgotPassword error:", error);
    return res.status(500).json({ error: "Internal forgot password handler error." });
  }
}
