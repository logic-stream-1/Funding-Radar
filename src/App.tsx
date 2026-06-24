import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./views/LandingPage";
import { SignInPage } from "./views/SignInPage";
import { SignUpPage } from "./views/SignUpPage";
import { ConfirmPage } from "./views/ConfirmPage";
import { ForgotPasswordPage } from "./views/ForgotPasswordPage";
import { DashboardPage } from "./views/DashboardPage";
import { ConfigPage } from "./views/ConfigPage";
import { HistoryPage } from "./views/HistoryPage";
import { ProfilePage } from "./views/ProfilePage";
import { Radar } from "lucide-react";

// Master router wrapper containing AuthContext bindings
function AppContent() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Synchronize browser back/forward buttons with local route state
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Redirect authenticated users trying to access login/signup/confirm pages to /agent
  useEffect(() => {
    if (user && ["/sign-in", "/sign-up", "/confirm"].includes(currentPath)) {
      navigate("/agent");
    }
  }, [user, currentPath]);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    const pathName = path.split("?")[0];
    setCurrentPath(pathName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If AuthContext is checking saved local sessions, show elegant initial loader
  if (loading) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <Radar className="w-12 h-12 text-secondary animate-spin mx-auto" />
          <p className="text-xs text-outline font-bold uppercase tracking-widest font-mono">
            Booting Funding Radar Session...
          </p>
        </div>
      </div>
    );
  }

  // Route Authentication Gates & Middleware
  const isPublicRoute = ["/", "/sign-in", "/sign-up", "/confirm", "/forgot-password"].includes(currentPath);

  if (!user && !isPublicRoute) {
    // Redirect unauthenticated user attempting protected path
    return <SignInPage onNavigate={navigate} />;
  }

  // Page Routing Table Map
  switch (currentPath) {
    case "/":
      return <LandingPage onNavigate={navigate} />;
    
    case "/sign-in":
      return <SignInPage onNavigate={navigate} />;
    
    case "/sign-up":
      return <SignUpPage onNavigate={navigate} />;
    
    case "/confirm":
      return <ConfirmPage onNavigate={navigate} />;
    
    case "/forgot-password":
      return <ForgotPasswordPage onNavigate={navigate} />;
    
    case "/agent":
      return <DashboardPage onNavigate={navigate} />;
    
    case "/agent/config":
      return <ConfigPage onNavigate={navigate} />;
    
    case "/agent/history":
      return <HistoryPage onNavigate={navigate} />;
    
    case "/profile":
      return <ProfilePage onNavigate={navigate} />;
    
    default:
      // Fallback
      return user ? <DashboardPage onNavigate={navigate} /> : <LandingPage onNavigate={navigate} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
