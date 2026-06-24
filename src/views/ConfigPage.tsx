import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Radar, Compass, Settings, History, User, LogOut, Check, Info, Bot, HelpCircle } from "lucide-react";

interface ConfigPageProps {
  onNavigate: (route: string) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ onNavigate }) => {
  const { user, config, saveConfig, signOut } = useAuth();

  // Local state initialized from context
  const [backgroundSummary, setBackgroundSummary] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [fundingMinUsd, setFundingMinUsd] = useState(500000);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [activeRegion, setActiveRegion] = useState("Global");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setBackgroundSummary(config.background_summary || "");
      setSectors(config.sectors || []);
      setFundingMinUsd(config.funding_min_usd || 500000);
      setTelegramChatId(config.telegram_chat_id || "");
      setActiveRegion(config.active_regions?.[0] || "Global");
    }
  }, [config]);

  const handleSectorToggle = (sectorName: string) => {
    if (sectors.includes(sectorName)) {
      setSectors(sectors.filter(s => s !== sectorName));
    } else {
      setSectors([...sectors, sectorName]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const success = await saveConfig({
      background_summary: backgroundSummary,
      sectors: sectors,
      funding_min_usd: Number(fundingMinUsd),
      telegram_chat_id: telegramChatId,
      active_regions: [activeRegion],
    });

    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // clear after 3s
    }
  };

  const sectorsPool = ["HealthTech", "Fintech", "EdTech", "SaaS", "AI/ML", "Sustainability", "Logistics", "Consumer"];

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans">
      
      {/* Header Panel */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 bg-white border-b border-outline-variant/45 h-16 shadow-sm">
        <div className="flex items-center gap-2">
          <Radar className="w-6 h-6 text-secondary" />
          <span className="font-sans text-lg font-bold tracking-tight text-primary">Funding Radar Panel</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate("/agent")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <Compass className="w-4 h-4" /> Radar Dashboard
          </button>
          <button onClick={() => onNavigate("/agent/config")} className="text-secondary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 border-b-2 border-secondary">
            <Settings className="w-4 h-4" /> Agent Config
          </button>
          <button onClick={() => onNavigate("/agent/history")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <History className="w-4 h-4" /> History
          </button>
          <button onClick={() => onNavigate("/profile")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <User className="w-4 h-4" /> Profile
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("/agent")}
            className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </header>

      {/* Configuration Form Layout */}
      <main className="flex-grow p-6 md:p-10 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-primary tracking-tight">Agent Parameter Configuration</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Fine-tune the passive search crawlers to scan, score, and customize outreach.
            </p>
          </div>

          {/* Success toast inside layout */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
              <span>Agent parameters successfully saved! Live crawlers updated.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white border border-outline-variant p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
            
            {/* Background Summary section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-extrabold text-primary uppercase tracking-widest" htmlFor="background">
                  Background Summary (The &ldquo;Anchor&rdquo;)
                </label>
                <span className="text-[10px] text-outline font-semibold">Min 100 characters</span>
              </div>
              <textarea
                id="background"
                required
                rows={6}
                value={backgroundSummary}
                onChange={(e) => setBackgroundSummary(e.target.value)}
                placeholder="Include past executive roles, specialized system designs, core technologies scaling experience (e.g. Stripe, AWS, Optum), and patent credits if applicable..."
                className="w-full p-4 bg-surface border border-outline-variant rounded-lg text-xs leading-relaxed focus:border-secondary outline-none transition-colors font-sans"
              />
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                Provide a clean, descriptive narrative of your background. The agent uses this text block specifically when mapping &ldquo;Way In Outreach Angles&rdquo; dynamically via Gemini AI.
              </p>
            </div>

            {/* Verticals checklist */}
            <div className="space-y-3">
              <label className="block text-[10px] font-extrabold text-primary uppercase tracking-widest">
                Target Funding Verticals
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sectorsPool.map((sec) => {
                  const active = sectors.includes(sec);
                  return (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => handleSectorToggle(sec)}
                      className={`h-10 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        active 
                          ? "bg-secondary/5 text-secondary border-secondary" 
                          : "bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container"
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      <span>{sec}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Funding limits and active regions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-primary uppercase tracking-widest" htmlFor="minFunding">
                  Minimum Funding round size
                </label>
                <select
                  id="minFunding"
                  value={fundingMinUsd}
                  onChange={(e) => setFundingMinUsd(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-surface border border-outline-variant rounded-lg text-xs font-bold text-primary focus:border-secondary outline-none transition-colors"
                >
                  <option value={100000}>$100k+ (Seed/Pre-Seed)</option>
                  <option value={500000}>$500k+ (Standard Seed+)</option>
                  <option value={1000000}>$1.0M+ (Series A Focus)</option>
                  <option value={5000000}>$5.0M+ (Mid Market)</option>
                  <option value={10000000}>$10.0M+ (Series B-C High Scale)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-primary uppercase tracking-widest" htmlFor="region">
                  Target Region / Country
                </label>
                <select
                  id="region"
                  value={activeRegion}
                  onChange={(e) => setActiveRegion(e.target.value)}
                  className="w-full h-11 px-3 bg-surface border border-outline-variant rounded-lg text-xs font-bold text-primary focus:border-secondary outline-none transition-colors cursor-pointer"
                >
                  <option value="Global">Global / All Regions</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="Israel">Israel</option>
                  <option value="Brazil">Brazil</option>
                  <option value="South Africa">South Africa</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="South Korea">South Korea</option>
                  <option value="China">China</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Finland">Finland</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Estonia">Estonia</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                </select>
                <p className="text-[9px] text-outline font-bold">Select any target market or Global to track real-time funding events.</p>
              </div>

            </div>

            {/* Telegram delivery channel options */}
            <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-secondary animate-pulse" />
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-wide">Automated Telegram Bot Delivery</h4>
                </div>
                <span className="text-[10px] uppercase font-bold text-secondary bg-secondary-container/30 px-2 py-0.5 rounded tracking-wide">Real API Connected</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="tgChat">
                    Telegram Chat ID
                  </label>
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="text-[9px] font-bold text-secondary hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Chat ID via @UserInfoBot</span>
                    <HelpCircle className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  id="tgChat"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. 182749382"
                  className="w-full h-11 px-3 bg-surface border border-outline-variant rounded-lg text-xs focus:border-secondary outline-none transition-colors"
                />
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                  Provide your personal Telegram Chat ID. The agent will attempt a real HTTP POST message dispatch on completed radar runs. (Requires setting <code className="bg-surface border border-outline-variant/50 px-1 rounded text-primary text-[10px] font-mono">TELEGRAM_BOT_TOKEN</code> in your environment).
                </p>
              </div>
            </div>

            {/* Save trigger */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-grow h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? "Saving Configuration..." : "Save Config and Sync Crawlers"}
              </button>
              
              <button
                type="button"
                onClick={() => onNavigate("/agent")}
                className="h-11 px-5 bg-white border border-outline-variant text-primary font-bold text-xs rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </form>

        </div>
      </main>
    </div>
  );
};
