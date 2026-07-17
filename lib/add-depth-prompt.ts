import type { Lesson } from "@/lib/curriculum";
import type { LessonContentBody } from "@/lib/lesson-content";

function questionsBlock(label: string, questions: LessonContentBody["practice"]): string {
  return `${label}\n${questions
    .map((q, i) => `${i + 1}. [${q.type}] ${q.prompt}\n   answer: ${q.correctAnswer}`)
    .join("\n")}`;
}

export function buildAddDepthPrompt(lesson: Lesson, content: LessonContentBody): string {
  return `You are adding TWO new sections to an already-written lesson, for a Korean
bilingual Math2 (수학Ⅱ) learning app. Do NOT rewrite, edit, or reference back
to any existing text directly — write fresh content that goes further than
what's already there.

LESSON
Topic: "${lesson.titleEn}" (${lesson.titleKo})
Scope: ${lesson.teachingInstruction}

EXISTING CONTENT (for context only — read this so your new sections
genuinely add something new, not a repeat)

### Intuition
${content.intuition}

### Definition
${content.definition}

### Worked example (already covers one problem type — your second example
below must use a DIFFERENT problem type/setup)
${content.workedExample}

### Teaching note
${content.teachingNote}

${questionsBlock("### Existing practice problems", content.practice)}

${questionsBlock("### Existing quiz problems", content.quiz)}

LANGUAGE & FORMATTING RULES (same conventions as the rest of the app)
- Write in English by default; on first mention of a new math term, add the
  Korean gloss in parentheses: converge (수렴하다).
- Every new equation gets a 🗣 read-aloud line on its OWN paragraph, blank
  line before and after, never sharing a paragraph with anything else.
- Multi-step reasoning: each step is its own paragraph starting with exactly
  "Step 1 — ", "Step 2 — ", etc., separated by blank lines.
- All math in LaTeX ($...$ inline, $$...$$ display), blank line before AND
  after every $$...$$ display equation and every markdown table.
- A common-mistake pair: the wrong step on its own paragraph starting with
  ❌, immediately followed by the correction on its own paragraph starting
  with ✅, each separated by blank lines.
- Graphs: optional. If a picture would genuinely help (e.g. showing the edge
  case, or the harder example's shape), add an entry to the "graphs" array
  (id, captionEn, captionKo, xDomain, yDomain, functions [expression, color:
  "ink"|"pen-blue"|"red-pen", domain, dashed], points [x, y, style: "open"|
  "closed", color], asymptotes [axis: "x"|"y", value]) and reference it with
  "{{graph:that-id}}" on its own paragraph where it belongs. Reuse a
  DIFFERENT id than any graph already in this lesson.

WRITE TWO SECTIONS

1. goingDeeper (더 알아보기 · Going deeper) — one continuous piece of content:
   - A second fully worked example using a DIFFERENT problem type/setup than
     the existing worked example above (same "Step N — " narration style).
   - One or two ❌/✅ common-mistake pairs for mistakes students actually
     make on this exact topic.
   - A short paragraph on edge cases of the concept (a boundary, an
     undefined case, or a special value).

2. advanced (심화 · Advanced) — an object with:
   - content: one harder, exam-style worked example in the flavor of a
     Korean 수능/모의고사 problem on this topic (more steps, less hand-holding
     than the existing example), followed by one paragraph of deeper
     theoretical insight — the "why" behind a related fact a curious
     student would ask about.
   - practice: exactly 2 problems, harder than everything above, each with
     type, prompt, correctAnswer, and a full solution. Do not duplicate any
     existing practice/quiz problem shown above.`;
}
