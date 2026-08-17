import { NextRequest, NextResponse } from "next/server";
import { findLesson } from "@/lib/curriculum";
import {
  clearChatHistory,
  getChatHistory,
  saveChatHistory,
  type ChatMessage,
} from "@/lib/chat-history";

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        typeof m.timestamp === "string",
    )
  );
}

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId || !findLesson(lessonId)) {
    return NextResponse.json({ error: "Unknown lessonId." }, { status: 400 });
  }
  return NextResponse.json({ messages: getChatHistory(lessonId) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const lessonId = body?.lessonId as string | undefined;

  if (!lessonId || !findLesson(lessonId)) {
    return NextResponse.json({ error: "Unknown lessonId." }, { status: 400 });
  }
  if (!isValidMessages(body?.messages)) {
    return NextResponse.json(
      { error: "messages must be an array of {role, content, timestamp}." },
      { status: 400 },
    );
  }

  return NextResponse.json({ messages: saveChatHistory(lessonId, body.messages) });
}

export async function DELETE(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId || !findLesson(lessonId)) {
    return NextResponse.json({ error: "Unknown lessonId." }, { status: 400 });
  }
  clearChatHistory(lessonId);
  return NextResponse.json({ ok: true });
}
