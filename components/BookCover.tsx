"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookCover({
  courseId,
  titleKo,
  titleEn,
  subtitle,
  masteredCount,
  total,
  ctaHref,
  ctaLabel,
}: {
  courseId: string;
  titleKo: string;
  titleEn: string;
  subtitle: string;
  masteredCount: number;
  total: number;
  ctaHref: string;
  ctaLabel: string;
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const href = `/course/${courseId}`;
  const percent = total > 0 ? (masteredCount / total) * 100 : 0;

  function openBook() {
    if (opening) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      router.push(href);
      return;
    }
    setOpening(true);
    window.setTimeout(() => router.push(href), 600);
  }

  return (
    <div className={`book${opening ? " opening" : ""}`}>
      <div className="book-spine" />
      <div className="book-page" />
      <button
        type="button"
        className="book-cover"
        onClick={openBook}
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
      <Link href={ctaHref} className="btn-unit-cta book-cta">
        {ctaLabel}
      </Link>
    </div>
  );
}
