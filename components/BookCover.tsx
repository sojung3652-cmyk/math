"use client";

import { useCardFlip } from "@/components/useCardFlip";

// A weighty, deliberate hardcover-open animation (see .book-open in
// globals.css) — distinct from the 300/600ms quick page-turns used
// elsewhere (UnitSelectCard, LessonRow), so this gets its own constant
// rather than reusing FLIP_SLOW_MS.
const BOOK_OPEN_MS = 800;

// Light blue for 수학Ⅰ, warm beige/cream for 수학Ⅱ — both with dark ink
// text since the covers are light. `spine` is a real element now (not a
// gradient band) so it can carry its own inset shadow and rounded edge.
const THEMES = [
  { bg: "#b8d4e8", spine: "#8fb0cc" },
  { bg: "#d4c5a9", spine: "#b3a17e" },
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
      <div className="book-spine" />
      <div className="book-page" />
      <button
        type="button"
        className="book-cover"
        onClick={() => trigger(href, BOOK_OPEN_MS)}
        aria-label={`Open ${titleKo} · ${titleEn}`}
      >
        <div className="book-cover-face book-cover-front">
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
        </div>
        <div className="book-cover-face book-cover-back" />
      </button>
    </div>
  );
}
