"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Prose from "@/components/Prose";
import ResetLessonButton from "@/components/ResetLessonButton";
import LessonNav, { type NavSection } from "@/components/LessonNav";
import LessonChatPanel from "@/components/LessonChatPanel";
import type { Lesson } from "@/lib/curriculum";
import type { AdvancedSection as AdvancedSectionData, LessonContent, Question } from "@/lib/lesson-content";
import type { GraphSpec } from "@/lib/graph-spec";
import type { Milestone } from "@/lib/progress-store";

const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F"];

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
  labelPrefix = "문제",
  onComplete,
}: {
  question: Question;
  index: number;
  graphs?: GraphSpec[];
  labelPrefix?: string;
  onComplete?: () => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const isCorrect = checked && normalize(value) === normalize(question.correctAnswer);

  return (
    <div className="question-card">
      <span className="label">
        {labelPrefix} {index + 1}
      </span>
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
          onClick={() => {
            setChecked(true);
            onComplete?.();
          }}
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
  onSubmitted,
}: {
  lessonId: string;
  questions: Question[];
  graphs?: GraphSpec[];
  onSubmitted?: (percent: number) => void;
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
      const data = await res.json();
      if (typeof data?.record?.percent === "number") {
        onSubmitted?.(data.record.percent);
      }
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

function GoingDeeperSection({
  id,
  content,
  graphs,
}: {
  id?: string;
  content: string;
  graphs?: GraphSpec[];
}) {
  return (
    <div id={id} className="going-deeper-section">
      <div className="going-deeper-header">
        🔍 <b>더 알아보기 · Going deeper</b>
      </div>
      <div className="going-deeper-body">
        <Prose graphs={graphs}>{content}</Prose>
      </div>
    </div>
  );
}

function AdvancedSection({
  id,
  advanced,
  graphs,
  onComplete,
}: {
  id?: string;
  advanced: AdvancedSectionData;
  graphs?: GraphSpec[];
  onComplete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const completedRef = useRef(0);
  const firedRef = useRef(false);

  function handleItemComplete() {
    completedRef.current += 1;
    if (!firedRef.current && completedRef.current >= advanced.practice.length) {
      firedRef.current = true;
      onComplete?.();
    }
  }

  return (
    <div id={id} className="advanced-section">
      <button
        type="button"
        className="advanced-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <b>심화 · Advanced</b>
        <span className="advanced-sub">CHALLENGE</span>
        <span className="advanced-chevron">▶</span>
      </button>
      {open && (
        <div className="advanced-body">
          <Prose graphs={graphs}>{advanced.content}</Prose>
          {advanced.practice.map((q, i) => (
            <PracticeItem
              key={q.id}
              question={q}
              index={i}
              graphs={graphs}
              labelPrefix="심화 문제"
              onComplete={handleItemComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LessonScreen({
  lesson,
  content,
  initialPercent,
}: {
  lesson: Lesson;
  content: LessonContent;
  initialPercent: number;
}) {
  const teachingEndRef = useRef<HTMLDivElement>(null);
  const teachingFiredRef = useRef(false);
  const practiceCompletedRef = useRef(0);
  const practiceFiredRef = useRef(false);
  const [percent, setPercent] = useState(initialPercent);
  const [chatOpen, setChatOpen] = useState(false);

  function postMilestone(milestone: Milestone) {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, event: "milestone", milestone }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.record?.percent === "number") {
          setPercent((p) => Math.max(p, data.record.percent));
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    const el = teachingEndRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !teachingFiredRef.current) {
          teachingFiredRef.current = true;
          postMilestone("teaching_read");
          observer.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  function handlePracticeComplete() {
    practiceCompletedRef.current += 1;
    if (!practiceFiredRef.current && practiceCompletedRef.current >= content.practice.length) {
      practiceFiredRef.current = true;
      postMilestone("practice_complete");
    }
  }

  const sections = useMemo<NavSection[]>(() => {
    const list: NavSection[] = [
      { id: "section-intuition", label: "1 · Intuition", threshold: 25 },
      { id: "section-definition", label: "2 · Definition", threshold: 25 },
      { id: "section-example", label: "3 · Worked example", threshold: 25 },
      { id: "section-practice", label: "Practice · 연습문제", threshold: 50 },
    ];
    if (content.goingDeeper) {
      list.push({ id: "section-going-deeper", label: "더 알아보기", threshold: null });
    }
    if (content.advanced) {
      list.push({ id: "section-advanced", label: "심화", threshold: 75 });
    }
    list.push({ id: "section-quiz", label: "Mastery Quiz", threshold: 100 });
    return list;
  }, [content.goingDeeper, content.advanced]);

  return (
    <>
      <LessonNav sections={sections} percent={percent} hidden={chatOpen} />
      <LessonChatPanel lesson={lesson} onOpenChange={setChatOpen} />
      <main className="lesson-main">
        <div className="lesson-top-bar">
          <ResetLessonButton lessonId={lesson.id} />
        </div>
        <div className="day-rule">— {lesson.titleEn.toUpperCase()} —</div>

        <div className="msg-tutor">
          <h3 id="section-intuition">
            <span className="section-num">1 ·</span> Intuition
          </h3>
          <Prose graphs={content.graphs}>{content.intuition}</Prose>
          <h3 id="section-definition">
            <span className="section-num">2 ·</span> Definition
          </h3>
          <Prose graphs={content.graphs}>{content.definition}</Prose>
        </div>

        <div id="section-example" className="example-box">
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

        {/* Marks the end of the teaching section — reaching it is the 25% milestone. */}
        <div ref={teachingEndRef} />

        <h2 id="section-practice" className="section-heading">
          Practice · 연습문제
        </h2>
        {content.practice.map((q, i) => (
          <PracticeItem
            key={q.id}
            question={q}
            index={i}
            graphs={content.graphs}
            onComplete={handlePracticeComplete}
          />
        ))}

        {content.goingDeeper && (
          <GoingDeeperSection
            id="section-going-deeper"
            content={content.goingDeeper}
            graphs={content.graphs}
          />
        )}

        {content.advanced && (
          <AdvancedSection
            id="section-advanced"
            advanced={content.advanced}
            graphs={content.graphs}
            onComplete={() => postMilestone("advanced_complete")}
          />
        )}

        <h2 id="section-quiz" className="section-heading">
          Mastery quiz · 단원 평가
        </h2>
        <QuizSection
          lessonId={lesson.id}
          questions={content.quiz}
          graphs={content.graphs}
          onSubmitted={(p) => setPercent((cur) => Math.max(cur, p))}
        />
      </main>
    </>
  );
}
