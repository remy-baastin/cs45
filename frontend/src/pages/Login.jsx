import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, ArrowRight, User } from "lucide-react";
import { signIn, signUp } from "@/lib/mockStore";
import { toast } from "sonner";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = loc.state?.from || "/";

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") await signUp({ email, password, name });
      else if (mode === "magic") { await signIn({ email, password: email }); toast.success("Signed in via email link (demo)"); }
      else await signIn({ email, password });
      toast.success("Welcome to Sara");
      nav(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-mesh px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elegant overflow-hidden">
        <div className="px-7 pt-7 pb-5 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">Sara</span>
          </div>
          <h1 className="font-display text-xl font-semibold">
            {mode === "signup" ? "Create your student account" : mode === "magic" ? "Sign in with email link" : "Welcome back"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Demo login · any email & password works</p>
        </div>

        <div className="px-7 pb-7 space-y-4">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary border border-border text-xs">
            {[{ id: "signin", l: "Sign in" }, { id: "signup", l: "Sign up" }, { id: "magic", l: "Email link" }].map((t) => (
              <button key={t.id} onClick={() => setMode(t.id)}
                className={`py-2 rounded-lg font-medium transition-colors ${mode === t.id ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}>
                {t.l}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && <Field icon={<User className="w-4 h-4" />} value={name} onChange={setName} placeholder="Display name" />}
            <Field icon={<Mail className="w-4 h-4" />} value={email} onChange={setEmail} placeholder="Email" type="email" required />
            {mode !== "magic" && <Field icon={<Lock className="w-4 h-4" />} value={password} onChange={setPassword} placeholder="Password" type="password" required />}
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow">
              <ArrowRight className="w-4 h-4" />
              {mode === "signup" ? "Create account" : mode === "magic" ? "Send link" : "Sign in"}
            </button>
          </form>

          <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to FAQs</Link>
            <span className="mx-2">|</span>
            <Link to="/admin/login" className="hover:text-foreground">Admin portal →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon, value, onChange, ...rest }) {
  return (
    <label className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-secondary/60 border border-border focus-within:ring-focus">
      <span className="text-muted-foreground">{icon}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" {...rest} />
    </label>
  );
}
