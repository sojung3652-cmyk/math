import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CURRICULUM, type Lesson } from "@/lib/curriculum";
import { buildGenerationPrompt } from "@/lib/generation-prompt";
import { LessonContentBodySchema, contentExists, saveLessonContent } from "@/lib/lesson-content";

const MODEL = "claude-sonnet-5";
// Intro pricing through 2026-08-31; reverts to $3.00 / $15.00 per MTok after.
const PRICE_PER_MTOK_INPUT = 2.0;
const PRICE_PER_MTOK_OUTPUT = 10.0;

const client = new Anthropic();

// Carries token usage even on failure, so a truncated/refused/malformed
// response still gets counted toward the cost report — you were billed for
// it either way.
class GenerationError extends Error {
  usage: Anthropic.Usage;
  constructor(message: string, usage: Anthropic.Usage) {
    super(message);
    this.usage = usage;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const unit = args.find((a) => a.startsWith("--unit="))?.slice("--unit=".length);
  const lessonId = args.find((a) => a.startsWith("--lesson="))?.slice("--lesson=".length);
  const force = args.includes("--force");
  return { unit, lessonId, force };
}

function selectLessons(unit?: string, lessonId?: string): Lesson[] {
  const lessons: Lesson[] = [];
  for (const u of CURRICULUM) {
    if (unit && u.id !== unit) continue;
    for (const lesson of u.lessons) {
      if (lessonId && lesson.id !== lessonId) continue;
      lessons.push(lesson);
    }
  }
  return lessons;
}

// Claude's structured-outputs API rejects `minItems`/`maxItems` other than 0
// or 1 on array schemas, so the exact-3-items constraint from
// `.length(3)` on practice/quiz can't be sent to the API — strip it here.
// The prompt asks for exactly 3, and LessonContentBodySchema (with the
// constraint intact) still validates the parsed response afterward.
function relaxedOutputSchema() {
  const schema = z.toJSONSchema(LessonContentBodySchema) as {
    properties: Record<string, Record<string, unknown>>;
  };
  for (const field of ["practice", "quiz"]) {
    delete schema.properties[field].minItems;
    delete schema.properties[field].maxItems;
  }
  return schema;
}

async function generateOne(lesson: Lesson): Promise<Anthropic.Usage> {
  const prompt = buildGenerationPrompt(lesson);

  // Pass a plain JSON schema (not the SDK's zodOutputFormat helper) — that
  // helper attaches an auto-parse step that throws a bare AnthropicError
  // with no usage info on malformed/truncated JSON, which defeats our own
  // try/catch below and loses cost tracking on failure.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 24000,
    output_config: {
      format: { type: "json_schema", schema: relaxedOutputSchema() },
    },
    messages: [{ role: "user", content: prompt }],
  });
  const response = await stream.finalMessage();

  const usage = response.usage;

  if (response.stop_reason === "refusal") {
    throw new GenerationError(`Model refused to generate content for "${lesson.id}".`, usage);
  }
  if (response.stop_reason === "max_tokens") {
    throw new GenerationError(
      `Response for "${lesson.id}" was truncated at the max_tokens limit — raise max_tokens further.`,
      usage,
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new GenerationError(`No text content returned for "${lesson.id}".`, usage);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(textBlock.text);
  } catch (err) {
    throw new GenerationError(
      `Response for "${lesson.id}" was not valid JSON: ${err instanceof Error ? err.message : err}`,
      usage,
    );
  }

  const parsed = LessonContentBodySchema.safeParse(raw);
  if (!parsed.success) {
    throw new GenerationError(
      `Response for "${lesson.id}" didn't match the expected shape: ${parsed.error.message}`,
      usage,
    );
  }

  for (const q of [...parsed.data.practice, ...parsed.data.quiz]) {
    if (q.type === "multiple_choice" && !(q.choices ?? []).includes(q.correctAnswer)) {
      console.warn(
        `  ⚠ ${lesson.id} / ${q.id}: correctAnswer isn't an exact match to any choice — check by hand.`,
      );
    }
  }

  saveLessonContent(lesson.id, parsed.data);
  return usage;
}

async function main() {
  const { unit, lessonId, force } = parseArgs();
  const targets = selectLessons(unit, lessonId);

  if (targets.length === 0) {
    console.log("No lessons matched that filter. Check --unit=/--lesson= against lib/curriculum.ts ids.");
    return;
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let totalInput = 0;
  let totalOutput = 0;

  for (const lesson of targets) {
    if (!force && contentExists(lesson.id)) {
      console.log(`skip   ${lesson.id} (content already exists — pass --force to regenerate)`);
      skipped++;
      continue;
    }

    console.log(`gen    ${lesson.id} ...`);
    try {
      const usage = await generateOne(lesson);
      totalInput += usage.input_tokens;
      totalOutput += usage.output_tokens;
      generated++;
      console.log(`  done  input=${usage.input_tokens} output=${usage.output_tokens} tokens`);
    } catch (err) {
      failed++;
      if (err instanceof GenerationError) {
        totalInput += err.usage.input_tokens;
        totalOutput += err.usage.output_tokens;
        console.error(
          `  FAILED ${lesson.id} (billed input=${err.usage.input_tokens} output=${err.usage.output_tokens}): ${err.message}`,
        );
      } else {
        console.error(`  FAILED ${lesson.id}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  const cost =
    (totalInput / 1_000_000) * PRICE_PER_MTOK_INPUT +
    (totalOutput / 1_000_000) * PRICE_PER_MTOK_OUTPUT;

  console.log("\n--- summary ---");
  console.log(`generated: ${generated}, skipped: ${skipped}, failed: ${failed}`);
  console.log(`tokens: input=${totalInput} output=${totalOutput}`);
  console.log(`cost for this run: $${cost.toFixed(4)} (model=${MODEL}, intro pricing)`);
  if (generated > 0) {
    console.log(`average cost per successfully generated lesson: $${(cost / generated).toFixed(4)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
