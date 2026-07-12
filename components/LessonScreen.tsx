"use client";

import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeInlineFormatting } from "@/lib/tutor-markdown";
import Graph from "@/components/Graph";
import type { Lesson } from "@/lib/curriculum";
import type { LessonContent, Question } from "@/lib/lesson-content";
import type { GraphSpec } from "@/lib/graph-spec";

const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F"];

// `inline` swaps the markdown renderer's block-level <p> wrapper for a
// <span>, so short strings (choice text, an answer quoted mid-sentence) can
// render safely inside a <button> or another paragraph. `graphs` lets a
// {{graph:id}} placeholder in the text resolve to an actual <Graph>.
function Prose({
  children,
  inline = false,
  graphs,
}: {
  children: string;
  inline?: boolean;
  graphs?: GraphSpec[];
}) {
  const components: Record<string, unknown> = {};
  if (inline) components.p = "span";
  if (graphs) {
    components["lesson-graph"] = (props: { "data-graph-id"?: string }) => {
      const spec = graphs.find((g) => g.id === props["data-graph-id"]);
      if (!spec) {
        return (
          <p className="graph-unavailable">
            📉 그래프를 표시할 수 없어요 · Graph unavailable
          </p>
        );
      }
      return <Graph spec={spec} />;
    };
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeInlineFormatting]}
      components={components as Components}
    >
      {children}
    </ReactMarkdown>
  );
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").replace(/\$/g, "");
}

