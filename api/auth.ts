import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../src/lib/dbService";
import { handleAuthError, seedDefaultRunForUser } from "../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const action = (req.query.action || req.body.action) as string;

  if (!action) {
    return res.status(400).json({ error: "Missing action parameter.", code: "ERR_MISSING_ACTION" });
  }

  try {
    switch (action) {
      case "sign-in": {
        const { email, password, isGoogle } = req.body;

        if (isGoogle) {
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
      }

      case "sign-up": {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
          return res.status(400).json({ error: "Missing required fields.", code: "ERR_MISSING_FIELDS" });
        }

        const existing = await dbService.getUserByEmail(email);
        if (existing) {
          return res.status(400).json({ error: "Email already registered.", code: "ERR_EMAIL_TAKEN" });
        }

        const userId = `usr-${Date.now()}`;
        const newUser = {
          id: userId,
          email: email.toLowerCase(),
          password,
          full_name,
          role: "Senior Product Leader",
          avatar_url: null,
          confirmed: false,
          created_at: new Date().toISOString()
        };

        await dbService.createUser(newUser);

        // Setup default config for this user
        const newConfig = {
          id: `cfg-${Date.now()}`,
          user_id: userId,
          background_summary: "5+ years in senior product management. Skilled in user research, metrics, SaaS strategy, agile methodologies, and scaling growth channels. Solid experience across fintech, healthtech, and cloud technologies.",
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

        // Pre-seed a default run with realistic opportunities so they don't see a blank screen
        await seedDefaultRunForUser(userId, "India");

        return res.json({
          message: "Sign up successful! Verification email simulated.",
          userId: newUser.id,
          email: newUser.email
        });
      }

      case "confirm-email": {
        const { email } = req.body;
        const user = await dbService.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User not found.", code: "ERR_USER_NOT_FOUND" });
        }

        await dbService.updateUser(user.id, { confirmed: true });
        return res.json({ status: "success", message: "Email confirmed!" });
      }

      case "forgot-password": {
        const { email } = req.body;
        const user = await dbService.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User with this email does not exist.", code: "ERR_USER_NOT_FOUND" });
        }

        return res.json({ message: "Password reset link sent to your email!" });
      }

      case "reset-password": {
        const { email, newPassword } = req.body;
        const user = await dbService.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User not found.", code: "ERR_USER_NOT_FOUND" });
        }

        await dbService.updateUser(user.id, { password: newPassword });
        return res.json({ message: "Password successfully updated!" });
      }

      case "delete-account": {
        const { userId } = req.body;
        if (!userId) {
          return res.status(400).json({ error: "Missing user ID.", code: "ERR_MISSING_USER" });
        }

        await dbService.deleteUser(userId);
        return res.json({ success: true, message: "Account completely deleted!" });
      }

      default: {
        return res.status(400).json({ error: `Unknown action: ${action}`, code: "ERR_UNKNOWN_ACTION" });
      }
    }
  } catch (error: any) {
    console.error(`Auth handler error [${action}]:`, error);
    const friendlyMessage = handleAuthError(error, `Internal ${action} handler error.`);
    return res.status(500).json({ error: friendlyMessage });
  }
}
