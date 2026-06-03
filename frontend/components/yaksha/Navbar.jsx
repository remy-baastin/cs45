import { motion } from "motion/react";
import { Sparkles, Shield, Bell } from "lucide-react";

export function Navbar({ user, active, onNavigate, isAdmin, onToggleRole }) {
  const tabs = [
    { id: "search", label: "Yaksha" },
    { id: "community", label: "Community" },
    { id: "profile", label: "Profile" },
    ...(isAdmin ? [{ id: "admin", label: "Admin Panel" }] : []),
  ];

  const max = 500;
  const pct = Math.min(100, (user.sp / max) * 100);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-lg tracking-tight">Sara</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Campus Knowledge OS
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id)}
              className={`relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                active === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.id === "admin" && <Shield className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />}
              {t.label}
              {active === t.id && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-secondary rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/60">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Reputation
            </span>
            <span className="text-sm font-semibold tabular-nums">{user.sp} SP</span>
          </div>
          <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <button className="relative w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        <button
          onClick={onToggleRole}
          title="Toggle role (demo)"
          className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            {user.avatar}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-[11px] text-muted-foreground">{user.handle}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
