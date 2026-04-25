"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
}

export interface UpdateContext {
  title: string;
  category: string;
  priority: string;
  summary: string;
}

interface ChatWidgetProps {
  initialContext?: UpdateContext;
  autoOpen?: boolean;
}

const SUGGESTIONS = [
  "ECS deprecation ka matlab kya hai?",
  "CodeCommit se migrate kaise karein?",
  "Node.js 16 deprecation impact?",
  "IAM MFA enable karne ke steps?",
];

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2 heading: ## text
    if (line.startsWith("## ")) {
      nodes.push(
        <p key={i} className="text-xs font-bold text-accent-orange uppercase tracking-wide mt-4 mb-1.5 first:mt-0">
          {line.replace("## ", "")}
        </p>
      );
      i++;
      continue;
    }

    // H3 heading: ### text
    if (line.startsWith("### ")) {
      nodes.push(
        <p key={i} className="text-xs font-semibold text-text-primary mt-3 mb-1">
          {line.replace("### ", "")}
        </p>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      nodes.push(<hr key={i} className="border-border my-2" />);
      i++;
      continue;
    }

    // Table: | col | col |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Skip separator row (|---|---|)
      const rows = tableLines.filter((l) => !l.match(/^\|[\s\-|]+\|$/));
      nodes.push(
        <div key={`table-${i}`} className="overflow-x-auto my-2">
          <table className="w-full text-xs border-collapse">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").filter((c) => c.trim() !== "");
                return (
                  <tr key={ri} className={ri === 0 ? "bg-bg-hover" : "border-t border-border/40"}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className={`px-2 py-1.5 ${ri === 0 ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Numbered list: 1. text
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="space-y-1 my-1.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-text-secondary leading-relaxed">
              <span className="text-accent-orange font-bold flex-shrink-0">{idx + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet list: - text or * text
    if (/^[-*]\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[-*]\s/, ""));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-text-secondary leading-relaxed">
              <span className="text-accent-orange flex-shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      nodes.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={i} className="text-xs text-text-secondary leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

// Inline formatting: **bold**, `code`
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-text-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-bg-hover px-1 py-0.5 rounded text-accent-orange font-mono text-[10px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-2" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-accent-orange flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 mt-0.5">⚡</div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-accent-orange text-white rounded-br-sm text-sm" : "bg-bg-secondary border border-border text-text-primary rounded-bl-sm"}`}>
        {msg.loading ? <TypingDots /> : isUser ? (
          <span className="text-sm leading-relaxed">{msg.text}</span>
        ) : (
          <div className="space-y-0.5">{renderMarkdown(msg.text)}</div>
        )}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function ChatWidget({ initialContext, autoOpen }: ChatWidgetProps) {
  const [open, setOpen] = useState(autoOpen ?? false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi Rahul! 👋 Main tumhara AWS Pulse assistant hoon.\n\nKoi bhi AWS update ke baare mein poochho — main mentor ki tarah explain karunga.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<UpdateContext | undefined>(initialContext);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Expose method to trigger from outside (update detail page)
  useEffect(() => {
    if (initialContext && autoOpen) {
      setContext(initialContext);
      setOpen(true);
    }
  }, [initialContext, autoOpen]);

  const sendMessage = useCallback(async (text: string, ctx?: UpdateContext) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    const loadingMsg: Message = { id: "loading", role: "assistant", text: "", loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome" && !m.loading)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
          updateContext: ctx ?? context,
        }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "loading"),
        {
          id: Date.now().toString(),
          role: "assistant",
          text: data.reply || data.error || "Kuch galat ho gaya. Please try again.",
        },
      ]);
      // Clear context after first use
      setContext(undefined);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, context]);

  // Listen for custom event from update detail page
  useEffect(() => {
    const handler = (e: CustomEvent<{ context: UpdateContext; question: string }>) => {
      setContext(e.detail.context);
      setOpen(true);
      setTimeout(() => sendMessage(e.detail.question, e.detail.context), 300);
    };
    window.addEventListener("ask-ai-about-update", handler as EventListener);
    return () => window.removeEventListener("ask-ai-about-update", handler as EventListener);
  }, [sendMessage]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          lg:bottom-6 lg:right-6 bottom-24 right-4
          ${open ? "bg-bg-card border-2 border-border" : "bg-accent-orange shadow-orange-500/40"}`}
        aria-label={open ? "Close chat" : "Open AWS assistant chat"}
      >
        {open ? <span className="text-text-primary text-xl">✕</span> : <span className="text-2xl">💬</span>}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-bg-primary" />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed z-50 bg-bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden
            lg:bottom-24 lg:right-6 lg:w-[400px] lg:h-[560px]
            bottom-24 right-4 left-4 h-[72vh]"
          role="dialog"
          aria-label="AWS Pulse Chat Assistant"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-accent-orange flex items-center justify-center text-sm font-bold text-white">⚡</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary">AWS Pulse Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-xs text-green-400">Online · Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover transition-all" aria-label="Close">✕</button>
          </div>

          {/* Context banner */}
          {context && (
            <div className="px-4 py-2 bg-accent-orange/10 border-b border-accent-orange/20 flex-shrink-0">
              <p className="text-xs text-accent-orange font-medium truncate">📌 Context: {context.title}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-bg-secondary border border-border text-text-secondary hover:border-accent-orange hover:text-accent-orange transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2 px-3 py-3 border-t border-border flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kuch bhi poochho AWS ke baare mein..."
              disabled={loading}
              className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors disabled:opacity-50"
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-accent-orange hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
