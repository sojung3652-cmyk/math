import Link from "next/link";
import BookCover from "@/components/BookCover";
import { COURSES } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const progress = getAllProgress();

  return (
    <main className="course-select-main">
      <div className="notebook-title">
        <span className="eyebrow">Study Notebook</span>
        <h1 className="notebook-title-heading">내 수학 노트 · My Math Notebook</h1>
      </div>
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
      <Link href="/chat" className="free-chat-link">
        자유 질문 · Free questions
      </Link>
    </main>
  );
}
