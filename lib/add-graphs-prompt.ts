import type { Lesson } from "@/lib/curriculum";
import type { LessonContentBody } from "@/lib/lesson-content";

const TEXT_FIELDS = ["intuition", "definition", "workedExample", "teachingNote", "note"] as const;

function numberedParagraphs(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p, i) => `[${i}] ${p}`)
    .join("\n\n");
}

export function buildAddGraphsPrompt(lesson: Lesson, content: LessonContentBody): string {
  const fieldsBlock = TEXT_FIELDS.map(
    (field) => `### ${field}\n${numberedParagraphs(content[field])}`,
  ).join("\n\n");

  return `You are adding GRAPHS to an already-written lesson. Do NOT rewrite, edit, or
rephrase any existing text — you will only be asked for graph specs and
exactly where to insert a placeholder for each one. The paragraphs of each
field are numbered [0], [1], [2]... below so you can reference them.

LESSON
Topic: "${lesson.titleEn}" (${lesson.titleKo})

EXISTING CONTENT (numbered by paragraph within each field)
${fieldsBlock}

GRAPHS TO ADD
Add a graph wherever a picture genuinely aids understanding — this is
REQUIRED for topics like: a limit with a hole in the graph, one-sided
limits, continuity/discontinuity types, a derivative as a tangent line's
slope, increasing/decreasing and extrema, area under a curve, and
exponential/log/trig graphs and their transformations. It's fine to return
zero placements if this lesson has no genuinely visual moment.

For each graph, output one placement:
- graph.id: short kebab-case id, unique within this lesson.
- graph.captionEn / graph.captionKo: a one-line bilingual caption.
- graph.xDomain / graph.yDomain: [min, max] the viewport should show.
- graph.functions: 1-4 entries, each { expression (in terms of x, e.g.
  "x^2 - 1" or "(x^2-1)/(x-1)"), color: "ink" | "pen-blue" | "red-pen"
  (default pen-blue), domain: optional [lo, hi] to draw only part of the
  curve, dashed: true for a dashed line }.
- graph.points: optional, each { x, y, style: "open" | "closed", color }.
- graph.asymptotes: optional, each { axis: "x" | "y", value }.
- field: which of the fields above ("intuition", "definition",
  "workedExample", "teachingNote", or "note") this graph belongs next to.
- afterParagraph: the paragraph number in that field (from the [N] markers
  above) that this graph should appear immediately after.

Each placement's graph.id must be unique. Do not reuse an id across
placements.`;
}
