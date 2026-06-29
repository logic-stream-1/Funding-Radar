import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AgentConfig, AgentRun } from "../types";

interface AuthContextType {
  user: User | null;
  config: AgentConfig | null;
  runs: AgentRun[];
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message?: string; email?: string }>;
  confirmEmail: (email: string) => Promise<boolean>;
  signIn: (email: string, password: string, isGoogle?: boolean) => Promise<boolean>;
  signOut: () => void;
  deleteAccount: () => Promise<boolean>;
  updateProfile: (fullName: string, role: string, avatarUrl: string | null) => Promise<boolean>;
  loadConfig: () => Promise<void>;
  saveConfig: (configData: Partial<AgentConfig>) => Promise<boolean>;
  loadRuns: () => Promise<void>;
  triggerRun: () => Promise<{ success: boolean; run?: AgentRun; error?: string }>;
  rateRun: (runId: string, rating: number) => Promise<boolean>;
  clearError: () => void;
  setErrorMsg: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("funding_radar_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Failed to parse restored user", err);
      }
    }
    setLoading(false);
  }, []);

  // Fetch config and runs whenever user changes
  useEffect(() => {
    if (user) {
      loadConfig();
      loadRuns();
    } else {
      setConfig(null);
      setRuns([]);
    }
  }, [user]);

  const clearError = () => setError(null);
  const setErrorMsg = (msg: string | null) => setError(msg);

  const safeParseJson = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    if (text.includes("<html") || text.includes("<body")) {
      if (res.status === 502 || res.status === 503) {
        return { error: "The backend server or database is booting up. Please try again in 5-10 seconds." };
      }
      return { error: `Server error (Status ${res.status}). Please check your Supabase schema configuration or connection credentials.` };
    }
    return { error: text || `HTTP Error ${res.status}` };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth?action=sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Sign up failed.");
      }
      return { success: true, message: data.message, email: data.email };
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    }
  };

  const confirmEmail = async (email: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth?action=confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Email confirmation failed.");
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const signIn = async (email: string, password: string, isGoogle = false) => {
    setError(null);
    try {
      const res = await fetch("/api/auth?action=sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isGoogle })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        if (data.code === "ERR_EMAIL_UNCONFIRMED") {
          throw new Error("CONFIRM_PENDING:" + email);
        }
        throw new Error(data.error || "Invalid credentials.");
      }
      setUser(data.user);
      localStorage.setItem("funding_radar_user", JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("funding_radar_user");
  };

  const deleteAccount = async () => {
    if (!user) return false;
    setError(null);
    try {
      const res = await fetch("/api/auth?action=delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Account deletion failed.");
      }
      signOut();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateProfile = async (fullName: string, role: string, avatarUrl: string | null) => {
    if (!user) return false;
    setError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, full_name: fullName, role, avatar_url: avatarUrl })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }
      setUser(data.user);
      localStorage.setItem("funding_radar_user", JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const loadConfig = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/agent/config?userId=${user.id}`);
      if (res.ok) {
        const data = await safeParseJson(res);
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to load config", err);
    }
  };

  const saveConfig = async (configData: Partial<AgentConfig>) => {
    if (!user) return false;
    setError(null);
    try {
      const res = await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...configData })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Failed to save configuration.");
      }
      setConfig(data.config);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const loadRuns = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/agent/runs/user/${user.id}`);
      if (res.ok) {
        const data = await safeParseJson(res);
        setRuns(data.runs);
      }
    } catch (err) {
      console.error("Failed to load runs", err);
    }
  };

  const triggerRun = async () => {
    if (!user) return { success: false, error: "No user signed in." };
    setError(null);
    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Agent pipeline run failed.");
      }
      // Reload runs
      await loadRuns();
      return { success: true, run: data.run };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const rateRun = async (runId: string, rating: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/agent/runs/rate/${runId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || "Rating failed.");
      }
      await loadRuns();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        config,
        runs,
        loading,
        error,
        signUp,
        confirmEmail,
        signIn,
        signOut,
        deleteAccount,
        updateProfile,
        loadConfig,
        saveConfig,
        loadRuns,
        triggerRun,
        rateRun,
        clearError,
        setErrorMsg
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
