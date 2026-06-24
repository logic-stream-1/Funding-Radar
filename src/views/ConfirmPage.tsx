import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Radar, ArrowRight, ShieldCheck } from "lucide-react";

interface ConfirmPageProps {
  onNavigate: (route: string) => void;
}

export const ConfirmPage: React.FC<ConfirmPageProps> = ({ onNavigate }) => {
  const { confirmEmail, clearError, error } = useAuth();
  
  // Try to find the email from URL or localStorage
  const [emailInput, setEmailInput] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get("email");
    if (urlEmail) return urlEmail;
    
    const localEmail = localStorage.getItem("pending_confirm_email");
    if (localEmail) return localEmail;
    
    return "";
  });

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSimulateConfirmation = async () => {
    if (!emailInput.trim()) {
      return;
    }
    setLoading(true);
    clearError();
    
    // Save to localStorage so it's remembered
    localStorage.setItem("pending_confirm_email", emailInput.trim());
    
    const success = await confirmEmail(emailInput.trim());
    setLoading(false);
    if (success) {
      setConfirmed(true);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-outline-variant p-8 rounded-xl shadow-lg text-center space-y-6">
        
        {/* Animated Abstract Radar/Mail Illustration */}
        <div className="relative w-24 h-24 mx-auto bg-secondary-container/10 border border-secondary-container/20 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 border border-secondary/20 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-2 border border-secondary/30 rounded-full animate-pulse" />
          <Mail className="w-8 h-8 text-secondary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-primary tracking-tight">Check your email</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed px-2">
            An executive validation signal has been dispatched. Please confirm your work address to initialize your private radar agent.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 text-left max-w-xs mx-auto">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center" htmlFor="confirmEmailInput">
              Confirming Email Address
            </label>
            <input
              id="confirmEmailInput"
              type="email"
              required
              disabled={confirmed || loading}
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); clearError(); }}
              placeholder="name@company.com"
              className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg text-xs focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-center transition-all disabled:opacity-75"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error font-medium">
            {error}
          </div>
        )}

        {!confirmed ? (
          <div className="space-y-4">
            <button
              onClick={handleSimulateConfirmation}
              disabled={loading || !emailInput.trim()}
              className="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? "Confirming..." : "Simulate Link Confirmation Click"}
            </button>
            <p className="text-[10px] text-outline font-medium">
              Clicking simulates opening the verification link inside your corporate inbox.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-secondary/5 border border-secondary/25 text-secondary text-xs rounded-lg font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Simulated Verification Successful!</span>
            </div>
            
            <button
              onClick={() => onNavigate("/sign-in")}
              className="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Sign In to Your Dashboard</span>
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
