import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CURRICULUM, type Lesson } from "@/lib/curriculum";
import { buildAddDepthPrompt } from "@/lib/add-depth-prompt";
import {
  DepthResponseSchema,
  loadLessonContent,
  saveLessonContent,
  type LessonContentBody,
} from "@/lib/lesson-content";
import { relaxJSONSchema } from "@/lib/relax-schema";

const MODEL = "claude-sonnet-5";
// Intro pricing through 2026-08-31; reverts to $3.00 / $15.00 per MTok after.
const PRICE_PER_MTOK_INPUT = 2.0;
const PRICE_PER_MTOK_OUTPUT = 10.0;

const client = new Anthropic();

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

function relaxedOutputSchema(): Record<string, unknown> {
  return relaxJSONSchema(z.toJSONSchema(DepthResponseSchema)) as Record<string, unknown>;
}

async function addDepthToOne(lesson: Lesson, content: LessonContentBody): Promise<Anthropic.Usage> {
  const prompt = buildAddDepthPrompt(lesson, content);

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 24000,
    output_config: { format: { type: "json_schema", schema: relaxedOutputSchema() } },
    messages: [{ role: "user", content: prompt }],
  });
  const response = await stream.finalMessage();
  const usage = response.usage;

  if (response.stop_reason === "refusal") {
    throw new GenerationError(`Model refused to add depth for "${lesson.id}".`, usage);
  }
  if (response.stop_reason === "max_tokens") {
    throw new GenerationError(
      `Response for "${lesson.id}" was truncated at the max_tokens limit.`,
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

  const parsed = DepthResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new GenerationError(
      `Response for "${lesson.id}" didn't match the expected shape: ${parsed.error.message}`,
      usage,
    );
  }

  for (const q of [...parsed.data.advanced.practice]) {
    if (q.type === "multiple_choice" && !(q.choices ?? []).includes(q.correctAnswer)) {
      console.warn(
        `  ⚠ ${lesson.id} / ${q.id}: correctAnswer isn't an exact match to any choice — check by hand.`,
      );
    }
  }

  const existingIds = new Set(content.graphs.map((g) => g.id));
  const newGraphs = parsed.data.graphs.filter((g) => {
    if (existingIds.has(g.id)) {
      console.warn(`  ⚠ ${lesson.id}: new graph id "${g.id}" collides with an existing graph — dropped.`);
      return false;
    }
    return true;
  });

  const updated: LessonContentBody = {
    ...content,
    goingDeeper: parsed.data.goingDeeper,
    advanced: parsed.data.advanced,
    graphs: [...content.graphs, ...newGraphs],
  };

  saveLessonContent(lesson.id, updated);
  console.log(`  -> goingDeeper + advanced (${newGraphs.length} new graph(s)) added`);
  return usage;
}

async function main() {
  const { unit, lessonId, force } = parseArgs();
  const targets = selectLessons(unit, lessonId);

  if (targets.length === 0) {
    console.log("No lessons matched that filter. Check --unit=/--lesson= against lib/curriculum.ts ids.");
    return;
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let totalInput = 0;
  let totalOutput = 0;

  for (const lesson of targets) {
    const content = loadLessonContent(lesson.id);
    if (!content) {
      console.log(`skip   ${lesson.id} (no content file yet — generate it first)`);
      skipped++;
      continue;
    }
    if (!force && content.advanced) {
      console.log(`skip   ${lesson.id} (already has a depth pass — pass --force to redo)`);
      skipped++;
      continue;
    }

    console.log(`gen    ${lesson.id} ...`);
    try {
      const usage = await addDepthToOne(lesson, content);
      totalInput += usage.input_tokens;
      totalOutput += usage.output_tokens;
      processed++;
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
  console.log(`processed: ${processed}, skipped: ${skipped}, failed: ${failed}`);
  console.log(`tokens: input=${totalInput} output=${totalOutput}`);
  console.log(`cost for this run: $${cost.toFixed(4)} (model=${MODEL}, intro pricing)`);
  if (processed > 0) {
    console.log(`average cost per lesson: $${(cost / processed).toFixed(4)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
