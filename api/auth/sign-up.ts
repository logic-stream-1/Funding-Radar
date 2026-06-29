import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../../src/lib/dbService";
import { handleAuthError, seedDefaultRunForUser } from "../../src/lib/apiUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: "Missing required fields.", code: "ERR_MISSING_FIELDS" });
  }

  try {
    const existing = await dbService.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered.", code: "ERR_EMAIL_TAKEN" });
    }

    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password, // Plain text match for simple credential tracking
      full_name,
      role: "Senior Product Leader",
      avatar_url: null,
      confirmed: false, // Must verify email
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
  } catch (error: any) {
    console.error("SignUp error:", error);
    const friendlyMessage = handleAuthError(error, "Internal register handler error.");
    return res.status(500).json({ error: friendlyMessage });
  }
}
