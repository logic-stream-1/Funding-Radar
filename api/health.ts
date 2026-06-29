import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbService } from "../src/lib/dbService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  return res.json({ 
    status: "ok", 
    time: new Date().toISOString(), 
    databaseMode: dbService.isSupabaseActive() ? "supabase" : "local" 
  });
}
