import fs from "fs";
import path from "path";
import { z } from "zod";
import { GraphSpecSchema } from "@/lib/graph-spec";

export const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["multiple_choice", "numeric"]),
  prompt: z.string(),
  choices: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  solution: z.string(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const AdvancedSectionSchema = z.object({
  content: z.string(),
  practice: z.array(QuestionSchema).length(2),
});
export type AdvancedSection = z.infer<typeof AdvancedSectionSchema>;

export const LessonContentBodySchema = z.object({
  intuition: z.string(),
  definition: z.string(),
  workedExample: z.string(),
  teachingNote: z.string(),
  note: z.string(),
  practice: z.array(QuestionSchema).length(3),
  quiz: z.array(QuestionSchema).length(3),
  graphs: z.array(GraphSpecSchema).max(6).default([]),
  // Added by the depth pass (scripts/add-depth-to-lessons.ts) after the
  // base lesson exists — empty/null on lessons that haven't been upgraded
  // yet, so old content files keep loading fine in the meantime.
  goingDeeper: z.string().default(""),
  advanced: AdvancedSectionSchema.nullable().default(null),
});
export type LessonContentBody = z.infer<typeof LessonContentBodySchema>;

// The response shape for scripts/add-depth-to-lessons.ts — new graphs are
// additive (merged into the existing graphs array), never a replacement.
export const DepthResponseSchema = z.object({
  goingDeeper: z.string(),
  advanced: AdvancedSectionSchema,
  graphs: z.array(GraphSpecSchema).max(4).default([]),
});
export type DepthResponse = z.infer<typeof DepthResponseSchema>;

export type LessonContent = LessonContentBody & {
  lessonId: string;
  generatedAt: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "lessons");

export function contentFilePath(lessonId: string): string {
  return path.join(CONTENT_DIR, `${lessonId}.json`);
}

export function contentExists(lessonId: string): boolean {
  return fs.existsSync(contentFilePath(lessonId));
}

// Content files are hand-editable, so a bad edit shouldn't crash the page —
// validate with safeParse and let the caller fall back gracefully.
export function loadLessonContent(lessonId: string): LessonContent | null {
  let raw: string;
  try {
    raw = fs.readFileSync(contentFilePath(lessonId), "utf-8");
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Content file for "${lessonId}" is not valid JSON:`, err);
    return null;
  }

  const result = LessonContentBodySchema.safeParse(parsed);
  if (!result.success) {
    console.error(`Content file for "${lessonId}" doesn't match the expected shape:`, result.error.message);
    return null;
  }

  const record = parsed as Record<string, unknown>;
  return {
    ...result.data,
    lessonId,
    generatedAt: typeof record.generatedAt === "string" ? record.generatedAt : "",
  };
}

export function saveLessonContent(lessonId: string, body: LessonContentBody): LessonContent {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const record: LessonContent = {
    ...body,
    lessonId,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(contentFilePath(lessonId), JSON.stringify(record, null, 2));
  return record;
}
