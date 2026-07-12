import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { CURRICULUM } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

const STATUS_ICON: Record<string, string> = {
  mastered: "✓",
  in_progress: "…",
  not_started: "",
};

export default function CoursePage() {
  const progress = getAllProgress();

  return (
    <>
      <SiteHeader active="course" subtitle="수학 Ⅱ · 3 Units · 19 Lessons" />
      <main className="course-main">
        <div className="day-rule">— TABLE OF CONTENTS · 목차 —</div>

        {CURRICULUM.map((unit, unitIndex) => (
          <div className="unit-block" key={unit.id}>
            <div className="unit-heading">
              <span className="unit-number">UNIT {unitIndex + 1}</span>
              <h2>{unit.titleEn}</h2>
              <span className="unit-title-ko">{unit.titleKo}</span>
            </div>

            {unit.lessons.map((lesson) => {
              const record = progress[lesson.id];
              const status = record?.status ?? "not_started";
              return (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className={`lesson-row ${status}`}
                >
                  <span className={`lesson-status ${status}`}>
                    {STATUS_ICON[status]}
                  </span>
                  <span className="lesson-titles">
                    <span className="lesson-title-en">{lesson.titleEn}</span>
                    <span className="lesson-title-ko">{lesson.titleKo}</span>
                  </span>
                  {status === "mastered" && record?.score != null && (
                    <span className="lesson-score">{record.score}%</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </main>
    </>
  );
}
