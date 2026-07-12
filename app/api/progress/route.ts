import { NextRequest, NextResponse } from "next/server";
import { findLesson } from "@/lib/curriculum";
import { getAllProgress, getProgress, setProgress } from "@/lib/progress-store";

export async function GET() {
  return NextResponse.json({ progress: getAllProgress() });
}

type StartBody = { lessonId: string; event: "start" };
type QuizResultBody = {
  lessonId: string;
  event: "quiz_result";
  correct: number;
  total: number;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | StartBody
    | QuizResultBody
    | null;

  if (!body || typeof body.lessonId !== "string") {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }
  if (!findLesson(body.lessonId)) {
    return NextResponse.json({ error: "Unknown lessonId." }, { status: 404 });
  }

  if (body.event === "start") {
    const current = getProgress(body.lessonId);
    const record =
      current.status === "not_started"
        ? setProgress(body.lessonId, "in_progress", null)
        : current;
    return NextResponse.json({ record });
  }

  if (body.event === "quiz_result") {
    const { correct, total } = body;
    if (
      typeof correct !== "number" ||
      typeof total !== "number" ||
      total <= 0 ||
      correct < 0 ||
      correct > total
    ) {
      return NextResponse.json(
        { error: "correct/total must be valid numbers with 0 <= correct <= total." },
        { status: 400 },
      );
    }
    const percentage = Math.round((correct / total) * 100);
    const status = percentage >= 80 ? "mastered" : "in_progress";
    const record = setProgress(body.lessonId, status, percentage);
    return NextResponse.json({ record });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
