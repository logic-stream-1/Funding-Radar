import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AgentRun } from "../types";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { Radar, Compass, Settings, History, User, Info, FileText, ChevronRight, X, Calendar, DollarSign, Sparkles } from "lucide-react";

interface HistoryPageProps {
  onNavigate: (route: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { runs } = useAuth();
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans">
      
      {/* Header Panel */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 bg-white border-b border-b-outline-variant/45 h-16 shadow-sm">
        <div className="flex items-center gap-2">
          <Radar className="w-6 h-6 text-secondary" />
          <span className="font-sans text-lg font-bold tracking-tight text-primary">Funding Radar Panel</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate("/agent")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <Compass className="w-4 h-4" /> Radar Dashboard
          </button>
          <button onClick={() => onNavigate("/agent/config")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <Settings className="w-4 h-4" /> Agent Config
          </button>
          <button onClick={() => onNavigate("/agent/history")} className="text-secondary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 border-b-2 border-secondary">
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

      {/* Runs Log lists layout */}
      <main className="flex-grow p-6 md:p-10 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Run list Panel */}
        <section className="md:col-span-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-primary tracking-tight">Venture Intelligence Logs</h2>
            <p className="text-[11px] text-on-surface-variant">Click any historical log run to view the generated Markdown Digest.</p>
          </div>

          <div className="space-y-3">
            {runs.length > 0 ? (
              runs.map((run) => {
                const isActive = selectedRun?.id === run.id;
                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center cursor-pointer ${
                      isActive 
                        ? "bg-secondary/5 border-secondary shadow-sm" 
                        : "bg-white border-outline-variant/60 hover:border-outline hover:shadow-sm"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === "completed" ? "bg-emerald-500 animate-pulse" : "bg-error"
                        }`} />
                        <h4 className="font-bold text-xs text-primary font-sans">{formatDate(run.run_started_at)}</h4>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-medium">
                        Found {run.companies_found} companies • Sector matching
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-outline" />
                  </button>
                );
              })
            ) : (
              <div className="bg-white border border-outline-variant p-8 rounded-xl text-center">
                <Info className="w-6 h-6 text-outline mx-auto mb-2" />
                <p className="text-xs text-primary font-bold">No runs recorded yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Detailed Digest Markdown Panel */}
        <section className="md:col-span-7 bg-white border border-outline-variant rounded-xl p-6 shadow-sm min-h-[50vh] flex flex-col justify-between">
          {selectedRun ? (
            <div className="space-y-6">
              
              {/* Report Header metrics */}
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  <div>
                    <h3 className="font-extrabold text-sm text-primary">Venture Digest Analysis</h3>
                    <p className="text-[10px] text-outline font-mono uppercase tracking-wider">
                      ID: {selectedRun.id}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="text-[10px] font-bold text-outline font-mono uppercase tracking-wider">Scrape compute Cost</p>
                  <p className="text-xs font-black text-primary font-mono">${Number(selectedRun.api_cost_usd).toFixed(3)} USD</p>
                </div>
              </div>

              {/* Rendered content */}
              <div className="space-y-1 select-text">
                <MarkdownRenderer content={selectedRun.digest_markdown} />
              </div>

            </div>
          ) : (
            <div className="my-auto text-center space-y-2 py-12">
              <Sparkles className="w-8 h-8 text-secondary/30 mx-auto" />
              <p className="text-xs text-primary font-bold">No digest report selected</p>
              <p className="text-[10px] text-on-surface-variant max-w-xs mx-auto">
                Select any historical run on the left panel to review executive summaries and formulated way-in angles.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};
