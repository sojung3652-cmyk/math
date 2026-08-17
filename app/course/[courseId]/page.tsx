import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import UnitSelectCard from "@/components/UnitSelectCard";
import LessonChatPanel from "@/components/LessonChatPanel";
import { findCourse } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";
import { getChatHistoryFlags } from "@/lib/chat-history";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ gotoUnit?: string; gotoLesson?: string }>;
}) {
  const { courseId } = await params;
  const { gotoUnit, gotoLesson } = await searchParams;
  const found = findCourse(courseId);
  if (!found) notFound();

  const { course } = found;
  const progress = getAllProgress();
  const chatFlags = getChatHistoryFlags();

  return (
    <>
      <SiteHeader
        active="course"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: course.titleKo }]}
      />
      <main className="course-main">
        <div className="day-rule">
          — {course.titleKo} · {course.titleEn.toUpperCase()} —
        </div>

        {course.units.map((unit, unitIndex) => {
          const masteredCount = unit.lessons.filter(
            (l) => progress[l.id]?.status === "mastered",
          ).length;
          const total = unit.lessons.length;
          const href = `/course/${course.id}/unit/${unit.id}`;
          const autoGotoHref =
            unit.id === gotoUnit
              ? `${href}${gotoLesson ? `?gotoLesson=${gotoLesson}` : ""}`
              : undefined;

          return (
            <UnitSelectCard
              key={unit.id}
              href={href}
              unitIndex={unitIndex}
              titleEn={unit.titleEn}
              titleKo={unit.titleKo}
              overview={unit.overview}
              masteredCount={masteredCount}
              total={total}
              autoGotoHref={autoGotoHref}
              rings={unit.lessons.map((lesson) => {
                const record = progress[lesson.id];
                return {
                  lessonId: lesson.id,
                  titleEn: lesson.titleEn,
                  percent: record?.percent ?? 0,
                  status: record?.status ?? "not_started",
                  hasChat: chatFlags[lesson.id] ?? false,
                };
              })}
            />
          );
        })}
      </main>
      <LessonChatPanel />
    </>
  );
}
