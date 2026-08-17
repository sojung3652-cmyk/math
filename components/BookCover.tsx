"use client";

import { FLIP_SLOW_MS, useCardFlip } from "@/components/useCardFlip";

// Two clearly distinct, quiet cover colors — light blue for 수학Ⅰ, warm
// cream/gray for 수학Ⅱ — both with dark ink text since the covers are
// light. `spine` is baked into the cover's own background as a hard-stop
// gradient band rather than a separate element.
const THEMES = [
  { bg: "#b8d4e8", spine: "#93b7d2" },
  { bg: "#e3dac5", spine: "#c2b294" },
] as const;

export default function BookCover({
  courseId,
  titleKo,
  titleEn,
  subtitle,
  masteredCount,
  total,
  themeIndex,
}: {
  courseId: string;
  titleKo: string;
  titleEn: string;
  subtitle: string;
  masteredCount: number;
  total: number;
  themeIndex: number;
}) {
  const { flipping, trigger } = useCardFlip();
  const theme = THEMES[themeIndex % THEMES.length];
  const href = `/course/${courseId}`;

  return (
    <div
      className={`book${flipping ? " opening" : ""}`}
      style={
        {
          "--book-bg": theme.bg,
          "--book-spine": theme.spine,
        } as React.CSSProperties
      }
    >
      <div className="book-page" />
      <button
        type="button"
        className="book-cover"
        onClick={() => trigger(href, FLIP_SLOW_MS)}
        aria-label={`Open ${titleKo} · ${titleEn}`}
      >
        <div className="book-cover-title-group">
          <h2 className="book-cover-title">{titleKo}</h2>
          <span className="book-cover-title-en">{titleEn}</span>
        </div>
        <div className="book-cover-bottom">
          <p className="book-cover-subtitle">{subtitle}</p>
          <span className="book-cover-progress-text">
            {masteredCount} of {total} mastered
          </span>
        </div>
      </button>
    </div>
  );
}
