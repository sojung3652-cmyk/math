"use client";

import { useEffect, useRef, useState } from "react";

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

type IndicatorRect = { x: number; y: number; width: number; height: number };

// One list (mobile's horizontal scroller or desktop's vertical stack)
// plus a sliding highlight that animates between item positions instead of
// hard-swapping which item looks active. Works for both orientations
// unchanged: offsetLeft/offsetTop + translate() naturally handle either
// axis, so the same component serves both variants.
function NavList({
  sections,
  activeId,
  percent,
  onSelect,
  variant,
}: {
  sections: NavSection[];
  activeId: string;
  percent: number;
  onSelect: (id: string) => void;
  variant: "mobile" | "desktop";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>(`[data-section-id="${activeId}"]`);
    if (!activeEl) {
      setIndicator(null);
      return;
    }
    setIndicator({
      x: activeEl.offsetLeft,
      y: activeEl.offsetTop,
      width: activeEl.offsetWidth,
      height: activeEl.offsetHeight,
    });
  }, [activeId, sections]);

  return (
    <div className={`lesson-nav-list lesson-nav-list-${variant}`} ref={containerRef}>
      {indicator && (
        <span
          className="lesson-nav-indicator"
          style={{
            transform: `translate(${indicator.x}px, ${indicator.y}px)`,
            width: indicator.width,
            height: indicator.height,
          }}
        />
      )}
      {sections.map((s) => {
        const done = s.threshold != null && percent >= s.threshold;
        return (
          <button
            key={s.id}
            type="button"
            data-section-id={s.id}
            className={`lesson-nav-item${activeId === s.id ? " active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            {s.threshold != null && <span className={`lesson-nav-dot${done ? " done" : ""}`} />}
            <span className="lesson-nav-label">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

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

  return (
    <>
      <nav
        className={`lesson-nav lesson-nav-mobile${hidden ? " lesson-nav-hidden" : ""}`}
        aria-label="Lesson sections"
      >
        <NavList
          sections={sections}
          activeId={activeId}
          percent={percent}
          onSelect={goTo}
          variant="mobile"
        />
      </nav>
      <nav
        className={`lesson-nav lesson-nav-desktop${hidden ? " lesson-nav-hidden" : ""}`}
        aria-label="Lesson sections"
      >
        <NavList
          sections={sections}
          activeId={activeId}
          percent={percent}
          onSelect={goTo}
          variant="desktop"
        />
      </nav>
    </>
  );
}
