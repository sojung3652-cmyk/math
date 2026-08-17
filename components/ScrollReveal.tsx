"use client";

import { useEffect } from "react";

const SELECTOR = ".reveal, .reveal-card, .reveal-graph, .reveal-stagger";

// No visual output — just wires an IntersectionObserver over whatever
// .reveal* elements exist in the DOM when a lesson page mounts. The hidden
// starting state lives in CSS on the markup itself (server-rendered), so
// there's no flash before this effect attaches; prefers-reduced-motion is
// handled purely in CSS (see globals.css), so this component doesn't need
// to branch on it — observing and adding .in-view is harmless either way.
export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(SELECTOR);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
