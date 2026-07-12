import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/tutor-prompt";

const client = new Anthropic();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages = body?.messages as ChatMessage[] | undefined;
  const systemPromptSuffix = body?.systemPromptSuffix as string | undefined;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Request body must include a non-empty `messages` array." },
      { status: 400 },
    );
  }

  const system = systemPromptSuffix
    ? `${TUTOR_SYSTEM_PROMPT}\n\n${systemPromptSuffix}`
    : TUTOR_SYSTEM_PROMPT;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");

    return NextResponse.json({ reply: textBlock?.text ?? "" });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 500 },
      );
    }
    return NextResponse.json(
      { error: "Unexpected error calling the tutor." },
      { status: 500 },
    );
  }
}
