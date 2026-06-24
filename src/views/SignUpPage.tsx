import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Radar, Check, X, Eye, EyeOff, Lock } from "lucide-react";

interface SignUpPageProps {
  onNavigate: (route: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp, error, clearError, setErrorMsg } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password requirements validation state
  const [reqs, setReqs] = useState({
    length: false,
    special: false,
    upper: false,
    number: false,
  });

  useEffect(() => {
    setReqs({
      length: password.length >= 8,
      special: /[^A-Za-z0-9]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!fullName.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Work Email is required.");
      return;
    }

    const missingReqs = [];
    if (!reqs.length) missingReqs.push("at least 8 characters");
    if (!reqs.special) missingReqs.push("a special symbol");
    if (!reqs.upper) missingReqs.push("an uppercase letter");
    if (!reqs.number) missingReqs.push("a numeric digit");

    if (missingReqs.length > 0) {
      setErrorMsg(`Password requirements not met. Missing: ${missingReqs.join(", ")}.`);
      return;
    }

    setIsSubmitting(true);

    const result = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (result.success && result.email) {
      localStorage.setItem("pending_confirm_email", result.email);
      onNavigate(`/confirm?email=${encodeURIComponent(result.email)}`);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex font-sans">
      <main className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Side: Brand Hero Panel */}
        <section className="hidden lg:flex lg:col-span-6 bg-primary-container relative flex-col justify-between p-12 overflow-hidden text-white border-r border-outline-variant/30">
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-signup" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-signup)" />
              <path d="M 100 500 C 200 400, 300 100, 700 200" fill="none" stroke="#2170e4" strokeWidth="2.5" />
              <circle cx="700" cy="200" r="8" fill="#2170e4" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <Radar className="w-7 h-7 text-secondary" />
            <h1 className="text-xl font-bold tracking-tight text-white select-none">Funding Radar</h1>
          </div>

          <div className="relative z-10 space-y-6 max-w-md my-auto">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              A private agent with a <span className="text-secondary-fixed-dim">funding-radar</span> skill.
            </h2>
            <p className="text-on-primary-container text-sm leading-relaxed text-gray-300">
              Scans news and public records, filters by sector, size, and location, and generates customized reaching angles directly to your workspace.
            </p>
          </div>

          <div className="relative z-10 flex gap-6 items-center border-t border-white/10 pt-6">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Secure, discreet sandbox environment.
            </p>
          </div>
        </section>

        {/* Right Side: Sign Up Form */}
        <section className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 bg-white relative">
          <div className="w-full max-w-[400px] flex flex-col justify-between h-full py-8">
            <div className="my-auto space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">Create Account</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Join our executive career tracking system in seconds.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearError(); }}
                    placeholder="Alexander Sterling"
                    className="w-full h-11 px-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  />
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
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
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

                {/* Password requirements visual check list */}
                <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-3 space-y-2">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-secondary" />
                    <span>Password Requirements</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                    <div className="flex items-center gap-1.5">
                      {reqs.length ? (
                        <Check className="w-4 h-4 text-secondary stroke-[3px]" />
                      ) : (
                        <X className="w-4 h-4 text-error stroke-[3px]" />
                      )}
                      <span className={reqs.length ? "text-primary font-semibold" : "text-on-surface-variant"}>8+ Characters</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {reqs.special ? (
                        <Check className="w-4 h-4 text-secondary stroke-[3px]" />
                      ) : (
                        <X className="w-4 h-4 text-error stroke-[3px]" />
                      )}
                      <span className={reqs.special ? "text-primary font-semibold" : "text-on-surface-variant"}>Special Symbol</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {reqs.upper ? (
                        <Check className="w-4 h-4 text-secondary stroke-[3px]" />
                      ) : (
                        <X className="w-4 h-4 text-error stroke-[3px]" />
                      )}
                      <span className={reqs.upper ? "text-primary font-semibold" : "text-on-surface-variant"}>Uppercase Letter</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {reqs.number ? (
                        <Check className="w-4 h-4 text-secondary stroke-[3px]" />
                      ) : (
                        <X className="w-4 h-4 text-error stroke-[3px]" />
                      )}
                      <span className={reqs.number ? "text-primary font-semibold" : "text-on-surface-variant"}>Numeric Digit</span>
                    </div>
                  </div>
                </div>

                {/* Create Account Trigger */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary text-on-primary font-bold text-sm rounded-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Request Access / Create Account"}
                </button>
              </form>
            </div>

            <footer className="mt-8 text-center space-y-4">
              <p className="text-xs text-on-surface-variant font-medium">
                Already registered?{" "}
                <button
                  onClick={() => onNavigate("/sign-in")}
                  className="text-secondary font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            </footer>

          </div>
        </section>

      </main>
    </div>
  );
};
