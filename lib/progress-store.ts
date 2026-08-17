import fs from "fs";
import path from "path";
import { allLessonIds } from "@/lib/curriculum";

export type LessonStatus = "not_started" | "in_progress" | "mastered";

// Granular milestones inside a lesson. Percent only ever moves forward
// (see bumpProgress) — a later milestone can't undo an earlier one, and
// only resetProgress can bring it back to 0.
export type Milestone = "teaching_read" | "practice_complete" | "advanced_complete";

const MILESTONE_PERCENT: Record<Milestone, number> = {
  teaching_read: 25,
  practice_complete: 50,
  advanced_complete: 75,
};

export type ProgressRecord = {
  lessonId: string;
  status: LessonStatus;
  percent: number;
  score: number | null;
  updatedAt: string;
};

// Local stand-in for the D1 `progress` table (lesson_id, status, percent,
// score, updated_at). Phase 4 swaps this module's internals for a D1 client
// with the same function signatures — nothing else in the app needs to change.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "progress.json");

function readAll(): Record<string, ProgressRecord> {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, ProgressRecord>;
  } catch {
    return {};
  }
}

function writeAll(records: Record<string, ProgressRecord>) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

function statusFromPercent(percent: number): LessonStatus {
  if (percent >= 100) return "mastered";
  if (percent > 0) return "in_progress";
  return "not_started";
}

function defaultRecord(lessonId: string): ProgressRecord {
  return { lessonId, status: "not_started", percent: 0, score: null, updatedAt: "" };
}

export function getAllProgress(): Record<string, ProgressRecord> {
  const stored = readAll();
  const result: Record<string, ProgressRecord> = {};
  for (const lessonId of allLessonIds()) {
    result[lessonId] = stored[lessonId] ?? defaultRecord(lessonId);
  }
  return result;
}

export function getProgress(lessonId: string): ProgressRecord {
  const stored = readAll();
  return stored[lessonId] ?? defaultRecord(lessonId);
}

// Moves a lesson's progress forward to `percent`, never backward — hitting
// the same or an earlier milestone twice (e.g. re-scrolling past the
// teaching section) is a no-op rather than a regression.
function bumpProgress(
  lessonId: string,
  percent: number,
  score: number | null = null,
): ProgressRecord {
  const stored = readAll();
  const current = stored[lessonId] ?? defaultRecord(lessonId);
  const nextPercent = Math.max(current.percent, percent);
  const record: ProgressRecord = {
    lessonId,
    percent: nextPercent,
    status: statusFromPercent(nextPercent),
    score: score ?? current.score,
    updatedAt: new Date().toISOString(),
  };
  stored[lessonId] = record;
  writeAll(stored);
  return record;
}

export function applyMilestone(lessonId: string, milestone: Milestone): ProgressRecord {
  return bumpProgress(lessonId, MILESTONE_PERCENT[milestone]);
}

export function applyQuizResult(lessonId: string, percentage: number): ProgressRecord {
  if (percentage >= 80) return bumpProgress(lessonId, 100, percentage);
  // Below mastery threshold: keep whatever percent was already earned via
  // milestones, just remember the latest attempt's score.
  const stored = readAll();
  const current = stored[lessonId] ?? defaultRecord(lessonId);
  const record: ProgressRecord = { ...current, score: percentage, updatedAt: new Date().toISOString() };
  stored[lessonId] = record;
  writeAll(stored);
  return record;
}

export function resetProgress(lessonId: string): ProgressRecord {
  const stored = readAll();
  const record = defaultRecord(lessonId);
  stored[lessonId] = record;
  writeAll(stored);
  return record;
}
