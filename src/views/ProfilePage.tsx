import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Radar, Compass, Settings, History, User, LogOut, Check, Info, Trash2, ShieldAlert, X, AlertTriangle, Sparkles } from "lucide-react";

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile, deleteAccount, signOut } = useAuth();

  // Profile forms local states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [role, setRole] = useState(user?.role || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Bottom sheet confirmation state for Account Deletion
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);

    const success = await updateProfile(fullName, role, avatarUrl || null);
    
    setIsUpdating(false);
    if (success) {
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  const handleDeleteAccountFinal = async () => {
    if (deleteEmailConfirm.toLowerCase() !== user?.email.toLowerCase()) return;
    setIsDeleting(true);
    
    const success = await deleteAccount();
    setIsDeleting(false);
    if (success) {
      onNavigate("/");
    }
  };

  const handleSimulateAvatarUpload = () => {
    // Generates a mock, professional human avatar URL
    const avatars = [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop"
    ];
    const chosen = avatars[Math.floor(Math.random() * avatars.length)];
    setAvatarUrl(chosen);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans relative">
      
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
          <button onClick={() => onNavigate("/agent/config")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <Settings className="w-4 h-4" /> Agent Config
          </button>
          <button onClick={() => onNavigate("/agent/history")} className="text-on-surface-variant hover:text-primary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 transition-colors">
            <History className="w-4 h-4" /> History
          </button>
          <button onClick={() => onNavigate("/profile")} className="text-secondary font-bold text-xs flex items-center gap-1 cursor-pointer py-1.5 border-b-2 border-secondary">
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

      {/* Main Container Layout */}
      <main className="flex-grow p-6 md:p-10 max-w-2xl mx-auto w-full space-y-8">
        
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-primary tracking-tight">Account Details Card</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Configure your personal workspace identity credentials.
          </p>
        </div>

        {/* Success Alert toast */}
        {updateSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
            <span>Profile identity parameters successfully synchronized!</span>
          </div>
        )}

        {/* Account Details Form */}
        <form onSubmit={handleUpdateProfile} className="bg-white border border-outline-variant rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Avatar simulation selector */}
          <div className="flex items-center gap-5 border-b border-outline-variant/30 pb-5">
            <div className="shrink-0 relative">
              {avatarUrl ? (
                <img src={avatarUrl} referrerPolicy="no-referrer" alt="avatar" className="w-16 h-16 rounded-full object-cover border border-outline" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary-container/25 border border-secondary-container/40 flex items-center justify-center text-secondary text-lg font-bold">
                  {fullName?.charAt(0) || "A"}
                </div>
              )}
            </div>

            <div className="space-y-2 text-left">
              <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider font-mono">Workspace Photo</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSimulateAvatarUpload}
                  className="px-3 h-8 bg-surface-container hover:bg-outline-variant/35 text-primary text-[11px] font-bold border border-outline-variant/60 rounded-lg cursor-pointer transition-colors"
                >
                  Simulate Photo Upload
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="px-3 h-8 bg-white hover:bg-error-container/10 text-error text-[11px] font-bold border border-error-container/20 rounded-lg cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Work Email (Read only) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider font-mono" htmlFor="email-profile">
                Work Email Address
              </label>
              <input
                type="email"
                id="email-profile"
                disabled
                value={user?.email || ""}
                className="w-full h-11 px-3 bg-surface border border-outline-variant/50 text-outline-variant opacity-70 rounded-lg text-sm font-semibold outline-none cursor-not-allowed"
              />
              <p className="text-[10px] text-outline font-medium">To modify your corporate address, please submit an administrative helpdesk signal.</p>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-primary uppercase tracking-wider font-mono" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexander Sterling"
                className="w-full h-11 px-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>

            {/* Corporate Title Role */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-primary uppercase tracking-wider font-mono" htmlFor="role">
                Corporate Title / Role
              </label>
              <input
                type="text"
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Product Leader"
                className="w-full h-11 px-3 bg-white border border-outline-variant rounded-lg text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>

          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-grow h-11 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{isUpdating ? "Synchronizing..." : "Update Identity Details"}</span>
            </button>
          </div>

        </form>

        {/* Danger zone panel */}
        <section className="bg-error-container/5 border border-error-container/20 rounded-xl p-6 shadow-sm space-y-4">
          <div className="space-y-1 text-left">
            <h4 className="font-extrabold text-sm text-error flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5 text-error" />
              <span>Danger Zone Settings</span>
            </h4>
            <p className="text-xs text-on-surface-variant">
              Completely delete your executive career profile, including all historical runs, search configs, and stored outreach templates.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteSheetOpen(true)}
              className="h-11 px-5 bg-error text-white font-bold text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Executive Account</span>
            </button>
          </div>
        </section>

      </main>

      {/* Slide-Up Bottom Sheet Confirmation Drawer (Screen 3 style) */}
      {isDeleteSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center transition-opacity duration-300">
          <div className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl p-6 sm:p-8 space-y-6 transform translate-y-0 transition-transform duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-outline-variant/35 pb-4">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <h3 className="font-black text-md tracking-tight uppercase">Confirm Complete Deletion</h3>
                  <p className="text-[10px] text-outline uppercase font-semibold tracking-wider font-mono">This action is irreversible</p>
                </div>
              </div>
              <button
                onClick={() => { setIsDeleteSheetOpen(false); setDeleteEmailConfirm(""); }}
                className="p-1.5 text-outline hover:text-primary hover:bg-outline-variant/30 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions */}
            <p className="text-xs text-on-surface-variant leading-relaxed">
              You are preparing to completely erase your private Funding Radar Agent account. All your tracking settings, background summaries, matching scores, and <strong>all historical runs will be permanently purged</strong> from the server database.
            </p>

            <div className="space-y-3 bg-error-container/5 border border-error-container/20 rounded-xl p-4">
              <label className="block text-[10px] font-bold text-error uppercase tracking-wider font-mono" htmlFor="confirm-email">
                To confirm, type your work email: <code className="bg-error-container/10 border border-error-container/20 rounded px-1 text-[10px] lowercase font-bold">{user?.email}</code>
              </label>
              <input
                type="text"
                id="confirm-email"
                value={deleteEmailConfirm}
                onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                placeholder={user?.email}
                className="w-full h-11 px-3 bg-white border border-error-container/30 focus:border-error focus:ring-1 focus:ring-error rounded-lg text-sm outline-none transition-all"
              />
            </div>

            {/* Triggers */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccountFinal}
                disabled={isDeleting || deleteEmailConfirm.toLowerCase() !== user?.email.toLowerCase()}
                className="flex-grow h-11 bg-error text-white font-bold text-xs rounded-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? "Purging Record Data..." : "CONFIRM COMPLETE DELETE"}
              </button>
              
              <button
                onClick={() => { setIsDeleteSheetOpen(false); setDeleteEmailConfirm(""); }}
                className="h-11 px-5 bg-white border border-outline-variant text-primary font-bold text-xs rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