function QuestionInput({
  question,
  value,
  onChange,
  disabled,
  showResult = false,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showResult?: boolean;
}) {
  if (question.type === "multiple_choice") {
    return (
      <div className="choice-list">
        {(question.choices ?? []).map((choice, i) => {
          let stateClass = "";
          if (showResult) {
            if (normalize(choice) === normalize(question.correctAnswer)) {
              stateClass = "correct";
            } else if (value === choice) {
              stateClass = "incorrect";
            }
          } else if (value === choice) {
            stateClass = "selected";
          }
          return (
            <button
              key={choice}
              type="button"
              className={`choice-btn ${stateClass}`}
              onClick={() => onChange(choice)}
              disabled={disabled}
            >
              <span className="choice-marker">{CHOICE_LETTERS[i] ?? i + 1}</span>
              <Prose inline>{choice}</Prose>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <input
      type="text"
      className="numeric-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Type your answer"
    />
  );
}

function SolutionBox({ children, graphs }: { children: string; graphs?: GraphSpec[] }) {
  return (
    <div className="solution-box">
      <span className="label">풀이 · Solution</span>
      <Prose graphs={graphs}>{children}</Prose>
    </div>
  );
}

function PracticeItem({
  question,
  index,
  graphs,
}: {
  question: Question;
  index: number;
  graphs?: GraphSpec[];
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const isCorrect = checked && normalize(value) === normalize(question.correctAnswer);

  return (
    <div className="question-card">
      <span className="label">문제 {index + 1}</span>
      <div className="question-prompt">
        <Prose graphs={graphs}>{question.prompt}</Prose>
      </div>
      <QuestionInput
        question={question}
        value={value}
        onChange={setValue}
        disabled={checked}
        showResult={checked}
      />
      <div className="question-actions">
        <button
          type="button"
          className="btn-check"
          onClick={() => setChecked(true)}
          disabled={!value || checked}
        >
          Check answer
        </button>
        {checked && (
          <button
            type="button"
            className="btn-check btn-secondary"
            onClick={() => setShowSolution((s) => !s)}
          >
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
        )}
      </div>
      {checked && (
        <p className={isCorrect ? "feedback-correct" : "feedback-incorrect"}>
          {isCorrect ? (
            "✓ Correct — 정답이에요."
          ) : (
            <>
              ✗ Not quite — the correct answer is <Prose inline>{question.correctAnswer}</Prose>.
            </>
          )}
        </p>
      )}
      {showSolution && <SolutionBox graphs={graphs}>{question.solution}</SolutionBox>}
    </div>
  );
}

function QuizSection({
  lessonId,
  questions,
  graphs,
}: {
  lessonId: string;
  questions: Question[];
  graphs?: GraphSpec[];
}) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const allAnswered = answers.every((a) => a.trim().length > 0);
  const correctCount = questions.reduce(
    (acc, q, i) => acc + (normalize(answers[i]) === normalize(q.correctAnswer) ? 1 : 0),
    0,
  );
  const percentage = Math.round((correctCount / questions.length) * 100);
  const mastered = percentage >= 80;

  async function submit() {
    setSubmitted(true);
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          event: "quiz_result",
          correct: correctCount,
          total: questions.length,
        }),
      });
      if (!res.ok) throw new Error("Could not save your progress.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save your progress.");
    } finally {
      setSaving(false);
    }
  }

  function retake() {
    setAnswers(questions.map(() => ""));
    setSubmitted(false);
  }

  return (
    <div className="practice">
      <span className="label">MASTERY QUIZ · 단원 평가</span>

      {questions.map((q, i) => {
        const isCorrect = submitted && normalize(answers[i]) === normalize(q.correctAnswer);
        return (
          <div className="question-card" key={q.id}>
            <span className="label">문제 {i + 1}</span>
            <div className="question-prompt">
              <Prose graphs={graphs}>{q.prompt}</Prose>
            </div>
            <QuestionInput
              question={q}
              value={answers[i]}
              onChange={(v) =>
                setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)))
              }
              disabled={submitted}
              showResult={submitted}
            />
            {submitted && (
              <>
                <p className={isCorrect ? "feedback-correct" : "feedback-incorrect"}>
                  {isCorrect ? (
                    "✓ Correct"
                  ) : (
                    <>
                      ✗ Correct answer: <Prose inline>{q.correctAnswer}</Prose>
                    </>
                  )}
                </p>
                <SolutionBox graphs={graphs}>{q.solution}</SolutionBox>
              </>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button type="button" className="btn-check" onClick={submit} disabled={!allAnswered}>
          Submit quiz
        </button>
      ) : (
        <>
          <p className="quiz-summary">
            Score: {correctCount}/{questions.length} ({percentage}%) —{" "}
            {mastered
              ? "lesson mastered! 🎉"
              : "keep practicing — you can retake this quiz anytime."}
          </p>
          {saving && <p className="hint">Saving progress...</p>}
          {saveError && <p className="error-line">{saveError}</p>}
          <button type="button" className="btn-check btn-secondary" onClick={retake}>
            Retake quiz
          </button>
        </>
      )}
    </div>
  );
}

export default function LessonScreen({
  lesson,
  content,
}: {
  lesson: Lesson;
  content: LessonContent;
}) {
  return (
    <main className="lesson-main">
      <div className="day-rule">— {lesson.titleEn.toUpperCase()} —</div>

      <div className="msg-tutor">
        <h3>1 · Intuition</h3>
        <Prose graphs={content.graphs}>{content.intuition}</Prose>
        <h3>2 · Definition</h3>
        <Prose graphs={content.graphs}>{content.definition}</Prose>
      </div>

      <div className="example-box">
        <div className="example-header">
          📖 <b>예제 · Example</b>
        </div>
        <div className="example-body">
          <Prose graphs={content.graphs}>{content.workedExample}</Prose>
        </div>
      </div>

      <div className="teaching-note-card">
        <span className="teaching-note-label">선생님 노트 · Teaching note</span>
        <Prose graphs={content.graphs}>{content.teachingNote}</Prose>
      </div>

      <div className="note-card">
        <div className="note-tab">
          📌 <b>NOTE</b> · {lesson.titleEn}
        </div>
        <div className="note-body">
          <Prose graphs={content.graphs}>{content.note}</Prose>
        </div>
        <div className="note-actions">
          <button className="btn-save" disabled title="Saving notes is coming in a future update">
            Save note
          </button>
        </div>
      </div>

      <h2 className="section-heading">Practice · 연습문제</h2>
      {content.practice.map((q, i) => (
        <PracticeItem key={q.id} question={q} index={i} graphs={content.graphs} />
      ))}

      <h2 className="section-heading">Mastery quiz · 단원 평가</h2>
      <QuizSection lessonId={lesson.id} questions={content.quiz} graphs={content.graphs} />
    </main>
  );
}
