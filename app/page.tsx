import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ProgressRing from "@/components/ProgressRing";
import { CURRICULUM } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export default function CoursePage() {
  const progress = getAllProgress();

  return (
    <>
      <SiteHeader active="course" subtitle="수학 Ⅱ · 3 Units · 19 Lessons" />
      <main className="course-main">
        <div className="day-rule">— TABLE OF CONTENTS · 목차 —</div>

        {CURRICULUM.map((unit, unitIndex) => (
          <div className="unit-block" key={unit.id}>
            <Link href={`/unit/${unit.id}`} className="unit-heading unit-heading-link">
              <span className="unit-number">UNIT {unitIndex + 1}</span>
              <h2>{unit.titleEn}</h2>
              <span className="unit-title-ko">{unit.titleKo}</span>
            </Link>

            {unit.lessons.map((lesson) => {
              const record = progress[lesson.id];
              const status = record?.status ?? "not_started";
              return (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className={`lesson-row ${status}`}
                >
                  <ProgressRing lessonId={lesson.id} percent={record?.percent ?? 0} status={status} />
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
