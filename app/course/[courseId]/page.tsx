import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ProgressRing from "@/components/ProgressRing";
import Prose from "@/components/Prose";
import { findCourse } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const found = findCourse(courseId);
  if (!found) notFound();

  const { course } = found;
  const progress = getAllProgress();

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

          return (
            <Link
              key={unit.id}
              href={`/course/${course.id}/unit/${unit.id}`}
              className="unit-select-card"
            >
              <div className="unit-select-heading">
                <span className="unit-select-number">UNIT {unitIndex + 1}</span>
                <div className="unit-select-titles">
                  <span className="unit-select-title-en">{unit.titleEn}</span>
                  <span className="unit-select-title-ko">{unit.titleKo}</span>
                </div>
              </div>
              <div className="unit-select-overview">
                <Prose>{unit.overview}</Prose>
              </div>
              <div className="unit-select-progress">
                <span className="unit-select-progress-text">
                  {masteredCount} of {total} mastered · {masteredCount}/{total} 완료
                </span>
                <div className="unit-progress-bar">
                  <div
                    className="unit-progress-fill"
                    style={{ width: `${total > 0 ? (masteredCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="unit-select-rings">
                {unit.lessons.map((lesson) => {
                  const record = progress[lesson.id];
                  const status = record?.status ?? "not_started";
                  return (
                    <span key={lesson.id} title={lesson.titleEn}>
                      <ProgressRing
                        lessonId={lesson.id}
                        percent={record?.percent ?? 0}
                        status={status}
                      />
                    </span>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </main>
    </>
  );
}
