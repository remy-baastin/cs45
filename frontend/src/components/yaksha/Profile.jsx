import { motion } from "motion/react";
import { Bookmark, History, Award, TrendingUp, MessageSquare, Check } from "lucide-react";

export function Profile({ user }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 rounded-2xl border border-border bg-card shadow-soft overflow-hidden"
      >
        <div className="h-24 bg-mesh" />
        <div className="px-6 pb-6 -mt-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow border-4 border-card">
            {user.avatar}
          </div>
          <h2 className="mt-4 text-xl font-display font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.handle} · CSE '26</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Mini label="SP" value={user.sp} />
            <Mini label="Posts" value={18} />
            <Mini label="Answers" value={42} />
          </div>
          <div className="mt-5 p-3 rounded-xl bg-accent/60 text-accent-foreground">
            <div className="flex items-center gap-2 text-xs font-medium mb-1.5">
              <Award className="w-3.5 h-3.5" /> Next badge: Knowledge Steward
            </div>
            <div className="h-1.5 bg-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "62%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-primary"
              />
            </div>
            <p className="text-[11px] mt-1.5 text-muted-foreground">280 SP to go</p>
          </div>
        </div>
      </motion.div>

      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card
            icon={<TrendingUp className="w-4 h-4" />}
            title="Helpfulness streak"
            value="12 days"
            sub="+3 from last week"
          />
          <Card
            icon={<MessageSquare className="w-4 h-4" />}
            title="Avg. answer rating"
            value="4.8 / 5"
            sub="based on 31 ratings"
          />
        </div>

        <Section icon={<Bookmark className="w-4 h-4" />} title="Bookmarks">
          {[
            "Internship reimbursement process — step by step",
            "Best electives for CSE third year if I want to specialize in ML?",
            "Library timings during exam week",
          ].map((b) => (
            <Row key={b}>
              <Bookmark className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-sm">{b}</span>
            </Row>
          ))}
        </Section>

        <Section icon={<History className="w-4 h-4" />} title="Activity log">
          {[
            { t: "2h", a: "Upvoted", b: "Hostel mess timings changed again" },
            { t: "1d", a: "Posted", b: "How to register for the AI/ML elective?" },
            { t: "3d", a: "Answer accepted", b: "Wi-Fi config for hostel block B" },
            { t: "1w", a: "Earned badge", b: "Helpful Hand (10 accepted answers)" },
          ].map((l, i) => (
            <Row key={i}>
              <span className="text-[11px] tabular-nums text-muted-foreground w-8 shrink-0">
                {l.t}
              </span>
              <span className="text-xs font-semibold text-primary shrink-0">{l.a}</span>
              <span className="text-sm text-muted-foreground truncate">{l.b}</span>
              <Check className="ml-auto w-3.5 h-3.5 text-success/70 shrink-0" />
            </Row>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/60">
      <div className="text-base font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({ icon, title, value, sub }) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card shadow-soft">
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-medium">
        {icon} {title}
      </div>
      <div className="mt-2 text-2xl font-display font-bold tracking-tight">{value}</div>
      <div className="text-[11px] text-success mt-0.5">{sub}</div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2 text-sm font-display font-semibold">
        {icon} {title}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ children }) {
  return (
    <div className="px-5 py-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors">
      {children}
    </div>
  );
}
