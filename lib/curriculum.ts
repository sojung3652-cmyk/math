export type Lesson = {
  id: string;
  titleEn: string;
  titleKo: string;
  teachingInstruction: string;
};

export type Unit = {
  id: string;
  titleEn: string;
  titleKo: string;
  lessons: Lesson[];
};

export const CURRICULUM: Unit[] = [
  {
    id: "limits-continuity",
    titleEn: "Limits and Continuity",
    titleKo: "함수의 극한과 연속",
    lessons: [
      {
        id: "what-is-a-limit",
        titleEn: "What is a limit?",
        titleKo: "극한이란 무엇인가",
        teachingInstruction:
          "Teach the intuitive and formal idea of a limit: the value f(x) approaches as x approaches a point a, without necessarily reaching or being defined at a. Use a table-of-values or graphical approach-from-both-sides intuition before the $\\lim_{x \\to a} f(x) = L$ notation. Do not cover limit laws, one-sided limits, or infinity yet — those are separate lessons.",
      },
      {
        id: "limit-laws",
        titleEn: "Limit laws",
        titleKo: "극한법칙",
        teachingInstruction:
          "Teach the algebraic limit laws: sum, difference, product, quotient (with nonzero denominator limit), and constant multiple rules, plus limits of polynomial and rational functions by direct substitution. Include one example requiring factoring to resolve a 0/0 form. Assume the student already knows what a limit is; do not re-derive the basic definition.",
      },
      {
        id: "one-sided-limits",
        titleEn: "One-sided limits",
        titleKo: "좌극한과 우극한",
        teachingInstruction:
          "Teach left-hand limits $\\lim_{x \\to a^-} f(x)$ and right-hand limits $\\lim_{x \\to a^+} f(x)$, and the rule that the two-sided limit exists iff both one-sided limits exist and are equal. Use a piecewise function example where they disagree. Do not yet introduce continuity or limits at infinity.",
      },
      {
        id: "limits-at-infinity",
        titleEn: "Limits at infinity",
        titleKo: "무한대에서의 극한",
        teachingInstruction:
          "Teach limits as x approaches +infinity or -infinity, focusing on rational functions: compare degrees of numerator and denominator to find horizontal asymptotes, using the divide-by-highest-power technique. Distinguish this from a limit being infinite (vertical asymptote) at a finite point. Keep to polynomial and rational functions only.",
      },
      {
        id: "continuity",
        titleEn: "Continuity",
        titleKo: "연속",
        teachingInstruction:
          "Teach the three-part definition of continuity at a point (f(a) is defined, the limit exists at a, and the limit equals f(a)), and continuity on an interval. Classify a removable vs. a jump discontinuity using a simple example. Do not cover the Intermediate Value Theorem yet — that is the next lesson.",
      },
      {
        id: "intermediate-value-theorem",
        titleEn: "Intermediate Value Theorem",
        titleKo: "중간값 정리",
        teachingInstruction:
          "Teach the Intermediate Value Theorem: if f is continuous on [a, b] and k is between f(a) and f(b), then some c in [a, b] has f(c) = k. Emphasize the everyday intuition (you can't skip a value while walking a continuous path) and one worked example using it to prove a root exists in an interval. Assume continuity is already understood.",
      },
    ],
  },
  {
    id: "differentiation",
    titleEn: "Differentiation",
    titleKo: "미분",
    lessons: [
      {
        id: "rate-of-change",
        titleEn: "Rate of change",
        titleKo: "변화율",
        teachingInstruction:
          "Teach average rate of change as a slope of a secant line, $\\frac{f(b) - f(a)}{b - a}$, motivated by a real-world example (e.g. average speed). Set up the idea that shrinking the interval leads toward an instantaneous rate of change, as a bridge to the derivative — but do not yet introduce the formal derivative definition or limit notation for it.",
      },
      {
        id: "definition-of-the-derivative",
        titleEn: "Definition of the derivative",
        titleKo: "도함수의 정의",
        teachingInstruction:
          "Teach the derivative as the limit of the difference quotient, $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{x}$ corrected to $\\frac{f(x+h)-f(x)}{h}$, as the instantaneous rate of change / slope of the tangent line. Derive the derivative of a simple polynomial (e.g. f(x) = x^2) directly from this limit definition. Do not introduce shortcut differentiation rules yet — that is the next lesson.",
      },
      {
        id: "differentiation-rules",
        titleEn: "Differentiation rules",
        titleKo: "미분법칙",
        teachingInstruction:
          "Teach the power rule, constant multiple rule, sum/difference rule, and product and quotient rules for polynomial functions, deriving the power rule informally from the limit definition already learned. Give one worked example combining several rules on a polynomial. Do not cover the chain rule or transcendental functions (outside Math2 polynomial scope).",
      },
      {
        id: "tangent-lines",
        titleEn: "Tangent lines",
        titleKo: "접선",
        teachingInstruction:
          "Teach how to find the equation of the tangent line to a polynomial curve at a given point, using the derivative as slope and the point-slope form $y - y_0 = f'(x_0)(x - x_0)$. Include one worked example finding both the tangent and, briefly, the normal line's slope as the negative reciprocal. Assume differentiation rules are already known.",
      },
      {
        id: "increasing-decreasing-extrema",
        titleEn: "Increasing/decreasing and extrema",
        titleKo: "증가와 감소, 극대와 극소",
        teachingInstruction:
          "Teach how the sign of f'(x) determines where a polynomial is increasing or decreasing, how critical points (where f'(x) = 0) are located, and the first-derivative test to classify each as a local maximum, local minimum, or neither. Use one worked example with a cubic function and a sign chart. Do not cover graphing the full curve yet — that is the next lesson.",
      },
      {
        id: "graphing",
        titleEn: "Graphing polynomial functions",
        titleKo: "함수의 그래프 그리기",
        teachingInstruction:
          "Teach how to sketch a polynomial function's graph by combining intercepts, the increasing/decreasing sign chart, local extrema, and end behavior (leading term) — briefly mention concavity from the second derivative if useful, but keep the emphasis on assembling a shape from the first-derivative analysis already taught. Use one full worked example sketching a cubic or quartic.",
      },
      {
        id: "velocity-and-acceleration",
        titleEn: "Velocity and acceleration",
        titleKo: "속도와 가속도",
        teachingInstruction:
          "Teach the physical interpretation of derivatives: for a position function s(t), velocity is v(t) = s'(t) and acceleration is a(t) = v'(t) = s''(t). Cover distinguishing speeding up/slowing down and direction of motion from the signs of v(t) and a(t). Use one worked example with a polynomial position function.",
      },
    ],
  },
  {
    id: "integration",
    titleEn: "Integration",
    titleKo: "적분",
    lessons: [
      {
        id: "antiderivatives",
        titleEn: "Antiderivatives",
        titleKo: "부정적분의 개념",
        teachingInstruction:
          "Teach the antiderivative as the reverse operation of differentiation: F is an antiderivative of f if F'(x) = f(x), and that antiderivatives of the same function differ by a constant C. Find antiderivatives of simple power functions by reversing the power rule, before introducing indefinite integral notation. Do not yet introduce the $\\int$ symbol formally — that is the next lesson.",
      },
      {
        id: "indefinite-integrals",
        titleEn: "Indefinite integrals",
        titleKo: "부정적분",
        teachingInstruction:
          "Teach indefinite integral notation $\\int f(x)\\,dx = F(x) + C$, the power rule for integration $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$ (n != -1), and linearity (sum and constant multiple rules) for polynomials. Give one worked example integrating a polynomial term by term. Assume antiderivatives are already understood conceptually.",
      },
      {
        id: "definite-integrals",
        titleEn: "Definite integrals",
        titleKo: "정적분",
        teachingInstruction:
          "Teach the definite integral $\\int_a^b f(x)\\,dx$ as a signed area under a curve, built from the limit of a Riemann sum intuition (brief, not fully rigorous), and its basic properties (reversing bounds negates it, additivity over adjacent intervals). Do not yet show how to evaluate it via antiderivatives — that is the Fundamental Theorem lesson next.",
      },
      {
        id: "fundamental-theorem-of-calculus",
        titleEn: "Fundamental Theorem of Calculus",
        titleKo: "미적분의 기본정리",
        teachingInstruction:
          "Teach the Fundamental Theorem of Calculus: if F is an antiderivative of f, then $\\int_a^b f(x)\\,dx = F(b) - F(a)$. This is the bridge connecting antiderivatives to definite integrals/area. Work one full example evaluating a definite integral of a polynomial using this theorem. Assume definite integrals as area and indefinite integrals are already understood.",
      },
      {
        id: "area",
        titleEn: "Area between curves",
        titleKo: "넓이",
        teachingInstruction:
          "Teach how to compute the area between a curve and the x-axis, and the area between two curves f(x) and g(x) on [a, b] using $\\int_a^b (f(x) - g(x))\\,dx$ where f(x) >= g(x), including handling a region where the curve dips below the x-axis (absolute value / splitting the integral). Use one worked example with two polynomial curves.",
      },
      {
        id: "motion-problems",
        titleEn: "Motion problems",
        titleKo: "운동 문제",
        teachingInstruction:
          "Teach how integration reverses the differentiation relationships from the velocity/acceleration lesson: given a(t), integrate to find v(t) (using an initial condition for C), and given v(t), integrate to find position s(t) or displacement/distance traveled over an interval (distinguishing displacement, the signed integral of v(t), from total distance, the integral of |v(t)|). Use one worked example with a polynomial acceleration or velocity function.",
      },
    ],
  },
];

export function findLesson(
  lessonId: string,
): { unit: Unit; lesson: Lesson } | null {
  for (const unit of CURRICULUM) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
}

export function allLessonIds(): string[] {
  return CURRICULUM.flatMap((unit) => unit.lessons.map((l) => l.id));
}

export function buildLessonSystemSuffix(lesson: Lesson): string {
  return `LESSON FOCUS
Teach ONLY the following topic for this session: "${lesson.titleEn} (${lesson.titleKo})".
${lesson.teachingInstruction}
Follow the LESSON FORMAT already defined above for the concept explanation.
Do not drift into other lessons' topics, even if the student asks a tangential
question — briefly answer and steer back to this lesson.

MASTERY QUIZ
Once the practice problems in the LESSON FORMAT are done and the student has
attempted them, give a 3-question mastery quiz covering only this lesson's
topic, one question at a time, waiting for the student's answer to each.
After the third answer, grade all three yourself and report the result in
plain language. Then end that final message with exactly one line, on its
own, in exactly this format (no extra words on that line):
QUIZ_RESULT: <correct>/3`;
}
