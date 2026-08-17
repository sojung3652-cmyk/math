"use client";

import { useEffect } from "react";
import ProgressRing from "@/components/ProgressRing";
import Prose from "@/components/Prose";
import type { LessonStatus } from "@/lib/progress-store";
import { FLIP_FAST_MS, FLIP_SLOW_MS, useCardFlip } from "@/components/useCardFlip";

type RingData = {
  lessonId: string;
  titleEn: string;
  percent: number;
  status: LessonStatus;
};

export default function UnitSelectCard({
  href,
  unitIndex,
  titleEn,
  titleKo,
  overview,
  masteredCount,
  total,
  rings,
  // Set only on the one card matching an incoming ?gotoUnit= param — it
  // immediately turns itself (fast) and continues the walkthrough instead
  // of waiting for a click.
  autoGotoHref,
}: {
  href: string;
  unitIndex: number;
  titleEn: string;
  titleKo: string;
  overview: string;
  masteredCount: number;
  total: number;
  rings: RingData[];
  autoGotoHref?: string;
}) {
  const { flipping, trigger } = useCardFlip();

  useEffect(() => {
    if (autoGotoHref) trigger(autoGotoHref, FLIP_FAST_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGotoHref]);

  const percent = total > 0 ? (masteredCount / total) * 100 : 0;

  return (
    <button
      type="button"
      className={`unit-select-card${flipping ? " turning" : ""}${autoGotoHref ? " fast" : ""}`}
      onClick={() => trigger(href, FLIP_SLOW_MS)}
    >
      <div className="unit-select-heading">
        <span className="unit-select-number">UNIT {unitIndex + 1}</span>
        <div className="unit-select-titles">
          <span className="unit-select-title-en">{titleEn}</span>
          <span className="unit-select-title-ko">{titleKo}</span>
        </div>
      </div>
      <div className="unit-select-overview">
        <Prose>{overview}</Prose>
      </div>
      <div className="unit-select-progress">
        <span className="unit-select-progress-text">
          {masteredCount} of {total} mastered · {masteredCount}/{total} 완료
        </span>
        <div className="unit-progress-bar">
          <div className="unit-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="unit-select-rings">
        {rings.map((r) => (
          <span key={r.lessonId} title={r.titleEn}>
            <ProgressRing lessonId={r.lessonId} percent={r.percent} status={r.status} />
          </span>
        ))}
      </div>
    </button>
  );
}
