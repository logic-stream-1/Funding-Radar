import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";
import { handleAuthError } from "../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email } = req.body;

  try {
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found.", code: "ERR_USER_NOT_FOUND" });
    }

    await dbService.updateUser(user.id, { confirmed: true });
    return res.json({ status: "success", message: "Email confirmed!" });
  } catch (error: any) {
    console.error("ConfirmEmail error:", error);
    const friendlyMessage = handleAuthError(error, "Internal confirm email handler error.");
    return res.status(500).json({ error: friendlyMessage });
  }
}
