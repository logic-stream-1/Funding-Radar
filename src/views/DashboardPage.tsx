import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CompanyResult, AgentRun } from "../types";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { 
  Radar, Play, Settings, Compass, Users, CheckSquare, History, Star, 
  User, Check, LogOut, Info, ExternalLink, ChevronRight, Search, 
  Building2, DollarSign, AlertCircle, TrendingUp, Bot, Menu, X, ArrowUpRight
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, config, runs, triggerRun, rateRun, signOut } = useAuth();

  // Active filter category
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Selected company result for the side drawer detail view
  const [selectedResult, setSelectedResult] = useState<CompanyResult | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Running agent state & logs simulation
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  
  // Company Results from the latest run
  const [currentResults, setCurrentResults] = useState<CompanyResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Mobile menu open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Staggered log lines for simulation
  const pipelineLogs = [
    "Initializing Private Radar Agent Pipeline...",
    "Retrieving active candidate background summary configuration...",
    "Searching active regions & target sectors funding announcements (Web Search Call)...",
    "Filtering sector records & parsing investment sizes (Claude Call 1 - Parse and Filter)...",
    "Synthesizing personal connection with companies & formulating custom angles (Claude Call 2 - Angle Generation)...",
    "Calculating match scores & confidence levels (Ranking and Formatting)...",
    "Syncing results securely to cloud storage...",
    "Sending Telegram digest notification payload (Delivery channel check)...",
    "Pipeline successfully finished!"
  ];

  // Load results of the latest completed run
  useEffect(() => {
    const latestCompletedRun = runs.find(r => r.status === "completed");
    if (latestCompletedRun) {
      setLoadingResults(true);
      fetch(`/api/agent/runs/results/${latestCompletedRun.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to load results");
        })
        .then(data => {
          setCurrentResults(data.results);
          setLoadingResults(false);
        })
        .catch(err => {
          console.error("Error loading results", err);
          setLoadingResults(false);
        });
    }
  }, [runs]);

  // Simulate logs tick when running
  useEffect(() => {
    let interval: any;
    if (isRunningAgent && currentLogIndex < pipelineLogs.length) {
      interval = setInterval(() => {
        setRunLogs(prev => [...prev, pipelineLogs[currentLogIndex]]);
        setCurrentLogIndex(prev => prev + 1);
      }, 1000);
    } else if (isRunningAgent && currentLogIndex >= pipelineLogs.length) {
      // Completed, invoke actual backend route
      triggerRun().then(res => {
        setIsRunningAgent(false);
        setRunLogs([]);
        setCurrentLogIndex(0);
        if (res.success && res.run) {
          // Toast or auto-load results is done via runs state update
        }
      });
    }
    return () => clearInterval(interval);
  }, [isRunningAgent, currentLogIndex]);

  const handleStartAgent = () => {
    if (isRunningAgent) return;
    setRunLogs([]);
    setCurrentLogIndex(0);
    setIsRunningAgent(true);
  };

  // Star rating update helper
  const handleRatingSubmit = async (resultCompany: CompanyResult, ratingNum: number) => {
    const runId = resultCompany.run_id;
    await rateRun(runId, ratingNum);
    // Reload results local state to reflect rating if needed
    setSelectedResult(prev => prev ? { ...prev } : null);
  };

  // Filters logic
  const filteredResults = currentResults.filter(company => {
    // Sector match
    const sectorMatches = activeFilter === "all" || 
      company.sector.toLowerCase().includes(activeFilter.toLowerCase()) ||
      (activeFilter === "ai_ml" && (company.description.toLowerCase().includes("ai") || company.description.toLowerCase().includes("model") || company.description.toLowerCase().includes("neural")));
    
    // Search query match
    const searchMatches = !searchQuery || 
      company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.way_in_angle.toLowerCase().includes(searchQuery.toLowerCase());

    return sectorMatches && searchMatches;
  });

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans">
      
      {/* Executive Header banner */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 bg-white border-b border-outline-variant/45 h-16 shadow-sm">
        <div className="flex items-center gap-2">
          <Radar className="w-6 h-6 text-secondary animate-pulse" />
          <span className="font-sans text-lg font-bold tracking-tight text-primary">Funding Radar Panel</span>
          <span className="hidden sm:inline bg-secondary/5 border border-secondary/15 rounded text-[10px] font-bold text-secondary px-2 py-0.5 ml-2 uppercase tracking-wide">v2.0 · Live Agent</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate("/agent")} className="text-secondary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 border-b-2 border-secondary">
            <Compass className="w-4 h-4" /> Radar Dashboard
          </button>
          <button onClick={() => onNavigate("/agent/config")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <Settings className="w-4 h-4" /> Agent Config
          </button>
          <button onClick={() => onNavigate("/agent/history")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <History className="w-4 h-4" /> History
          </button>
          <button onClick={() => onNavigate("/profile")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <User className="w-4 h-4" /> Profile
          </button>
        </div>

        {/* User Info / Logout Button */}
        <div className="hidden md:flex items-center gap-3 border-l border-outline-variant/40 pl-6">
          <div className="flex items-center gap-2">
            {user?.avatar_url ? (
              <img src={user.avatar_url} referrerPolicy="no-referrer" alt="avatar" className="w-8 h-8 rounded-full object-cover border border-outline" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary text-xs font-bold border border-secondary-container/30">
                {user?.full_name?.charAt(0) || "A"}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-extrabold text-primary leading-tight">{user?.full_name || "Alexander Sterling"}</p>
              <p className="text-[9px] font-medium text-on-surface-variant leading-none">{user?.role || "Senior Product Leader"}</p>
            </div>
          </div>
          <button
            onClick={() => { signOut(); onNavigate("/sign-in"); }}
            title="Log Out"
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/5 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-primary hover:bg-surface-container rounded-lg cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-16 bg-white flex flex-col justify-between border-b border-outline-variant">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
              {user?.avatar_url ? (
                <img src={user.avatar_url} referrerPolicy="no-referrer" alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary font-bold">
                  {user?.full_name?.charAt(0) || "A"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-primary">{user?.full_name}</p>
                <p className="text-xs text-on-surface-variant">{user?.role}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-4 text-sm font-bold text-primary">
              <button onClick={() => { setIsMobileMenuOpen(false); onNavigate("/agent"); }} className="flex items-center gap-2 text-left py-1 text-secondary">
                <Compass className="w-4 h-4" /> Radar Dashboard
              </button>
              <button onClick={() => { setIsMobileMenuOpen(false); onNavigate("/agent/config"); }} className="flex items-center gap-2 text-left py-1">
                <Settings className="w-4 h-4" /> Agent Configuration
              </button>
              <button onClick={() => { setIsMobileMenuOpen(false); onNavigate("/agent/history"); }} className="flex items-center gap-2 text-left py-1">
                <History className="w-4 h-4" /> Run History
              </button>
              <button onClick={() => { setIsMobileMenuOpen(false); onNavigate("/profile"); }} className="flex items-center gap-2 text-left py-1">
                <User className="w-4 h-4" /> Edit Profile
              </button>
            </nav>
          </div>

          <div className="p-6 border-t border-outline-variant/30 bg-surface-container">
            <button
              onClick={() => { signOut(); onNavigate("/sign-in"); }}
              className="w-full h-11 bg-error-container/20 hover:bg-error-container/40 text-error font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Console Layout */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Greeting, Trigger Radar & Opportunities Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Executive Morning Greeting */}
          <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">
                {getGreeting()}, {user?.full_name?.split(" ")[0] || "Alexander"}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">
                Your private agent identified <strong className="text-secondary font-bold">{currentResults.length} high-probability signals</strong> aligned with your background summary.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-bold shrink-0">
              <span className="px-3 py-1 bg-secondary/5 text-secondary border border-secondary/10 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> 14 News Scanned
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 3 Matches
              </span>
            </div>
          </div>

          {/* Quick Manual Run Action Terminal */}
          <div className="bg-primary-container text-white rounded-xl p-6 shadow-sm relative overflow-hidden border border-primary">
            {/* Background vector accents */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
              <Radar className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-fixed-dim bg-secondary-container/30 px-2 py-0.5 rounded tracking-widest">Interactive Pilot</span>
                  <h3 className="text-lg font-extrabold text-white">Manual Funding Radar Agent</h3>
                  <p className="text-xs text-gray-300 max-w-lg leading-relaxed">
                    Instantly boot the AI crawler to fetch recent deals in <strong className="text-white font-bold">{config?.sectors?.join(", ") || "SaaS, Fintech, HealthTech"}</strong> and generate specific outreach angles with your background.
                  </p>
                </div>
                
                <button
                  onClick={handleStartAgent}
                  disabled={isRunningAgent}
                  className="bg-secondary text-primary font-bold text-xs h-10 px-4 rounded-lg flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-primary text-primary" />
                  <span>{isRunningAgent ? "Agent Active" : "Run Agent Now"}</span>
                </button>
              </div>

              {/* Simulated Live Logs terminal */}
              {(isRunningAgent || runLogs.length > 0) && (
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-[11px] text-gray-200 space-y-1.5 h-36 overflow-y-auto shadow-inner transition-all">
                  <div className="flex justify-between items-center text-outline border-b border-white/5 pb-1 mb-2 font-sans font-bold">
                    <span>LIVE LOG PIPELINE TRANSMISSION</span>
                    <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  </div>
                  {runLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 items-start text-emerald-400">
                      <span className="text-emerald-500 font-bold select-none">&gt;</span>
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))}
                  {isRunningAgent && (
                    <div className="flex gap-2 items-center text-gray-400 animate-pulse">
                      <span>&gt;</span>
                      <span className="text-[10px]">Processing chunk pipeline with Gemini...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Feed Filters Bar (Screen 7 style) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-extrabold text-md text-primary tracking-tight">Opportunities Matching Your Profile</h3>
              
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search matching signals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-white border border-outline-variant rounded-lg text-xs outline-none focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Verticals Filtering pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "all" ? "bg-primary text-white border border-primary shadow-sm" : "bg-white text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container"
                }`}
              >
                All Verticals
              </button>
              <button
                onClick={() => setActiveFilter("healthtech")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "healthtech" ? "bg-primary text-white border border-primary shadow-sm" : "bg-white text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container"
                }`}
              >
                HealthTech
              </button>
              <button
                onClick={() => setActiveFilter("fintech")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "fintech" ? "bg-primary text-white border border-primary shadow-sm" : "bg-white text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container"
                }`}
              >
                FinTech
              </button>
              <button
                onClick={() => setActiveFilter("saas")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "saas" ? "bg-primary text-white border border-primary shadow-sm" : "bg-white text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container"
                }`}
              >
                SaaS
              </button>
              <button
                onClick={() => setActiveFilter("ai_ml")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === "ai_ml" ? "bg-primary text-white border border-primary shadow-sm" : "bg-white text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container"
                }`}
              >
                AI / ML
              </button>
            </div>

            {/* Company Cards Grid (Screen 1 & Screen 7 layout) */}
            {loadingResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="bg-white border border-outline-variant/40 rounded-xl p-5 space-y-4 animate-pulse">
                    <div className="h-4 bg-outline-variant/40 rounded w-1/3" />
                    <div className="h-10 bg-outline-variant/30 rounded" />
                    <div className="h-3 bg-outline-variant/20 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((company, index) => {
                  const matchRating = Number(company.relevance_score) || 4.5;
                  const displaySize = company.round_size_usd ? `$${(company.round_size_usd / 1000000).toFixed(1)}M` : "Undisclosed";

                  return (
                    <article
                      key={company.id}
                      className="bg-white border border-outline-variant/60 hover:border-secondary hover:shadow-md transition-all rounded-xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        {/* Header: Name and Match rating Badge */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-secondary shrink-0" />
                            <h4 className="font-extrabold text-sm text-primary tracking-tight">{company.company_name}</h4>
                          </div>
                          
                          {/* Match Rating indicator badge */}
                          <div className="flex items-center gap-1 bg-secondary/5 border border-secondary/15 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-secondary font-mono">
                            <Star className="w-3 h-3 fill-secondary text-secondary" />
                            <span>{matchRating.toFixed(1)}/5 Match</span>
                          </div>
                        </div>

                        {/* Middle meta section */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider font-mono">
                          <span>{company.stage}</span>
                          <span>•</span>
                          <span>{displaySize}</span>
                          <span>•</span>
                          <span>{company.region}</span>
                        </div>

                        {/* Brief descriptive copy */}
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {company.description}
                        </p>
                        
                        {/* PM hiring trigger marker */}
                        {company.pm_hiring_signal && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-[9px] font-bold px-1.5 py-0.5 tracking-wide uppercase">
                            <CheckSquare className="w-3 h-3 text-emerald-700" /> Active PM Hiring Signal
                          </span>
                        )}

                        {/* Way In Angle excerpt */}
                        <div className="bg-surface rounded-lg p-3 border-l-4 border-secondary space-y-1">
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider font-mono">Way In Angle Excerpt</p>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic line-clamp-2">
                            &ldquo;{company.way_in_angle}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* View signal trigger */}
                      <button
                        onClick={() => setSelectedResult(company)}
                        className="w-full h-9 bg-surface-container hover:bg-secondary/10 hover:text-secondary text-primary font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View Strategic Analysis</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant p-10 rounded-xl text-center space-y-2">
                <Info className="w-8 h-8 text-outline mx-auto" />
                <p className="text-xs text-primary font-bold">No matching opportunities found</p>
                <p className="text-[10px] text-on-surface-variant">
                  Try adjusting your filter categories, clearing your search query, or manual re-running the agent.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Active Profile Stats Card (Screen 1 bento) */}
        <aside className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-primary border-b border-outline-variant/30 pb-2">Active Intelligence Profile</h4>
            
            <div className="space-y-4">
              {/* Background summary block summary */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider font-mono">My Background Summary</p>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4 bg-surface rounded-lg p-3 border border-outline-variant/30 font-medium">
                  {config?.background_summary || "Please set your background summary..."}
                </p>
              </div>

              {/* Sectors list pills */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider font-mono">Tracking Sectors</p>
                <div className="flex flex-wrap gap-1.5">
                  {config?.sectors?.map(sec => (
                    <span key={sec} className="bg-secondary/5 border border-secondary/15 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wide">
                      {sec}
                    </span>
                  )) || <span className="text-xs text-outline italic">No sectors selected</span>}
                </div>
              </div>

              {/* Min funding size card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-outline-variant/30 p-3 rounded-lg text-left">
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider font-mono">Min Funding Size</p>
                  <p className="text-sm font-extrabold text-primary font-mono mt-1">
                    {config?.funding_min_usd ? `$${(config.funding_min_usd / 1000000).toFixed(1)}M` : "$0.5M"}
                  </p>
                </div>
                <div className="bg-surface border border-outline-variant/30 p-3 rounded-lg text-left">
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider font-mono">Alert Region</p>
                  <p className="text-sm font-extrabold text-primary font-mono mt-1">
                    {config?.active_regions?.[0] || "India"}
                  </p>
                </div>
              </div>

              {/* Telegram Delivery channel */}
              <div className="bg-surface border border-outline-variant/30 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider font-mono">Alert Delivery Channel</p>
                  <p className="text-xs font-bold text-primary mt-0.5">
                    {config?.telegram_chat_id ? "Telegram Bot Active" : "In-App Console Only"}
                  </p>
                </div>
                <Bot className={`w-5 h-5 ${config?.telegram_chat_id ? "text-secondary" : "text-outline"}`} />
              </div>

              {/* Edit button */}
              <button
                onClick={() => onNavigate("/agent/config")}
                className="w-full h-10 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Adjust Intelligence Parameters</span>
              </button>
            </div>
          </div>

          {/* Quick guide card */}
          <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl space-y-2">
            <h5 className="font-extrabold text-xs text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <Info className="w-4 h-4 text-secondary" />
              <span>How it works</span>
            </h5>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              When the Funding Radar Agent runs, it scans active investment notifications, automatically maps the tech stack and scaling needs to your background summary, and formulates precise outreach scripts using Gemini AI.
            </p>
          </div>

        </aside>

      </main>

      {/* Slide-Open Right Drawer Detail View (Screen 1 & 7 View Signal Side panel) */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-[600px] h-full bg-white shadow-2xl flex flex-col justify-between relative transform transition-transform duration-300">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/45 bg-surface">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-extrabold text-base text-primary tracking-tight">{selectedResult.company_name} Strategic Analysis</h3>
                  <p className="text-[10px] text-outline font-mono uppercase tracking-wider">
                    {selectedResult.sector} • {selectedResult.stage} • {selectedResult.region}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 text-outline hover:text-primary hover:bg-outline-variant/30 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {/* Core metrics and match scoring bento */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface border border-outline-variant/30 p-3 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider font-mono">Investment round</p>
                  <p className="text-sm font-extrabold text-primary font-mono mt-1">
                    {selectedResult.round_size_usd ? `$${(selectedResult.round_size_usd / 1000000).toFixed(1)}M` : "Undisclosed"}
                  </p>
                </div>
                <div className="bg-surface border border-outline-variant/30 p-3 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider font-mono">Match confidence</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-2.5 rounded font-mono ${
                    selectedResult.angle_confidence === "HIGH" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {selectedResult.angle_confidence}
                  </span>
                </div>
                <div className="bg-surface border border-outline-variant/30 p-3 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider font-mono">PM Relevance</p>
                  <p className="text-sm font-extrabold text-secondary font-mono mt-1">
                    {selectedResult.relevance_score}/5
                  </p>
                </div>
              </div>

              {/* Startup descriptive details */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider font-mono">Business Description</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedResult.description}
                </p>
              </div>

              {/* Custom formulated outreach angle */}
              <div className="space-y-3 bg-secondary/5 border border-secondary/15 rounded-xl p-5">
                <div className="flex items-center gap-1.5 text-secondary border-b border-secondary/10 pb-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono">Formulated Gemini Way-In Angle</h4>
                </div>
                <p className="text-xs text-primary leading-relaxed font-semibold italic">
                  &ldquo;{selectedResult.way_in_angle}&rdquo;
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed pt-2">
                  Use this customized insight when messaging the founders, HR directors, or lead investment partners directly to bypass standard corporate applications.
                </p>
              </div>

              {/* Star Rating controller */}
              <div className="space-y-3 bg-surface border border-outline-variant/40 rounded-xl p-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono">Rate this Intelligence match quality</p>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((starNum) => {
                    const runItem = runs.find(r => r.id === selectedResult.run_id);
                    const currentRating = runItem?.quality_rating || 0;
                    return (
                      <button
                        key={starNum}
                        onClick={() => handleRatingSubmit(selectedResult, starNum)}
                        className="p-1 hover:scale-110 transition-all cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${starNum <= currentRating ? "fill-amber-400 text-amber-400" : "text-outline"}`} />
                      </button>
                    );
                  })}
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider font-mono ml-2">
                    {runs.find(r => r.id === selectedResult.run_id)?.quality_rating ? "Rated" : "Click to rate"}
                  </span>
                </div>
              </div>

            </div>

            {/* Drawer Footer actions */}
            <div className="p-6 border-t border-outline-variant/45 bg-surface flex gap-3">
              <a
                href={selectedResult.source_url}
                target="_blank"
                referrerPolicy="no-referrer"
                className="flex-grow h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View original news release</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setSelectedResult(null)}
                className="h-11 px-5 bg-white border border-outline-variant text-primary font-bold text-xs rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
