import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { COURSES } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const progress = getAllProgress();

  return (
    <>
      <SiteHeader active="course" />
      <main className="course-select-main">
        <div className="day-rule">— 내 수학 노트 · MY MATH NOTEBOOK —</div>
        <div className="course-select-grid">
          {COURSES.map((course) => {
            const lessons = course.units.flatMap((unit) => unit.lessons);
            const total = lessons.length;
            const masteredCount = lessons.filter(
              (l) => progress[l.id]?.status === "mastered",
            ).length;
            const started = lessons.some(
              (l) => (progress[l.id]?.status ?? "not_started") !== "not_started",
            );

            const inProgress = lessons.find((l) => progress[l.id]?.status === "in_progress");
            const nextUnstarted = lessons.find(
              (l) => (progress[l.id]?.status ?? "not_started") === "not_started",
            );
            const targetLesson = inProgress ?? nextUnstarted ?? lessons[0];

            const cta = started
              ? { href: `/lesson/${targetLesson.id}`, label: "Continue · 이어서" }
              : { href: `/lesson/${lessons[0].id}`, label: "Start · 시작하기" };

            return (
              <div className="course-card" key={course.id}>
                <Link href={`/course/${course.id}`} className="course-card-link">
                  <h2 className="course-card-title">
                    {course.titleKo} <span className="course-card-title-en">· {course.titleEn}</span>
                  </h2>
                  <p className="course-card-subtitle">{course.subtitle}</p>
                </Link>
                <div className="unit-progress-summary course-card-progress">
                  <span className="unit-progress-text">
                    {masteredCount} of {total} lessons mastered · {masteredCount}/{total} 완료
                  </span>
                  <div className="unit-progress-bar">
                    <div
                      className="unit-progress-fill"
                      style={{ width: `${total > 0 ? (masteredCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <Link href={cta.href} className="btn-unit-cta course-card-cta">
                  {cta.label}
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
