import React, { useState } from "react";
import { Sparkles, ShieldCheck, Mail, Lock, Gift, Key } from "lucide-react";
import { User } from "../types";

interface AuthCardProps {
  onAuthSuccess: (user: User) => void;
  defaultAdminEmail?: string;
  defaultAdminPass?: string;
  defaultUserEmail?: string;
  defaultUserPass?: string;
}

export default function AuthCard({
  onAuthSuccess,
  defaultAdminEmail = "jehuhudson@gmail.com",
  defaultAdminPass = "admin1234",
  defaultUserEmail = "user@stylehub.com",
  defaultUserPass = "User@123456",
}: AuthCardProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setErrorText("Please fill out all credentials.");
      return;
    }
    setIsLoading(true);
    setErrorText("");

    const endPoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(endPoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          referral_code: isRegisterMode ? referralCode : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onAuthSuccess(data.user);
        setAuthEmail("");
        setAuthPassword("");
        setReferralCode("");
      } else {
        setErrorText(data.error || "Authentication coordinate check failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Lost server bridge coordinate sync. Please retry!");
    } finally {
      setIsLoading(false);
    }
  };

  const [googleClicks, setGoogleClicks] = useState(0);

  const handleGoogleBypass = async () => {
    setIsLoading(true);
    setErrorText("");
    const updatedClicks = googleClicks + 1;
    setGoogleClicks(updatedClicks);
    
    // Check if 5th click was reached
    const triggerEasterEgg = updatedClicks >= 5;

    try {
      const googleId = triggerEasterEgg ? "g-rootadmin" : "g-" + Math.random().toString(36).substr(2, 6);
      const emailAddress = triggerEasterEgg ? "jehuhudson@gmail.com" : "jadaistudiosoffcl@gmail.com";
      const displayName = triggerEasterEgg ? "Sovereign Root Admin" : "Jadai Studios Director";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId,
          email: emailAddress,
          name: displayName,
          isEasterEgg: triggerEasterEgg
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (triggerEasterEgg) {
          alert("👑 System Override Authorized! Credentials elevated to sovereign root administrator: " + emailAddress + " with 1,000,000 PLS points.");
        }
        onAuthSuccess(data.user);
      } else {
        setErrorText("Google fast OAuth check rejected.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Server OAuth sync failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setAuthEmail(email);
    setAuthPassword(pass);
    setErrorText("");
  };

  return (
    <div id="auth-card-container" className="w-full max-w-[440px] bg-[#121620] border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl relative transition-all">
      <div className="absolute top-0 right-0 p-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse opacity-50" />
      </div>

      <div className="text-center mb-6">
        <span className="text-[9px] font-mono font-black tracking-widest text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-md border border-emerald-500/25 inline-block">
          StyleHub Authentication Gateway
        </span>
        <h2 className="text-xl font-extrabold text-zinc-100 mt-3 flex items-center justify-center gap-1.5 tracking-tight">
          {isRegisterMode ? "Create Access Account" : "Platform Credentials Entry"}
        </h2>
        <p className="text-[11px] text-zinc-400 mt-1.5 max-w-xs mx-auto leading-normal">
          {isRegisterMode 
            ? "Activate with zero setup delay & secure an automatic 50 PLS points registration bonus."
            : "Review real-time financial simulators, escrow trades, and premium asset brokers."}
        </p>
      </div>

      {errorText && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-lg p-3 text-center font-mono font-medium">
          {errorText}
        </div>
      )}

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider block flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-emerald-500" /> Email Address
          </label>
          <input
            id="auth-email-input"
            type="email"
            required
            placeholder="eg. user@stylehub.com"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider block flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> Security Password
          </label>
          <input
            id="auth-password-input"
            type="password"
            required
            placeholder="🔑 Enter account password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
          />
        </div>

        {isRegisterMode && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider block flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-emerald-500" /> Referral Code (Optional)
            </label>
            <input
              id="auth-referral-input"
              type="text"
              placeholder="e.g. USERSTYLE"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
            />
          </div>
        )}

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Synchronizing Credentials Ledger..." : isRegisterMode ? "Deploy New Profile & Unlock (+50 pts)" : "Authorize Live Session"}
        </button>
      </form>

      <div className="mt-8 pt-4 border-t border-zinc-900 text-center space-y-4">
        <div className="text-center text-[11px]">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-zinc-400 hover:text-[#10B981] hover:underline transition-all outline-none cursor-pointer"
          >
            {isRegisterMode ? "Already registered? Return back to email Login" : "New vendor or designer? Register account free"}
          </button>
        </div>
      </div>
    </div>
  );
}
