import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Inbox, MessageSquare, Users, Send, Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Navbar } from "@/components/yaksha/Navbar";
import { useAuth } from "@/lib/auth";
import { store, addQuery } from "@/lib/mockStore";
import { toast } from "sonner";

export default function MyQueries() {
  const { user, isAdmin } = useAuth();
  const [state, setState] = useState(store.get());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => store.subscribe(setState), []);

  const mine = state.queries.filter((q) => q.user?.email === user?.email || q.user?.handle === user?.handle);

  const submit = async () => {
    if (!title.trim()) return;
    try {
      const q = await addQuery({ title, body });
      toast.success(q.route === "personal" ? "Routed privately to admins" : "Posted to community");
      setTitle(""); setBody(""); setOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to submit query");
    }
  };

  const navUser = { name: user?.name || "Student", handle: user?.handle || "@you", sp: user?.sp || 220, avatar: user?.avatar || "ST" };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-80" />
      <div className="relative">
        <Navbar user={navUser} active="queries" isAdmin={isAdmin} />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold">My Queries</h1>
              <p className="text-sm text-muted-foreground mt-1">All queries you've submitted and their routing status.</p>
            </div>
            <button onClick={() => setOpen(!open)}
              className="px-4 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow">
              {open ? "Cancel" : "+ Submit query"}
            </button>
          </div>

          {open && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 mb-6 rounded-2xl border border-border bg-card shadow-soft space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — be specific"
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-focus border border-border" />
              <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add context. AI will decide whether this is private or generic."
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-focus border border-border resize-none" />
              <button onClick={submit} disabled={!title.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-50">
                <Send className="w-4 h-4" /> Submit
              </button>
            </motion.div>
          )}

          {mine.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No queries yet. Submit one above and AI will route it for you.
            </div>
          ) : (
            <div className="space-y-3">
              {mine.map((q, i) => <QueryCard key={q.id} q={q} i={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:  { color: "bg-warning/15 text-warning-foreground border-warning/40", icon: <Clock className="w-3 h-3" />, label: "Pending" },
    approved: { color: "bg-success/15 text-success border-success/40", icon: <CheckCircle2 className="w-3 h-3" />, label: "Approved" },
    answered: { color: "bg-success/15 text-success border-success/40", icon: <CheckCircle2 className="w-3 h-3" />, label: "Answered" },
    rejected: { color: "bg-destructive/15 text-destructive border-destructive/40", icon: <XCircle className="w-3 h-3" />, label: "Rejected" },
    restricted: { color: "bg-destructive/15 text-destructive border-destructive/40", icon: <XCircle className="w-3 h-3" />, label: "Restricted" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

function QueryCard({ q, i }) {
  const isPersonal = q.route === "personal";
  const routeBadge = isPersonal
    ? { color: "bg-primary/15 text-primary", label: "Personal — Admin queue", icon: <Inbox className="w-3 h-3" /> }
    : { color: "bg-accent text-accent-foreground", label: "Posted to Community", icon: <Users className="w-3 h-3" /> };
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="p-5 rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="font-display font-semibold">{q.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={q.status} />
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold ${routeBadge.color}`}>
            {routeBadge.icon} {routeBadge.label}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{q.body}</p>
      {q.adminReply && (
        <div className="mt-3 p-3 rounded-xl bg-accent/60 text-accent-foreground border border-border">
          <div className="text-[11px] uppercase tracking-wider font-bold mb-1 inline-flex items-center gap-1.5">
            {q.aiAnswer ? <Sparkles className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
            {q.aiAnswer ? "AI-assisted admin reply" : "Admin reply"}
          </div>
          <p className="text-sm leading-relaxed">{q.adminReply}</p>
        </div>
      )}
      {!q.adminReply && isPersonal && q.status === "pending" && (
        <div className="text-xs text-muted-foreground">An admin will reply privately here.</div>
      )}
    </motion.div>
  );
}
