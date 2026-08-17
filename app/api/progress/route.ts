import { NextRequest, NextResponse } from "next/server";
import { findLesson } from "@/lib/curriculum";
import {
  applyMilestone,
  applyQuizResult,
  getAllProgress,
  resetProgress,
  type Milestone,
} from "@/lib/progress-store";

const MILESTONES: Milestone[] = ["teaching_read", "practice_complete", "advanced_complete"];

export async function GET() {
  return NextResponse.json({ progress: getAllProgress() });
}

type MilestoneBody = { lessonId: string; event: "milestone"; milestone: Milestone };
type QuizResultBody = {
  lessonId: string;
  event: "quiz_result";
  correct: number;
  total: number;
};
type ResetBody = { lessonId: string; event: "reset" };

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | MilestoneBody
    | QuizResultBody
    | ResetBody
    | null;

  if (!body || typeof body.lessonId !== "string") {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }
  if (!findLesson(body.lessonId)) {
    return NextResponse.json({ error: "Unknown lessonId." }, { status: 404 });
  }

  if (body.event === "milestone") {
    if (!MILESTONES.includes(body.milestone)) {
      return NextResponse.json({ error: "Unknown milestone." }, { status: 400 });
    }
    const record = applyMilestone(body.lessonId, body.milestone);
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
    const record = applyQuizResult(body.lessonId, percentage);
    return NextResponse.json({ record });
  }

  if (body.event === "reset") {
    const record = resetProgress(body.lessonId);
    return NextResponse.json({ record });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
