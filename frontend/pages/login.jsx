import React, { useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Mail, Sparkles, ArrowLeft, UserCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: DedicatedLoginPage,
});

function DedicatedLoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Please fill out all credential fields.");
      return;
    }

    setIsLoading(true);

    // Simulated login verification framework latency
    setTimeout(() => {
      if (emailInput.includes("@") && passwordInput.length >= 4) {
        // Mock successful session storage registration trigger
        const mockUserData = {
          name: emailInput.split("@")[0],
          handle: `u/${emailInput.split("@")[0]}`,
          avatar: emailInput.substring(0, 2).toUpperCase(),
          role: "Student",
          sp: 220,
          isAuthenticated: true,
        };
        
        localStorage.setItem("yaksha_user_session", JSON.stringify(mockUserData));
        setIsLoading(false);
        
        // Redirect seamlessly back to the dashboard gateway home route
        router.navigate({ to: "/" });
      } else {
        setIsLoading(false);
        setAuthError("Invalid email layout structure or password criteria length too short.");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background relative bg-mesh flex items-center justify-center p-4 font-sans">
      {/* Absolute Header Floating Escape Action */}
      <div className="absolute top-6 left-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors bg-card/60 backdrop-blur px-3 py-2 rounded-xl border border-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elegant p-8 space-y-6 relative overflow-hidden"
      >
        {/* Top Decorative Neon Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-primary" />

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-primary-glow text-primary rounded-xl flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-foreground">Welcome to Samagama</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Log in with your institutional credentials to sync project parameters, Rosetta journals, and clear vector query filters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5"
              >
                <span className="mt-0.5">⚠️</span>
                <p className="font-medium leading-relaxed">{authError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/80 block">Account Email ID</label>
            <div className="flex items-center gap-3 bg-secondary/40 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="vamsi@college.edu"
                className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/60"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/80 block">Password</label>
              <a href="#" className="text-[11px] font-bold text-primary hover:underline">Forgot?</a>
            </div>
            <div className="flex items-center gap-3 bg-secondary/40 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/60"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-gradient-primary text-primary-foreground text-sm font-bold rounded-xl shadow-glow transition duration-200 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4" /> Authenticate Session
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Don't have an internship account?{" "}
            <a href="#" className="text-primary font-bold hover:underline">Clear your interview track first</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}