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
  // 2-3 sentences for the unit's chapter-cover page. Written with inline
  // "word (한글)" bilingual terms so it renders through the same Prose
  // pipeline as lesson content (bold English term, muted Korean gloss).
  overview: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  titleEn: string;
  titleKo: string;
  // Short scope line for the course-select card, e.g. "지수·로그함수, 삼각함수, 수열".
  subtitle: string;
  units: Unit[];
};

export const COURSES: Course[] = [
  {
    id: "math1",
    titleEn: "Math 1",
    titleKo: "수학Ⅰ",
    subtitle: "지수·로그함수, 삼각함수, 수열",
    units: [
      {
        id: "exponential-logarithmic-functions",
        titleEn: "Exponential and Logarithmic Functions",
        titleKo: "지수함수와 로그함수",
        overview:
          "In this unit you will extend exponents to rational values and meet two new function families: the exponential function (지수함수), which grows or decays at a constant relative rate, and its inverse, the logarithmic function (로그함수) — the tool for solving for an unknown exponent. You'll learn the algebraic rules that govern both, then use them to solve exponential and logarithmic equations and inequalities (부등식).",
        lessons: [
          {
            id: "exponents-rational",
            titleEn: "Rational exponents",
            titleKo: "거듭제곱근과 지수의 확장",
            teachingInstruction:
              "Teach nth roots and how exponents extend from integers to rational numbers (a^(m/n) = (n-th root of a)^m), plus the exponent rules (product, power, quotient) applied to rational exponents. Include one example simplifying a radical expression using rational exponent notation. Do not yet introduce the exponential function as a function of x — that is the next lesson.",
          },
          {
            id: "exponential-functions",
            titleEn: "Exponential functions",
            titleKo: "지수함수",
            teachingInstruction:
              "Teach the exponential function f(x) = a^x for a > 0, a != 1: its domain, range, y-intercept, horizontal asymptote y = 0, and why it's increasing for a > 1 and decreasing for 0 < a < 1. Include one worked example comparing/graphing two exponential functions with different bases. Assume rational exponents are already understood; do not yet introduce logarithms.",
          },
          {
            id: "logarithms",
            titleEn: "Logarithms",
            titleKo: "로그의 정의와 성질",
            teachingInstruction:
              "Teach the logarithm log_a(x) as the inverse question 'a to what power gives x', its definition and domain (x > 0), and the logarithm laws: log_a(xy) = log_a(x) + log_a(y), log_a(x/y) = log_a(x) - log_a(y), log_a(x^k) = k*log_a(x), and the change-of-base formula. Include one worked example simplifying a logarithmic expression using these laws. Assume exponential functions are already understood.",
          },
          {
            id: "logarithmic-functions",
            titleEn: "Logarithmic functions",
            titleKo: "로그함수",
            teachingInstruction:
              "Teach the logarithmic function f(x) = log_a(x) as the inverse of the exponential function: its graph as a reflection of y = a^x across the line y = x, its domain (x > 0), range (all reals), and vertical asymptote x = 0. Include one worked example graphing a logarithmic function and identifying its key features. Assume logarithm laws are already known.",
          },
          {
            id: "exponential-logarithmic-equations",
            titleEn: "Exponential and logarithmic equations",
            titleKo: "지수방정식과 로그방정식",
            teachingInstruction:
              "Teach how to solve exponential equations by matching bases or taking a logarithm of both sides, and logarithmic equations by rewriting in exponential form or combining log terms — always checking that solutions satisfy the original domain (log arguments must be positive). Include one worked example of each type. Assume exponential and logarithmic functions are already understood.",
          },
          {
            id: "exponential-logarithmic-inequalities",
            titleEn: "Exponential and logarithmic inequalities",
            titleKo: "지수부등식과 로그부등식",
            teachingInstruction:
              "Teach how to solve exponential and logarithmic inequalities using the monotonicity of the underlying function: for base a > 1 the inequality direction is preserved, for 0 < a < 1 it flips, and for logarithmic inequalities the domain (positive argument) must be checked. Include one worked example of each type. Assume solving the corresponding equations is already understood.",
          },
        ],
      },
      {
        id: "trigonometric-functions",
        titleEn: "Trigonometric Functions",
        titleKo: "삼각함수",
        overview:
          "In this unit you will generalize angle measure beyond 0°–360° using radians (호도법), then define the trigonometric functions (삼각함수) — sine, cosine, and tangent — for any angle using the unit circle. You'll graph these functions and learn the identities (항등식) that let you simplify and solve trigonometric equations, finishing with the law of sines and law of cosines (코사인법칙) for solving general triangles.",
        lessons: [
          {
            id: "general-angles-radians",
            titleEn: "General angles and radian measure",
            titleKo: "일반각과 호도법",
            teachingInstruction:
              "Teach the idea of a general angle (allowing rotation beyond 360 degrees and negative/clockwise rotation), radian measure and its conversion to/from degrees, and the arc length (l = r*theta) and sector area (S = (1/2)r^2*theta) formulas. Include one worked example computing arc length or sector area. Do not yet introduce the trigonometric function definitions — that is the next lesson.",
          },
          {
            id: "trig-function-definitions",
            titleEn: "Definition of the trigonometric functions",
            titleKo: "삼각함수의 정의",
            teachingInstruction:
              "Teach sin(theta), cos(theta), and tan(theta) defined via the coordinates of a point on the unit circle for a general angle theta, and how their signs depend on the quadrant. Include one worked example evaluating all three functions for an angle outside the first quadrant. Assume radian measure is already understood.",
          },
          {
            id: "trig-graphs",
            titleEn: "Graphs of trigonometric functions",
            titleKo: "삼각함수의 그래프",
            teachingInstruction:
              "Teach the graphs of y = sin(x), y = cos(x), and y = tan(x): period, amplitude, and asymptotes (for tangent), then how y = a*sin(bx + c) + d transforms amplitude, period, phase shift, and vertical shift. Include one worked example graphing a transformed sine or cosine function. Assume the unit-circle definitions are already known.",
          },
          {
            id: "trig-identities",
            titleEn: "Trigonometric identities",
            titleKo: "삼각함수의 성질과 삼각항등식",
            teachingInstruction:
              "Teach the Pythagorean identity sin^2(theta) + cos^2(theta) = 1 and the reduction/co-function identities for -theta, 90-theta, 180-theta, and 180+theta, and how to use them to simplify trigonometric expressions. Include one worked example simplifying an expression using two or more identities. Assume the graphs and definitions are already understood.",
          },
          {
            id: "law-of-sines-cosines",
            titleEn: "Law of sines and law of cosines",
            titleKo: "사인법칙과 코사인법칙",
            teachingInstruction:
              "Teach the law of sines (a/sin A = b/sin B = c/sin C = 2R) and the law of cosines (c^2 = a^2 + b^2 - 2ab*cos C), when to use each for solving a general triangle, and the triangle area formula (1/2)*a*b*sin C. Include one worked example applying each law. Assume basic trigonometric function values are already known.",
          },
          {
            id: "trig-equations",
            titleEn: "Trigonometric equations",
            titleKo: "삼각방정식",
            teachingInstruction:
              "Teach how to solve basic trigonometric equations (e.g. sin(x) = k) over a given interval using the unit circle and periodicity, and how to express the general solution using the period. Include one worked example solved over a restricted interval like [0, 2*pi). Assume trigonometric graphs and identities are already understood.",
          },
        ],
      },
      {
        id: "sequences",
        titleEn: "Sequences",
        titleKo: "수열",
        overview:
          "In this unit you will study sequences (수열) — ordered lists of numbers defined by a rule — starting with arithmetic sequences (등차수열), where each term adds a constant difference, and geometric sequences (등비수열), where each term multiplies by a constant ratio. You'll learn to sum both kinds efficiently, extend to sigma notation (시그마) for general sums, and finish with mathematical induction (수학적 귀납법), the technique for proving a statement holds for every natural number.",
        lessons: [
          {
            id: "sequences-intro",
            titleEn: "Introduction to sequences",
            titleKo: "수열의 뜻",
            teachingInstruction:
              "Teach a sequence as an ordered list of numbers a_1, a_2, a_3, ... indexed by natural numbers, the general term a_n, and the difference between an explicit formula for a_n and a recursive definition. Include one worked example finding terms from each type of definition. Do not yet introduce arithmetic or geometric sequences specifically — those are the next lessons.",
          },
          {
            id: "arithmetic-sequences",
            titleEn: "Arithmetic sequences",
            titleKo: "등차수열",
            teachingInstruction:
              "Teach the arithmetic sequence: a constant common difference d between consecutive terms, the explicit formula a_n = a_1 + (n-1)d, and the arithmetic mean of two numbers. Include one worked example finding a specific term or the common difference from given information. Assume the general idea of a sequence is already understood.",
          },
          {
            id: "arithmetic-series",
            titleEn: "Arithmetic series",
            titleKo: "등차수열의 합",
            teachingInstruction:
              "Teach the sum of an arithmetic sequence, S_n = n(a_1 + a_n)/2 (and the equivalent form using a_1 and d), deriving it briefly via the Gauss pairing trick. Include one worked example computing the sum of a given number of terms. Assume arithmetic sequences are already understood.",
          },
          {
            id: "geometric-sequences",
            titleEn: "Geometric sequences",
            titleKo: "등비수열",
            teachingInstruction:
              "Teach the geometric sequence: a constant common ratio r between consecutive terms, the explicit formula a_n = a_1 * r^(n-1), and the geometric mean of two numbers. Include one worked example finding a specific term or the common ratio from given information. Assume arithmetic sequences (for contrast) are already understood.",
          },
          {
            id: "geometric-series",
            titleEn: "Geometric series",
            titleKo: "등비수열의 합",
            teachingInstruction:
              "Teach the sum of a geometric sequence, S_n = a_1(r^n - 1)/(r - 1) for r != 1 (and S_n = n*a_1 for r = 1), and briefly mention that an infinite geometric series converges only when |r| < 1, with sum a_1/(1-r). Include one worked example computing a finite geometric sum. Assume geometric sequences are already understood.",
          },
          {
            id: "sigma-notation",
            titleEn: "Sigma notation and series",
            titleKo: "합의 기호(시그마)와 여러 가지 수열의 합",
            teachingInstruction:
              "Teach sigma notation for sums, its linearity properties (sum of a constant multiple, sum of a sum), and the standard formulas for the sum of the first n natural numbers, sum of squares, and sum of cubes. Include one worked example combining sigma notation with an arithmetic or geometric series. Assume arithmetic and geometric series are already understood.",
          },
          {
            id: "mathematical-induction",
            titleEn: "Mathematical induction",
            titleKo: "수학적 귀납법",
            teachingInstruction:
              "Teach the principle of mathematical induction: prove a statement for the base case n = 1, then assume it holds for n = k and prove it for n = k + 1. Work one full example proving a sum formula (e.g. the sum of the first n natural numbers) by induction. Assume sigma notation and series formulas are already understood.",
          },
        ],
      },
    ],
  },
  {
    id: "math2",
    titleEn: "Math 2",
    titleKo: "수학Ⅱ",
    subtitle: "극한과 연속, 미분, 적분",
    units: [
      {
        id: "limits-continuity",
        titleEn: "Limits and Continuity",
        titleKo: "함수의 극한과 연속",
        overview:
          "In this unit you will build the foundation for all of calculus: what it means for a function to approach a limit (극한) as x approaches a point, from one side or both. You'll learn the algebraic limit laws, what continuity (연속) really requires, and the Intermediate Value Theorem — the guarantee that a continuous function can't skip over a value on its way from f(a) to f(b). These ideas are the bedrock every later unit leans on.",
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
        overview:
          "In this unit you will learn how the derivative (도함수) captures instantaneous rate of change — the slope of a curve at a single point, built up from the limit of a difference quotient. You'll master the differentiation rules that make finding derivatives fast, use them to find tangent lines (접선), and read a function's shape directly from the sign of its derivative to locate every local extremum (극값). By the end, you'll connect derivatives to real motion through velocity and acceleration.",
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
        overview:
          "In this unit you will learn integration (적분) as the reverse of differentiation: finding an antiderivative (부정적분) that undoes a derivative, then extending that idea to the definite integral (정적분), which measures signed area under a curve. The Fundamental Theorem of Calculus is the bridge that ties these two ideas together, letting you compute area exactly instead of estimating it. You'll finish by using integration to solve area-between-curves and motion problems, reversing the velocity/acceleration relationships from the previous unit.",
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
    ],
  },
];

// Flattened view of every unit across every course. Predates the
// multi-course structure — scripts/add-depth-to-lessons.ts,
// scripts/add-graphs-to-lessons.ts, scripts/generate-lesson-content.ts, and
// scripts/add-explanations-to-lessons.ts all just need "every unit"
// regardless of which course it belongs to, so this keeps them working
// unchanged.
export const CURRICULUM: Unit[] = COURSES.flatMap((course) => course.units);

export function findCourse(courseId: string): { course: Course; index: number } | null {
  const index = COURSES.findIndex((c) => c.id === courseId);
  if (index === -1) return null;
  return { course: COURSES[index], index };
}

export function findLesson(
  lessonId: string,
): { course: Course; unit: Unit; lesson: Lesson } | null {
  for (const course of COURSES) {
    for (const unit of course.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) return { course, unit, lesson };
    }
  }
  return null;
}

export function findUnit(
  courseId: string,
  unitId: string,
): { course: Course; unit: Unit; index: number } | null {
  const found = findCourse(courseId);
  if (!found) return null;
  const index = found.course.units.findIndex((u) => u.id === unitId);
  if (index === -1) return null;
  return { course: found.course, unit: found.course.units[index], index };
}

export function allLessonIds(): string[] {
  return COURSES.flatMap((course) =>
    course.units.flatMap((unit) => unit.lessons.map((l) => l.id)),
  );
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
