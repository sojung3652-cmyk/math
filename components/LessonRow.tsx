"use client";

import { useEffect } from "react";
import ProgressRing from "@/components/ProgressRing";
import type { LessonStatus } from "@/lib/progress-store";
import { FLIP_FAST_MS, FLIP_SLOW_MS, useCardFlip } from "@/components/useCardFlip";

export default function LessonRow({
  href,
  status,
  lessonId,
  titleEn,
  titleKo,
  percent,
  score,
  // Set only on the one row matching an incoming ?gotoLesson= param — it
  // immediately turns itself (fast) and finishes the walkthrough instead
  // of waiting for a click.
  autoGotoHref,
}: {
  href: string;
  status: LessonStatus;
  lessonId: string;
  titleEn: string;
  titleKo: string;
  percent: number;
  score: number | null;
  autoGotoHref?: string;
}) {
  const { flipping, trigger } = useCardFlip();

  useEffect(() => {
    if (autoGotoHref) trigger(autoGotoHref, FLIP_FAST_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGotoHref]);

  return (
    <button
      type="button"
      className={`lesson-row ${status}${flipping ? " turning" : ""}${autoGotoHref ? " fast" : ""}`}
      onClick={() => trigger(href, FLIP_SLOW_MS)}
    >
      <ProgressRing lessonId={lessonId} percent={percent} status={status} />
      <span className="lesson-titles">
        <span className="lesson-title-en">{titleEn}</span>
        <span className="lesson-title-ko">{titleKo}</span>
      </span>
      {status === "mastered" && score != null && <span className="lesson-score">{score}%</span>}
    </button>
  );
}
