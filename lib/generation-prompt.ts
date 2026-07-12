import type { Lesson } from "@/lib/curriculum";

export function buildGenerationPrompt(lesson: Lesson): string {
  return `You are writing static, hand-editable study content for a Korean bilingual
Math2 (수학Ⅱ) learning app. The student is a Korean adult learner, precalculus
to early-calculus level, learning English alongside math. Write in the same
bilingual teaching voice a Korean teacher preparing students for US classrooms
would use.

LESSON
Topic: "${lesson.titleEn}" (${lesson.titleKo})
Scope: ${lesson.teachingInstruction}
Teach ONLY this topic — do not drift into other lessons' material.

LANGUAGE RULES
- Write in English by default. On the first mention of each math term, add
  the Korean term in parentheses: limit (극한), converge (수렴하다).
- Under every new equation, add a read-aloud line starting with 🗣, on its OWN
  paragraph, separated by a BLANK LINE from the equation above AND from any
  text after it. Never let a read-aloud line share a paragraph with anything
  else. e.g.:
  $$\\lim_{x \\to 2} f(x) = 5$$

  🗣 "The limit of f of x as x approaches two equals five."

  Continue here in a new paragraph, never on the same line as the 🗣 quote.

STRUCTURE MARKERS — the app's renderer looks for these exact patterns, so
follow them precisely:
- Multi-step reasoning (in workedExample AND in every practice/quiz
  solution): write each step as its own paragraph starting with exactly
  "Step 1 — ", "Step 2 — ", "Step 3 — " (that literal word "Step", the
  number, then an em dash), separated by blank lines. Do not use "Step"
  for a single-step solution — only when there are genuinely multiple steps.
- Exactly ONE key-idea sentence per lesson (in intuition or definition,
  wherever it fits best) — the single most important takeaway to remember.
  Put it on its own paragraph, separated by blank lines, starting with 💡,
  e.g.:

  💡 A limit only describes the trend near a point — it never requires the
  function to actually reach that point.

MATH FORMATTING
- Write ALL math in LaTeX: $...$ inline, $$...$$ for display. Never plain-text
  math like "x^2".
- Always put a blank line both before AND after a $$...$$ display equation,
  and before/after a markdown table — markdown merges anything on adjacent
  lines with no blank line into one paragraph, which breaks rendering.
- State degrees vs. radians when relevant.

OUTPUT — fill in every field:
- intuition: one short paragraph, an everyday analogy before any formalism.
  Put the 💡 key-idea line here if it fits, otherwise put it in definition.
- definition: the precise definition, bilingual terms, an equation with its
  read-aloud line.
- workedExample: one fully worked example, narrating every step and the "why"
  using the "Step N — " paragraphs described above.
- teachingNote: the most common student misconception on this topic and how
  to address it, one short paragraph. The app already labels this as a
  "Teaching note" card — do not repeat that label inside the text.
- note: a compact "📌 Note" flashcard — one-sentence definition, the key
  formula(s) in LaTeX, one read-aloud line, and the English–Korean term pairs
  introduced in this lesson, as flowing prose (not a bullet list).
- practice: exactly 3 problems on this lesson's topic only, easiest first.
  For each: a unique id (kebab-case), type ("multiple_choice" with exactly 4
  choices, or "numeric"), the prompt (markdown + LaTeX), correctAnswer, and a
  full bilingual solution (markdown + LaTeX, narrating the reasoning the way
  the worked example does — use "Step N — " paragraphs whenever the solution
  has more than one step).
  - multiple_choice: correctAnswer must be copied EXACTLY (character for
    character) from one entry in choices.
  - numeric: correctAnswer must be ONLY the simplified value as plain text —
    no units, no LaTeX, no "x =" prefix (e.g. "7", "-3", "1/2").
- quiz: exactly 3 DIFFERENT problems (not copies of the practice problems),
  same shape and rules as practice, similar difficulty, for a mastery check
  on this lesson's topic only.`;
}
