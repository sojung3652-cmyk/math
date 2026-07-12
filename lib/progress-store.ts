import fs from "fs";
import path from "path";
import { allLessonIds } from "@/lib/curriculum";

export type LessonStatus = "not_started" | "in_progress" | "mastered";

export type ProgressRecord = {
  lessonId: string;
  status: LessonStatus;
  score: number | null;
  updatedAt: string;
};

// Local stand-in for the D1 `progress` table (lesson_id, status, score,
// updated_at). Phase 4 swaps this module's internals for a D1 client with
// the same function signatures — nothing else in the app needs to change.
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

function defaultRecord(lessonId: string): ProgressRecord {
  return { lessonId, status: "not_started", score: null, updatedAt: "" };
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

export function setProgress(
  lessonId: string,
  status: LessonStatus,
  score: number | null = null,
): ProgressRecord {
  const stored = readAll();
  const record: ProgressRecord = {
    lessonId,
    status,
    score,
    updatedAt: new Date().toISOString(),
  };
  stored[lessonId] = record;
  writeAll(stored);
  return record;
}
