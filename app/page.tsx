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
            const lessons = course.units.flatMap((unit) => unit.lessons);
            const total = lessons.length;
            const masteredCount = lessons.filter(
              (l) => progress[l.id]?.status === "mastered",
            ).length;

            return (
              <BookCover
                key={course.id}
                courseId={course.id}
                titleKo={course.titleKo}
                titleEn={course.titleEn}
                subtitle={course.subtitle}
                masteredCount={masteredCount}
                total={total}
                themeIndex={courseIndex}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}
