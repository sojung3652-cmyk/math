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
// Mobile bottom-sheet drag-to-dismiss: how far down (px) counts as "let go
// of it", vs. snapping back open.
const DRAG_DISMISS_THRESHOLD = 90;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// The same floating trigger + popup widget serves two contexts:
// - on a lesson page, `lesson` is passed: replies stay on-topic
//   (buildLessonSystemSuffix) and the conversation persists per lesson.
// - on the bookshelf, `lesson` is omitted: a plain free-question chat,
//   same as /chat's TutorChat but as a popup — ephemeral, no persistence,
//   since there's no lessonId to key it by.
export default function LessonChatPanel({
  lesson,
  onOpenChange,
}: {
  lesson?: Lesson;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(!lesson);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!lesson) return;
    fetch(`/api/chat-history?lessonId=${encodeURIComponent(lesson.id)}`)
      .then((res) => res.json())
      .then((data) => {
        const loaded: ChatMessage[] = Array.isArray(data?.messages) ? data.messages : [];
        setMessages(loaded);
        setHasHistory(loaded.length > 0);
      })
      .catch(() => {})
      .finally(() => setLoadedHistory(true));
    // Keyed on lesson.id, not the lesson object, so this only re-fetches
    // when the actual lesson changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [open, messages, loading]);

  function toggleOpen(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function onHandlePointerDown(e: React.PointerEvent) {
    dragStartRef.current = e.clientY;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function onHandlePointerMove(e: React.PointerEvent) {
    if (dragStartRef.current == null) return;
    setDragY(Math.max(0, e.clientY - dragStartRef.current));
  }
  function onHandlePointerUp() {
    if (dragY > DRAG_DISMISS_THRESHOLD) toggleOpen(false);
    setDragY(0);
    dragStartRef.current = null;
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
          ...(lesson ? { systemPromptSuffix: buildLessonSystemSuffix(lesson) } : {}),
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
      if (lesson) {
        setHasHistory(true);
        fetch("/api/chat-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id, messages: full }),
        }).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setMessages([]);
    setHasHistory(false);
    if (lesson) {
      await fetch(`/api/chat-history?lessonId=${encodeURIComponent(lesson.id)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  }

  return (
    <>
      <button
        type="button"
        className="chat-bubble-trigger"
        onClick={() => toggleOpen(!open)}
        aria-label={
          open
            ? "Close the tutor chat"
            : lesson
              ? "Ask the tutor a question about this lesson"
              : "Ask the tutor a question"
        }
        aria-expanded={open}
      >
        <svg
          className="chat-bubble-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H9l-4 3.5v-3.5H5.5C4.67 15 4 14.33 4 13.5v-8Z"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        {loadedHistory && hasHistory && <span className="chat-bubble-badge" />}
      </button>

      <aside
        className={`chat-panel${open ? " open" : ""}`}
        role="dialog"
        aria-label="Tutor chat"
        aria-hidden={!open}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
      >
        <div
          className="chat-panel-drag-handle"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <span className="chat-panel-drag-bar" />
        </div>

        <div className="chat-panel-header">
          <span className="chat-panel-title">
            {lesson ? "수학 튜터 · Math Tutor" : "자유 질문 · Free questions"}
          </span>
          <div className="chat-panel-header-actions">
            <button
              type="button"
              className="chat-panel-icon-btn"
              onClick={clearChat}
              disabled={messages.length === 0}
              title="Clear chat · 대화 삭제"
              aria-label="Clear chat"
            >
              ⟲
            </button>
            <button
              type="button"
              className="chat-panel-icon-btn"
              onClick={() => toggleOpen(false)}
              title="Minimize"
              aria-label="Minimize"
            >
              —
            </button>
            <button
              type="button"
              className="chat-panel-icon-btn"
              onClick={() => toggleOpen(false)}
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="chat-panel-messages" ref={scrollRef}>
          {messages.length === 0 && loadedHistory && (
            <p className="hint">
              {lesson
                ? `Ask anything about ${lesson.titleEn} (${lesson.titleKo}).`
                : "Ask anything about 수학Ⅰ or 수학Ⅱ · 무엇이든 물어보세요."}
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
          <div className="chat-panel-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendText(input.trim());
                }
              }}
              placeholder={lesson ? "이 수업에 대해 물어보세요…" : "무엇이든 물어보세요…"}
              aria-label="Message the tutor"
            />
            <button
              type="button"
              className="chat-panel-send"
              onClick={() => sendText(input.trim())}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
