import fs from "fs";
import path from "path";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// Local stand-in for a D1 `chat_messages` table (lesson_id, role, content,
// timestamp), same pattern as lib/progress-store.ts. Keyed by lessonId so
// each lesson's tutor conversation persists independently.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "chat-history.json");

function readAll(): Record<string, ChatMessage[]> {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, ChatMessage[]>;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, ChatMessage[]>) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
}

export function getChatHistory(lessonId: string): ChatMessage[] {
  return readAll()[lessonId] ?? [];
}

// Overwrites the full conversation for a lesson — the client always holds
// the authoritative in-memory array and persists it whole after each
// successful exchange, so there's no partial-append merge logic here.
export function saveChatHistory(lessonId: string, messages: ChatMessage[]): ChatMessage[] {
  const all = readAll();
  all[lessonId] = messages;
  writeAll(all);
  return messages;
}

export function clearChatHistory(lessonId: string): void {
  const all = readAll();
  delete all[lessonId];
  writeAll(all);
}

// lessonId -> has any saved messages. Used to show a small chat-history
// indicator next to a lesson's progress ring on the course/unit map.
export function getChatHistoryFlags(): Record<string, boolean> {
  const all = readAll();
  const flags: Record<string, boolean> = {};
  for (const [lessonId, messages] of Object.entries(all)) {
    flags[lessonId] = messages.length > 0;
  }
  return flags;
}
