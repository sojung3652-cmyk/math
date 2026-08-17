import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import LessonScreen from "@/components/LessonScreen";
import { findLesson } from "@/lib/curriculum";
import { loadLessonContent } from "@/lib/lesson-content";
import { getProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const found = findLesson(lessonId);
  if (!found) notFound();

  const { course, unit, lesson } = found;
  const unitIndex = course.units.findIndex((u) => u.id === unit.id);
  const content = loadLessonContent(lessonId);

  return (
    <>
      <SiteHeader
        active="course"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: course.titleKo, href: `/course/${course.id}` },
          { label: `UNIT ${unitIndex + 1} · ${unit.titleKo}`, href: `/course/${course.id}/unit/${unit.id}` },
          { label: lesson.titleKo },
        ]}
      />
      {content ? (
        <LessonScreen
          lesson={lesson}
          content={content}
          initialPercent={getProgress(lessonId).percent}
        />
      ) : (
        <main className="lesson-main">
          <div className="day-rule">— {lesson.titleEn.toUpperCase()} —</div>
          <p className="hint" style={{ marginTop: 24 }}>
            This lesson hasn&apos;t been generated yet. Run{" "}
            <code>npm run generate:content -- --lesson={lessonId}</code> to create it.
          </p>
        </main>
      )}
    </>
  );
}
