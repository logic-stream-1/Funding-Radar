import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Radar, Eye, EyeOff, ShieldCheck, HelpCircle } from "lucide-react";

interface SignInPageProps {
  onNavigate: (route: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const { signIn, error, clearError, setErrorMsg } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    const success = await signIn(email, password);
    setIsSubmitting(false);

    if (success) {
      onNavigate("/agent");
    } else {
      // Check if error contains the confirm indicator
      // Context uses CONFIRM_PENDING:email to state unconfirmed email
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setIsSubmitting(true);
    // Simulates an OAuth authentication popup and auto-authenticates
    const success = await signIn("a.sterling@exec-path.com", "Password123!", true);
    setIsSubmitting(false);
    if (success) {
      onNavigate("/agent");
    }
  };

  const handleVerifyPending = async (emailAddr: string) => {
    localStorage.setItem("pending_confirm_email", emailAddr);
    onNavigate(`/confirm?email=${encodeURIComponent(emailAddr)}`);
  };

  const isPendingConfirm = error?.startsWith("CONFIRM_PENDING:");
  const pendingEmail = isPendingConfirm ? error?.split(":")[1] : "";

  return (
    <div className="bg-background text-on-surface min-h-screen flex font-sans">
      <main className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Side: Brand Hero Panel (Hidden on Mobile) */}
        <section className="hidden lg:flex lg:col-span-6 bg-primary-container relative flex-col justify-between p-12 overflow-hidden text-white border-r border-outline-variant/30">
          {/* Subtle Background Venture Capital Map Grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Dynamic curves to simulate capital flows */}
              <path d="M 50 100 Q 200 150 400 300 T 800 100" fill="none" stroke="#2170e4" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 100 400 Q 300 200 600 500" fill="none" stroke="#009668" strokeWidth="1.5" />
              <circle cx="400" cy="300" r="6" fill="#2170e4" />
              <circle cx="100" cy="400" r="4" fill="#009668" />
              <circle cx="600" cy="500" r="5" fill="#009668" />
            </svg>
          </div>

          {/* Logo Header */}
          <div className="relative z-10 flex items-center gap-2">
            <Radar className="w-7 h-7 text-secondary" />
            <h1 className="text-xl font-bold tracking-tight text-white select-none">Funding Radar</h1>
          </div>

          {/* Core Visual Text */}
          <div className="relative z-10 space-y-6 max-w-md my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/20 rounded-full border border-secondary-fixed-dim/30">
              <ShieldCheck className="w-4 h-4 text-secondary-fixed-dim" />
              <span className="text-[10px] font-bold text-secondary-fixed-dim uppercase tracking-wider">Executive Network</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Anticipate the next <br />
              <span className="text-secondary-fixed-dim">Series B–D</span> signal.
            </h2>
            <p className="text-on-primary-container text-sm leading-relaxed text-gray-300">
              Access high-fidelity funding intelligence and strategic &ldquo;way in&rdquo; analysis curated specifically for senior product leadership.
            </p>
          </div>

          {/* Flow Metrics */}
          <div className="relative z-10 flex gap-8 items-center border-t border-white/10 pt-6">
            <div className="flex flex-col">
              <span className="text-lg font-bold font-mono text-secondary-fixed-dim">500+</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Signals / Month</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-lg font-bold font-mono text-secondary-fixed-dim">94%</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Confidence Score</span>
            </div>
          </div>
        </section>

        {/* Right Side: Interactive Sign In Form */}
        <section className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white relative">
          <div className="w-full max-w-[400px] flex flex-col justify-between h-full py-8">
            <div className="my-auto space-y-6">
              <div className="space-y-1">
                {/* Mobile-only branding display */}
                <div className="flex items-center gap-2 lg:hidden mb-4">
                  <Radar className="w-6 h-6 text-secondary" />
                  <span className="text-md font-bold tracking-tight text-primary">Funding Radar</span>
                </div>
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">Sign In</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Secure access to your professional intelligence dashboard.
                </p>
              </div>

              {/* Error messages */}
              {error && !isPendingConfirm && (
                <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error font-medium">
                  {error}
                </div>
              )}

              {isPendingConfirm && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
                  <p className="font-semibold">Email confirmation is pending for {pendingEmail}.</p>
                  <button
                    onClick={() => handleVerifyPending(pendingEmail || "")}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Confirm Email Now
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-outline-variant hover:bg-surface-container-low transition-colors rounded-lg text-xs font-semibold text-primary cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Separator */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-outline-variant/50"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-semibold text-outline uppercase tracking-widest">or use email</span>
                  <div className="flex-grow border-t border-outline-variant/50"></div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                    Work Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    placeholder="name@company.com"
                    className="w-full h-11 px-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate("/forgot-password")}
                      className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      placeholder="••••••••"
                      className="w-full h-11 pl-3 pr-10 bg-white border border-outline-variant rounded-lg text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Keep Signed In Checkbox */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20"
                  />
                  <label htmlFor="remember" className="text-xs text-on-surface-variant select-none cursor-pointer">
                    Keep me signed in for 30 days
                  </label>
                </div>

                {/* Sign In Trigger */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary text-on-primary font-bold text-sm rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Authenticating..." : "Sign In"}
                </button>
              </form>
            </div>

            {/* Footer Signup */}
            <footer className="mt-8 text-center space-y-4">
              <p className="text-xs text-on-surface-variant font-medium">
                Don't have an executive account?{" "}
                <button
                  onClick={() => onNavigate("/sign-up")}
                  className="text-secondary font-bold hover:underline cursor-pointer ml-1"
                >
                  Request Invite
                </button>
              </p>
              
              <div className="flex justify-center gap-4 text-[10px] text-outline font-bold uppercase tracking-wider">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
            </footer>

          </div>
        </section>

      </main>
    </div>
  );
};
