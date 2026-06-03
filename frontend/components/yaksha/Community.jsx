import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Bookmark,
  Plus,
  ShieldCheck,
  Loader2,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { threads as initialThreads } from "./mockData";

export function Community() {
  const [sort, setSort] = useState("top");
  const [threads, setThreads] = useState(initialThreads);
  const [votes, setVotes] = useState({});
  const [askOpen, setAskOpen] = useState(false);

  const sorted = [...threads].sort((a, b) => {
    if (sort === "top") return b.upvotes - a.upvotes;
    if (sort === "new") return a.age.localeCompare(b.age);
    return Number(!!b.unanswered) - Number(!!a.unanswered);
  });

  const vote = (id, dir) => {
    setVotes((prev) => {
      const cur = prev[id] ?? 0;
      const next = cur === dir ? 0 : dir;
      setThreads((t) =>
        t.map((th) => (th.id === id ? { ...th, upvotes: th.upvotes - cur + next } : th)),
      );
      return { ...prev, [id]: next };
    });
  };

  const onPost = (title, body, flagged) => {
    if (flagged) return;
    setThreads((t) => [
      {
        id: `n${Date.now()}`,
        title,
        preview: body,
        author: { name: "u/vamsi", role: "Student" },
        upvotes: 1,
        comments: 0,
        tag: "New",
        age: "now",
      },
      ...t,
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex p-1 rounded-xl bg-secondary border border-border">
            {["top", "new", "unanswered"].map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                  sort === k ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sort === k && (
                  <motion.div
                    layoutId="sort-pill"
                    className="absolute inset-0 bg-card shadow-soft rounded-lg -z-10"
                  />
                )}
                {k === "unanswered" ? "Unanswered" : k === "new" ? "Newest" : "Top"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAskOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" /> Ask the Community
          </button>
        </div>

        <div className="space-y-3">
          {sorted.map((t, i) => (
            <ThreadCard
              key={t.id}
              t={t}
              i={i}
              vote={votes[t.id] ?? 0}
              onVote={(d) => vote(t.id, d)}
            />
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-display font-semibold text-sm mb-3">Community Pulse</h3>
          <div className="space-y-3">
            <Stat label="Active today" value="1,284" />
            <Stat label="Questions resolved" value="312" trend="+18%" />
            <Stat label="Avg. response time" value="4.2m" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-mesh p-5 shadow-soft">
          <h3 className="font-display font-semibold text-sm mb-2">Trending tags</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Placements", "Hostel", "Academics", "Events", "Admin", "Clubs"].map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full bg-card/80 text-xs font-medium border border-border"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {askOpen && <AskForm onClose={() => setAskOpen(false)} onPost={onPost} />}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, trend }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">
        {value}
        {trend && <span className="ml-1.5 text-success text-[11px] font-medium">{trend}</span>}
      </span>
    </div>
  );
}

function ThreadCard({ t, i, vote, onVote }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className={`group flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-elegant transition-all ${
        t.verified ? "ring-1 ring-mentor/30" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button
          onClick={() => onVote(1)}
          className={`p-1.5 rounded-lg transition-colors ${
            vote === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <span
          className={`text-sm font-bold tabular-nums ${
            vote === 1 ? "text-primary" : vote === -1 ? "text-destructive" : "text-foreground"
          }`}
        >
          {t.upvotes}
        </span>
        <button
          onClick={() => onVote(-1)}
          className={`p-1.5 rounded-lg transition-colors ${
            vote === -1
              ? "bg-destructive/15 text-destructive"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
            {t.tag}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{t.author.name}</span>
          {t.author.role !== "Student" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-mentor/15 text-mentor">
              <ShieldCheck className="w-3 h-3" />
              {t.author.role}
            </span>
          )}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{t.age} ago</span>
          {t.unanswered && (
            <span className="ml-auto px-2 py-0.5 rounded-md bg-warning/20 text-warning-foreground text-[10px] font-semibold uppercase tracking-wider">
              Unanswered
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug mb-1.5">{t.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{t.preview}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5" /> {t.comments} comments
          </span>
          <span className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer">
            <Bookmark className="w-3.5 h-3.5" /> Save
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function AskForm({ onClose, onPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stage, setStage] = useState("draft");

  const submit = () => {
    if (!title.trim()) return;
    setStage("checking");
    setTimeout(() => {
      const blob = `${title} ${body}`.toLowerCase();
      const flagged = /\b(\d{10,})\b|bank|roll ?no|password|aadhaar|account/.test(blob);
      setStage(flagged ? "flagged" : "ok");
      if (!flagged) {
        setTimeout(() => {
          onPost(title, body, false);
          onClose();
        }, 1200);
      }
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-elegant overflow-hidden"
      >
        {stage === "draft" && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-display text-lg font-semibold">Draft a new question</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Yaksha will moderate before it hits the public feed.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title — be specific"
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-focus border border-border"
              />

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add context, what you've tried, where you got stuck…"
                rows={5}
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-focus border border-border resize-none"
              />

              <button
                onClick={submit}
                disabled={!title.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-40"
              >
                Analyze & Post Query
              </button>
            </div>
          </>
        )}

        {stage === "checking" && <AICheckModal />}
        {stage === "ok" && (
          <ResultPanel
            tone="success"
            icon={<Check className="w-6 h-6" />}
            title="Cleared for public feed"
            body="Your question passed moderation and is now live at the top of the community feed."
          />
        )}
        {stage === "flagged" && (
          <ResultPanel
            tone="warning"
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Personal Data Detected"
            body="This has been securely packaged as a private ticket and sent to Admin review queues. It will not appear in the public forum."
            onClose={onClose}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function AICheckModal() {
  return (
    <div className="p-12 flex flex-col items-center gap-5 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border-2 border-primary/30 animate-pulse-ring" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold mb-1">AI Moderation Engine Reviewing…</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Scanning for personal data, toxicity, and policy violations.
        </p>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        {["PII scan", "Toxicity", "Routing"].map((s, i) => (
          <motion.span
            key={s}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, delay: i * 0.3, repeat: Infinity }}
            className="px-2 py-1 rounded-md bg-secondary"
          >
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ tone, icon, title, body, onClose }) {
  const isSuccess = tone === "success";
  return (
    <div className="p-8 flex flex-col items-center text-center gap-4">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isSuccess ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{body}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-accent"
        >
          Got it
        </button>
      )}
    </div>
  );
}
