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
              <BookCover
                key={course.id}
                courseId={course.id}
                titleKo={course.titleKo}
                titleEn={course.titleEn}
                subtitle={course.subtitle}
                masteredCount={masteredCount}
                total={total}
                ctaHref={cta.href}
                ctaLabel={cta.label}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}
