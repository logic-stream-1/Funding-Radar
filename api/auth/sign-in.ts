import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";
import { handleAuthError, seedDefaultRunForUser } from "../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email, password, isGoogle } = req.body;

  try {
    if (isGoogle) {
      // Simulate/Ensure user profile for first time Google OAuth
      let user = await dbService.getUserByEmail(email);
      if (!user) {
        const userId = `usr-${Date.now()}`;
        user = {
          id: userId,
          email: email.toLowerCase(),
          password: "google-oauth-dummy-pass",
          full_name: email.split("@")[0].split(".").map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ") || "Alexander Vance",
          role: "Senior Product Leader",
          avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAirZh9BKjWPHvdApAQiITRon5ODS77U1Nut8P_H9NMUwFQ7JdtAp5Q7TlLc_xxzpAq8r1o3uWOzLEqSRUo4rP5QZKbqpFr5JIpbw6m-lXvWXSFtNfyA5PNn7N7xrN9h0HEJhtBY_euRmNUto0-SSEiwSWsgGRL3tnIk-YI9UroTRMUmNqGFmQnvU9jvKX2KFRk240ak5_6W9v5wDhexKEo7uN8OCTx67MUeIt13npOKHCgjma6jdXQHBPpfWBqkP-DFfEOceLpZPS7",
          confirmed: true,
          created_at: new Date().toISOString()
        };
        await dbService.createUser(user);

        // Create default config
        const newConfig = {
          id: `cfg-${Date.now()}`,
          user_id: userId,
          background_summary: "VP of Product with deep expertise in Fintech & SaaS. Led core payment product launches, cross-border payment operations, and API integrations in senior executive networks.",
          sectors: ["HealthTech", "Fintech", "EdTech", "SaaS"],
          active_regions: ["Global"],
          funding_min_usd: 500000,
          delivery_channel: "telegram",
          telegram_chat_id: "",
          run_schedule: "manual",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await dbService.saveAgentConfig(newConfig);
        await seedDefaultRunForUser(userId, "India");
      }

      return res.json({ user });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password.", code: "ERR_MISSING_CREDENTIALS" });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password.", code: "ERR_BAD_AUTH" });
    }

    if (!user.confirmed) {
      return res.status(400).json({
        error: "Please confirm your work email first.",
        code: "ERR_EMAIL_UNCONFIRMED",
        email: user.email
      });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error("SignIn error:", error);
    const friendlyMessage = handleAuthError(error, "Internal sign in handler error.");
    return res.status(500).json({ error: friendlyMessage });
  }
}
