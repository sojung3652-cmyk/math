"use client";

import { useEffect, useState } from "react";

export type NavSection = {
  id: string;
  label: string;
  // Progress percent (25/50/75/100) at which this section counts as done,
  // or null for sections with no milestone of their own (더 알아보기).
  threshold: number | null;
};

// Distance from the top of the viewport used as the "current reading line":
// the last section whose top has scrolled above this line is the active one.
const ACTIVE_OFFSET = 96;

export default function LessonNav({
  sections,
  percent,
  hidden = false,
}: {
  sections: NavSection[];
  percent: number;
  hidden?: boolean;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    let ticking = false;

    function update() {
      let current = sections[0]?.id ?? "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) {
          current = s.id;
        }
      }
      setActiveId(current);
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const items = sections.map((s) => {
    const done = s.threshold != null && percent >= s.threshold;
    return (
      <button
        key={s.id}
        type="button"
        className={`lesson-nav-item${activeId === s.id ? " active" : ""}`}
        onClick={() => goTo(s.id)}
      >
        {s.threshold != null && <span className={`lesson-nav-dot${done ? " done" : ""}`} />}
        <span className="lesson-nav-label">{s.label}</span>
      </button>
    );
  });

  return (
    <>
      <nav
        className={`lesson-nav lesson-nav-mobile${hidden ? " lesson-nav-hidden" : ""}`}
        aria-label="Lesson sections"
      >
        <div className="lesson-nav-scroll">{items}</div>
      </nav>
      <nav
        className={`lesson-nav lesson-nav-desktop${hidden ? " lesson-nav-hidden" : ""}`}
        aria-label="Lesson sections"
      >
        {items}
      </nav>
    </>
  );
}
