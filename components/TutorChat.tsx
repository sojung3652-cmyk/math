"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeTutorFormatting } from "@/lib/tutor-markdown";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function TutorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendText(text: string) {
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("en-CA").replaceAll("-", ".");

  return (
    <>
      <main>
        <div className="day-rule" suppressHydrationWarning>
          — TODAY · {today} —
        </div>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div className="msg-student" key={i}>
              <span className="who">ME</span>
              {m.content}
            </div>
          ) : (
            <div className="msg-tutor" key={i}>
              <span className="who">TUTOR</span>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeTutorFormatting]}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          ),
        )}

        {loading && (
          <div className="msg-tutor">
            <span className="who">TUTOR</span>
            <p style={{ color: "var(--muted)" }}>thinking...</p>
          </div>
        )}
        {error && <div className="error-line">{error}</div>}
      </main>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText(input.trim());
              }
            }}
            placeholder="Ask about limits, derivatives, integrals… 무엇이든 물어보세요"
            aria-label="Message the tutor"
          />
          <button
            className="btn-send"
            onClick={() => sendText(input.trim())}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
        <p className="hint">ENTER to send · SHIFT+ENTER for a new line</p>
      </div>
    </>
  );
}
