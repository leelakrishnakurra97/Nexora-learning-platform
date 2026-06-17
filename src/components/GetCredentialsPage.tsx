import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, Copy, CreditCard, Sparkles, BookOpen, UserCheck, ArrowRight } from "lucide-react";

export const GetCredentialsPage: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // State for parsed parameters
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    // Parse query params from hash location (e.g., #/get-credentials?email=...&password=...&role=...)
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    if (queryIndex !== -1) {
      const searchParams = new URLSearchParams(hash.substring(queryIndex));
      setEmail(searchParams.get("email") || "student@nexora.com");
      setPassword(searchParams.get("password") || "NexoraScholastic2026");
      setRole(searchParams.get("role") || "STUDENT");
    } else {
      // Demo fallbacks if accessed directly
      setEmail("demo.scholar@nexora.com");
      setPassword("ScholarPass2026!");
      setRole("STUDENT");
    }
  }, []);

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-brand-navy-dark flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Visual Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-royal/10 dark:bg-brand-royal/20 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-brand-violet/10 dark:bg-brand-violet/20 blur-[130px] rounded-full animate-pulse-slow pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-2xl w-full z-10 space-y-8 animate-fade-in-up">
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-royal/10 border border-brand-royal/20 dark:bg-brand-royal/20 text-brand-royal dark:text-blue-300 text-xs font-bold uppercase tracking-widest shadow-sm">
            <ShieldCheck className="w-4 h-4 text-brand-violet" />
            <span>Secure Activation Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-none">
            Nexora Learning Academy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Activate your scholar account subscription to retrieve your secure portal login credentials.
          </p>
        </div>

        {!isSubscribed ? (
          /* SUBSCRIPTION PACKAGE INTERFACE */
          <div className="glass-card p-6 md:p-8 border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/45 shadow-2xl space-y-6 text-left">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/5 pb-5">
              <div>
                <span className="text-[10px] text-brand-violet dark:text-brand-violet-light font-black uppercase tracking-wider block">
                  Recommended Plan
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Full Academic Access Pass
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unlocks all subjects, live classes, tutor bots, and interactive quizzes.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-brand-royal dark:text-white">$9.99</p>
                <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Per Month</p>
              </div>
            </div>

            {/* Features Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "10-Question High-Quality Subject Quizzes",
                "Full TNSB Syllabus Materials & Notes",
                "24/7 AI Personal Scholar Tutor Support",
                "Interactive Assignment Submissions",
                "Live Stream Video Classrooms",
                "Personal Performance & XP Analytics",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{feat}</span>
                </div>
              ))}
            </div>

            {/* Subscription Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={handleSubscribe}
                className="w-full premium-btn-primary py-4 font-extrabold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-brand-royal/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>Subscribe & Retrieve Login Credentials</span>
                <Sparkles className="w-4 h-4 ml-1 fill-white" />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-normal">
              By subscribing, you activate the secure scholar database node. Your temporary login password will be decrypted and displayed immediately.
            </p>
          </div>
        ) : (
          /* CREDENTIALS REVEALED INTERFACE */
          <div className="glass-card p-6 md:p-8 border-brand-violet-light/30 bg-white dark:bg-slate-950/50 shadow-2xl space-y-6 text-left relative overflow-hidden animate-fade-in-up">
            {/* Corner glowing icon */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-royal/10 rounded-full flex items-center justify-center pointer-events-none">
              <Sparkles className="w-10 h-10 text-brand-royal/40" />
            </div>

            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-5">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Subscription Activated Successfully!
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold mt-0.5">
                  Secure Credentials Decrypted
                </p>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Academic Role
                </label>
                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest font-mono">
                  {role}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Login Email
                </label>
                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white font-mono">
                  {email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-rose-600 dark:text-rose-450 font-mono font-bold tracking-wider">
                    {password}
                  </div>
                  <button
                    onClick={handleCopyPassword}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-royal/30 bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350 hover:text-brand-royal transition-all active:scale-95 flex items-center justify-center"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Navigation Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-[10px] text-slate-500 leading-normal max-w-xs">
                Important: Please change this password in your profile panel immediately after logging in for the first time.
              </span>
              <a
                href="#/login"
                className="premium-btn-primary px-6 py-3 font-bold text-xs flex items-center justify-center gap-1.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <span>Proceed to Scholar Login</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500">
            Secure Activation Portal Powered by Nexora Learning Shield © 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
