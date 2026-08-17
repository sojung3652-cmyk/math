"use client";

import { useState } from "react";
import { FLIP_FAST_MS, FLIP_SLOW_MS, useCardFlip } from "@/components/useCardFlip";

// Two clearly distinct cover palettes so the books read apart on the shelf
// at a glance — light blue for 수학Ⅰ, soft green for 수학Ⅱ. Both use dark
// ink text (the covers are light, unlike the earlier dark-cover version).
const THEMES = [
  { bg: "#b8d4e8", bg2: "#9cc0da", spine: "#7fa9c7" },
  { bg: "#cfe6d3", bg2: "#addfb6", spine: "#7fae8c" },
] as const;

export default function BookCover({
  courseId,
  titleKo,
  titleEn,
  subtitle,
  masteredCount,
  total,
  ctaLabel,
  ctaUnitId,
  ctaLessonId,
  themeIndex,
}: {
  courseId: string;
  titleKo: string;
  titleEn: string;
  subtitle: string;
  masteredCount: number;
  total: number;
  ctaLabel: string;
  ctaUnitId: string;
  ctaLessonId: string;
  themeIndex: number;
}) {
  const { flipping, trigger } = useCardFlip();
  const [fast, setFast] = useState(false);
  const theme = THEMES[themeIndex % THEMES.length];
  const href = `/course/${courseId}`;
  const ctaGotoHref = `/course/${courseId}?gotoUnit=${ctaUnitId}&gotoLesson=${ctaLessonId}`;
  const percent = total > 0 ? (masteredCount / total) * 100 : 0;

  function openCover() {
    setFast(false);
    trigger(href, FLIP_SLOW_MS);
  }

  function openCoverFast() {
    setFast(true);
    trigger(ctaGotoHref, FLIP_FAST_MS);
  }

  return (
    <div
      className={`book${flipping ? " opening" : ""}${flipping && fast ? " fast" : ""}`}
      style={
        {
          "--book-bg": theme.bg,
          "--book-bg2": theme.bg2,
          "--book-spine": theme.spine,
        } as React.CSSProperties
      }
    >
      <div className="book-spine" />
      <div className="book-page" />
      <button
        type="button"
        className="book-cover"
        onClick={openCover}
        aria-label={`Open ${titleKo} · ${titleEn}`}
      >
        <span className="book-cover-eyebrow">STUDY NOTEBOOK</span>
        <h2 className="book-cover-title">{titleKo}</h2>
        <span className="book-cover-title-en">· {titleEn}</span>
        <p className="book-cover-subtitle">{subtitle}</p>
        <div className="book-cover-progress">
          <span className="book-cover-progress-text">
            {masteredCount} of {total} lessons mastered
          </span>
          <div className="unit-progress-bar book-cover-progress-bar">
            <div className="unit-progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </button>
      <button type="button" className="btn-unit-cta book-cta" onClick={openCoverFast}>
        {ctaLabel}
      </button>
    </div>
  );
}
