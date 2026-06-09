import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp, ArrowDown, MessageSquare, Bookmark, Plus, ShieldCheck,
  Loader2, Check, AlertTriangle, X, Send,
} from "lucide-react";
import { store, addQuery, addAnswer, fetchQuestionDetails, voteQuestion } from "@/lib/mockStore";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function Community() {
  const [sort, setSort] = useState("top");
  const [state, setState] = useState(store.get());
  const [votes, setVotes] = useState({});
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => store.subscribe(setState), []);

  const sorted = [...state.threads].sort((a, b) => {
    if (sort === "top") return (b.upvotes ?? 0) - (a.upvotes ?? 0);
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });

  const vote = async (id, dir) => {
    const currentVote = votes[id] || 0;
    const val = currentVote === dir ? -dir : dir;
    try {
      await voteQuestion(id, val);
      setVotes((p) => ({ ...p, [id]: p[id] === dir ? 0 : dir }));
      toast.success("Vote recorded");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex p-1 rounded-xl bg-secondary border border-border">
            {["top", "new"].map((k) => (
              <button key={k} onClick={() => setSort(k)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${sort === k ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {sort === k && <motion.div layoutId="sort-pill" className="absolute inset-0 bg-card shadow-soft rounded-lg -z-10" />}
                {k === "new" ? "Newest" : "Top"}
              </button>
            ))}
          </div>
          <button onClick={() => setAskOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-95 transition">
            <Plus className="w-4 h-4" /> Ask the Community
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">No threads yet.</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((t, i) => (
              <ThreadCard key={t.id} t={t} i={i} answers={state.answers.filter((a) => a.threadId === t.id)} vote={votes[t.id] ?? 0} onVote={(d) => vote(t.id, d)} />
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-display font-semibold text-sm mb-3">Community Pulse</h3>
          <Stat label="Threads" value={state.threads.length} />
          <Stat label="Answers" value={state.answers.length} />
          <Stat label="Avg. response" value="4.2m" />
        </div>
        <div className="rounded-2xl border border-border bg-mesh p-5 shadow-soft">
          <h3 className="font-display font-semibold text-sm mb-2">Tip</h3>
          <p className="text-xs text-muted-foreground">Any question you ask is auto-routed. Private ones go to admins; generic ones land here.</p>
        </div>
      </aside>

      <AnimatePresence>
        {askOpen && <AskForm onClose={() => setAskOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ThreadCard({ t, i, answers, vote, onVote }) {
  const [expand, setExpand] = useState(false);
  const [body, setBody] = useState("");
  const { user } = useAuth();

  const submit = async () => {
    if (!body.trim()) return;
    try {
      await addAnswer(t.id, body, user?.handle || "@you");
      setBody("");
      toast.success("Answer submitted successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleExpand = () => {
    if (!expand) {
      fetchQuestionDetails(t.id);
    }
    setExpand(!expand);
  };

  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-elegant transition-all">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button onClick={() => onVote(1)} className={`p-1.5 rounded-lg ${vote === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <span className={`text-sm font-bold tabular-nums ${vote === 1 ? "text-primary" : vote === -1 ? "text-destructive" : "text-foreground"}`}>
            {(t.upvotes ?? 0) + vote}
          </span>
          <button onClick={() => onVote(-1)} className={`p-1.5 rounded-lg ${vote === -1 ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-secondary"}`}>
            <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">{t.tag}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{t.author}</span>
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug mb-1.5">{t.title}</h3>
          <p className="text-sm text-muted-foreground">{t.body}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <button onClick={toggleExpand} className="inline-flex items-center gap-1.5 hover:text-foreground">
              <MessageSquare className="w-3.5 h-3.5" /> {expand ? "Hide answers" : `View ${answers.length} answers`}
            </button>
            <span className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expand && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pl-12">
            <div className="space-y-2">
              {answers.length === 0 && <div className="text-xs text-muted-foreground">No answers yet.</div>}
              {answers.map((a) => (
                <div key={a.id} className={`p-3 rounded-xl text-sm border ${
                  a.status === "approved" ? "bg-success/10 border-success/30" :
                  a.status === "rejected" ? "bg-destructive/10 border-destructive/30 opacity-60" :
                  "bg-warning/10 border-warning/30"}`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1">
                    {a.status === "approved" ? <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>
                      : a.status === "rejected" ? "Rejected" : "Pending review"}
                  </div>
                  <p>{a.body}</p>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write an answer…"
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm outline-none focus:ring-focus" />
                <button onClick={submit} disabled={!body.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" /> Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function AskForm({ onClose }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stage, setStage] = useState("draft");
  const [route, setRoute] = useState(null);

  const submit = async () => {
    if (!title.trim()) return;
    setStage("checking");
    try {
      const q = await addQuery({ title, body });
      setRoute(q.route);
      setStage(q.route === "personal" ? "flagged" : "ok");
      if (q.route === "generic") setTimeout(onClose, 1400);
    } catch (err) {
      toast.error(err.message || "Failed to submit query");
      setStage("draft");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.96, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-elegant overflow-hidden">
        {stage === "draft" && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-display text-lg font-semibold">Draft a new question</h3>
                <p className="text-xs text-muted-foreground mt-0.5">AI routes it to community or admins.</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — be specific"
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-focus border border-border" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add context…" rows={5}
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-focus border border-border resize-none" />
              <button onClick={submit} disabled={!title.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-40">
                Analyze & Submit
              </button>
            </div>
          </>
        )}
        {stage === "checking" && (
          <div className="p-12 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
            </div>
            <div><h3 className="font-display text-lg font-semibold mb-1">AI Routing Engine…</h3>
              <p className="text-sm text-muted-foreground">Personal or generic?</p></div>
          </div>
        )}
        {stage === "ok" && (
          <Result tone="success" icon={<Check className="w-6 h-6" />} title="Posted to community"
            body="AI classified your query as generic. It's live on the feed." />
        )}
        {stage === "flagged" && (
          <Result tone="warning" icon={<AlertTriangle className="w-6 h-6" />} title="Routed privately to admins"
            body="AI detected personal content. It's now in your My Queries page." onClose={onClose} />
        )}
      </motion.div>
    </motion.div>
  );
}

function Result({ tone, icon, title, body, onClose }) {
  const isSuccess = tone === "success";
  return (
    <div className="p-8 flex flex-col items-center text-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSuccess ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
        {icon}
      </div>
      <div><h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{body}</p></div>
      {onClose && (
        <Link to="/my-queries" onClick={onClose} className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background">
          View My Queries
        </Link>
      )}
    </div>
  );
}
