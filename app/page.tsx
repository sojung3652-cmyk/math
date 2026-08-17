import SiteHeader from "@/components/SiteHeader";
import BookCover from "@/components/BookCover";
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
        <div className="bookshelf">
          {COURSES.map((course, courseIndex) => {
            const entries = course.units.flatMap((unit) =>
              unit.lessons.map((lesson) => ({ unit, lesson })),
            );
            const total = entries.length;
            const masteredCount = entries.filter(
              (e) => progress[e.lesson.id]?.status === "mastered",
            ).length;
            const started = entries.some(
              (e) => (progress[e.lesson.id]?.status ?? "not_started") !== "not_started",
            );

            const inProgress = entries.find((e) => progress[e.lesson.id]?.status === "in_progress");
            const nextUnstarted = entries.find(
              (e) => (progress[e.lesson.id]?.status ?? "not_started") === "not_started",
            );
            const target = inProgress ?? nextUnstarted ?? entries[0];
            const ctaLabel = started ? "Continue · 이어서" : "Start · 시작하기";

            return (
              <BookCover
                key={course.id}
                courseId={course.id}
                titleKo={course.titleKo}
                titleEn={course.titleEn}
                subtitle={course.subtitle}
                masteredCount={masteredCount}
                total={total}
                ctaLabel={ctaLabel}
                ctaUnitId={target.unit.id}
                ctaLessonId={target.lesson.id}
                themeIndex={courseIndex}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}
