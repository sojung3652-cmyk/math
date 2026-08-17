import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ProgressRing from "@/components/ProgressRing";
import Prose from "@/components/Prose";
import { findUnit } from "@/lib/curriculum";
import { getAllProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ courseId: string; unitId: string }>;
}) {
  const { courseId, unitId } = await params;
  const found = findUnit(courseId, unitId);
  if (!found) notFound();

  const { course, unit, index } = found;
  const progress = getAllProgress();
  const lessons = unit.lessons.map((lesson) => ({
    lesson,
    record: progress[lesson.id],
  }));
  const masteredCount = lessons.filter((l) => l.record?.status === "mastered").length;
  const total = unit.lessons.length;

  const target = lessons.find((l) => (l.record?.status ?? "not_started") !== "mastered");
  const cta = target
    ? {
        href: `/lesson/${target.lesson.id}`,
        label:
          target.record?.status === "in_progress"
            ? "Continue · 이어서 공부하기"
            : "Start studying · 공부 시작",
      }
    : {
        href: `/lesson/${unit.lessons[0].id}`,
        label: "Review · 복습하기",
      };

  return (
    <>
      <SiteHeader
        active="course"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: course.titleKo, href: `/course/${course.id}` },
          { label: `UNIT ${index + 1} · ${unit.titleKo}` },
        ]}
      />
      <main className="unit-main">
        <div className="unit-cover">
          <span className="unit-cover-number">UNIT {index + 1}</span>
          <h1 className="unit-cover-title">
            {unit.titleEn}
            <span className="unit-cover-title-ko">{unit.titleKo}</span>
          </h1>
          <div className="unit-cover-overview">
            <Prose>{unit.overview}</Prose>
          </div>
          <div className="unit-cta-row">
            <Link href={cta.href} className="btn-unit-cta">
              {cta.label}
            </Link>
          </div>
          <div className="unit-progress-summary">
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
        </div>

        <span className="unit-lesson-list-label">LESSONS · 강의 목록</span>
        <div className="unit-lesson-list">
          {lessons.map(({ lesson, record }) => {
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
      </main>
    </>
  );
}
