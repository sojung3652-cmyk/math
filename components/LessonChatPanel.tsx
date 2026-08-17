"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeTutorFormatting } from "@/lib/tutor-markdown";
import { buildLessonSystemSuffix, type Lesson } from "@/lib/curriculum";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// Only the last N turns are sent to the model per request — persisted
// history on disk is never truncated, only what's forwarded as context.
const MAX_CONTEXT_MESSAGES = 20;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function LessonChatPanel({
  lesson,
  onOpenChange,
}: {
  lesson: Lesson;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/chat-history?lessonId=${encodeURIComponent(lesson.id)}`)
      .then((res) => res.json())
      .then((data) => {
        const loaded: ChatMessage[] = Array.isArray(data?.messages) ? data.messages : [];
        setMessages(loaded);
        setHasHistory(loaded.length > 0);
      })
      .catch(() => {})
      .finally(() => setLoadedHistory(true));
  }, [lesson.id]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [open, messages, loading]);

  function toggleOpen(next: boolean) {
    setOpen(next);
    setConfirmingClear(false);
    onOpenChange?.(next);
  }

  async function sendText(text: string) {
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiMessages = next
        .slice(-MAX_CONTEXT_MESSAGES)
        .map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPromptSuffix: buildLessonSystemSuffix(lesson),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      const full = [...next, assistantMessage];
      setMessages(full);
      setHasHistory(true);
      fetch("/api/chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, messages: full }),
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmClear() {
    setConfirmingClear(false);
    setMessages([]);
    setHasHistory(false);
    await fetch(`/api/chat-history?lessonId=${encodeURIComponent(lesson.id)}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chat-bubble-trigger"
          onClick={() => toggleOpen(true)}
          aria-label="Ask the tutor a question about this lesson"
        >
          <span className="chat-bubble-icon">질문?</span>
          {loadedHistory && hasHistory && <span className="chat-bubble-badge" />}
        </button>
      )}

      <div
        className={`chat-panel-backdrop${open ? " open" : ""}`}
        onClick={() => toggleOpen(false)}
      />

      <aside
        className={`chat-panel${open ? " open" : ""}`}
        role="dialog"
        aria-label="Tutor chat"
        aria-hidden={!open}
      >
        <div className="chat-panel-header">
          {confirmingClear ? (
            <span className="chat-panel-clear-confirm">
              Clear this chat?
              <button type="button" onClick={() => setConfirmingClear(false)}>
                Cancel
              </button>
              <button type="button" onClick={confirmClear}>
                Clear
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="chat-panel-clear"
              onClick={() => setConfirmingClear(true)}
              disabled={messages.length === 0}
            >
              Clear chat · 대화 삭제
            </button>
          )}
          <button type="button" className="chat-panel-close" onClick={() => toggleOpen(false)}>
            ✕ Close
          </button>
        </div>

        <div className="chat-panel-messages" ref={scrollRef}>
          {messages.length === 0 && loadedHistory && (
            <p className="hint">
              Ask anything about {lesson.titleEn} ({lesson.titleKo}).
            </p>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div className="chat-bubble chat-bubble-student" key={i}>
                <div className="chat-bubble-content">
                  <p>{m.content}</p>
                  <span className="chat-timestamp">{formatTime(m.timestamp)}</span>
                </div>
              </div>
            ) : (
              <div className="chat-bubble chat-bubble-tutor" key={i}>
                <span className="chat-avatar">T</span>
                <div className="chat-bubble-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeTutorFormatting]}
                  >
                    {m.content}
                  </ReactMarkdown>
                  <span className="chat-timestamp">{formatTime(m.timestamp)}</span>
                </div>
              </div>
            ),
          )}
          {loading && (
            <div className="chat-bubble chat-bubble-tutor">
              <span className="chat-avatar">T</span>
              <div className="chat-bubble-content">
                <p className="hint">thinking...</p>
              </div>
            </div>
          )}
          {error && <p className="error-line">{error}</p>}
        </div>

        <div className="chat-panel-composer">
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
              placeholder="Ask about this lesson… 무엇이든 물어보세요"
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
        </div>
      </aside>
    </>
  );
}
