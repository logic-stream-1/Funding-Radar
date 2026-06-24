import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Radar, ArrowRight, ShieldCheck, Zap, Mail, Compass } from "lucide-react";

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <Radar className="w-6 h-6 text-secondary" />
          <span className="font-sans text-xl font-bold tracking-tight text-primary">Funding Radar</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => onNavigate("/agent")}
              className="bg-primary text-on-primary text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate("/sign-in")}
                className="text-on-surface-variant hover:text-primary text-xs font-semibold px-2 py-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate("/sign-up")}
                className="bg-primary text-on-primary text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                Request Invite
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
          {/* Left Panel: Intro */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/5 border border-secondary/15 rounded-full text-secondary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Executive Career Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary leading-[1.1]">
              Anticipate the next <br />
              <span className="text-secondary">Series B–D</span> funding signal.
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-xl">
              A private intelligence agent with a funding-radar skill. Scans VC announcements, extracts PM hiring triggers, and crafts a highly specific &ldquo;way in&rdquo; outreach angle custom-tailored to your unique corporate background.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {user ? (
                <button
                  onClick={() => onNavigate("/agent")}
                  className="bg-primary text-on-primary text-sm font-semibold h-12 px-6 rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Launch Agent Control Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate("/sign-up")}
                    className="bg-primary text-on-primary text-sm font-semibold h-12 px-6 rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Request Invite / Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate("/sign-in")}
                    className="bg-surface-container-low text-on-surface border border-outline-variant/60 text-sm font-semibold h-12 px-6 rounded-lg hover:bg-surface-container-high active:scale-98 transition-all flex items-center justify-center cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-outline-variant/40 max-w-md">
              <div>
                <p className="text-2xl font-bold text-primary font-mono">15 Min</p>
                <p className="text-xs text-outline font-sans uppercase tracking-wider">Weekly Setup</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary font-mono">94%</p>
                <p className="text-xs text-outline font-sans uppercase tracking-wider">Match Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-on-tertiary-container font-mono">100%</p>
                <p className="text-xs text-outline font-sans uppercase tracking-wider">Discreet Sync</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Graphic Bento */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-secondary-container/10 blur-3xl -z-10 rounded-full" />
            
            <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-lg space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <span className="text-xs font-semibold text-outline uppercase tracking-wider">Intelligence Snapshot</span>
                <span className="flex h-2 w-2 rounded-full bg-on-tertiary-container animate-pulse" />
              </div>
              
              <div className="p-4 bg-surface rounded-lg border-l-4 border-secondary space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-primary">VeloPay</h3>
                    <p className="text-xs font-semibold text-secondary font-mono">$42M Series C • Match 4.8/5</p>
                  </div>
                  <span className="text-[10px] text-outline font-mono">2h ago</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  "Expanding into MENA region next quarter. Scaling core payment ledger rails. Former VeloPay advisor is a mentor of yours."
                </p>
              </div>

              <div className="p-4 bg-surface rounded-lg border-l-4 border-secondary/50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-primary">HealthFlow</h3>
                    <p className="text-xs font-semibold text-secondary/60 font-mono">$12M Series A • Match 4.5/5</p>
                  </div>
                  <span className="text-[10px] text-outline font-mono">1d ago</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  "Leverage your background at Optum to help them scale their provider network and navigate regulatory hurdles in the Northeast market."
                </p>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-on-surface-variant font-medium">
                  Configured and delivered directly to your Telegram channel weekly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-outline-variant/40">
          <div className="p-6 bg-white border border-outline-variant rounded-xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center shrink-0 border border-secondary-container/20">
              <Compass className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary mb-1">Way-In Analysis</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Proprietary intelligence mapping your exact engineering or product backgrounds to recently-funded companies with open mandates.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border border-outline-variant rounded-xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center shrink-0 border border-secondary-container/20">
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary mb-1">Discreet Intelligence</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Anonymous career signals designed for current VPs, directors, and C-suite leaders to maintain active passive search.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border border-outline-variant rounded-xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center shrink-0 border border-secondary-container/20">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary mb-1">Instant Bot Dispatch</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bypasses standard applicant portals and routes matches cleanly to your personal Slack or Telegram bot instance.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-surface-container border-t border-outline-variant/40 text-center opacity-70">
        <p className="text-xs text-outline font-mono">© 2026 Funding Radar Analytics • v2.0.0 • Status: Operational</p>
      </footer>
    </div>
  );
};
