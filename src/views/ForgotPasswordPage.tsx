import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Radar, KeyRound, ArrowRight, Check } from "lucide-react";

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { clearError, error } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to dispatch reset email.");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-outline-variant p-8 rounded-xl shadow-lg space-y-6 text-center">
        <div className="relative w-20 h-20 mx-auto bg-secondary-container/10 border border-secondary-container/20 rounded-full flex items-center justify-center">
          <KeyRound className="w-8 h-8 text-secondary" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-primary tracking-tight">Forgot Password</h2>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Provide your corporate email address to receive a secure credentials recovery dispatch.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error font-medium">
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Work Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-11 px-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? "Dispatching..." : "Send Reset Dispatch"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-secondary/5 border border-secondary/25 text-secondary text-xs rounded-lg font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Simulated recovery email dispatched!</span>
            </div>

            <button
              onClick={() => onNavigate("/sign-in")}
              className="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="border-t border-outline-variant/30 pt-4">
          <button
            onClick={() => onNavigate("/sign-in")}
            className="text-xs text-outline font-semibold hover:text-primary transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
