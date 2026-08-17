"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

// Shared "flip this element, then navigate" behavior for the book/page-turn
// interactions (BookCover, UnitSelectCard, LessonRow). A manual click uses
// the slower, deliberate duration; a step in an auto-continued walkthrough
// (Start/Continue chaining through Level 2 and 3) uses the faster one, so a
// shortcut still shows every page turning instead of teleporting.
export const FLIP_SLOW_MS = 600;
export const FLIP_FAST_MS = 300;

export function useCardFlip() {
  const router = useRouter();
  const [flipping, setFlipping] = useState(false);

  const trigger = useCallback(
    (href: string, durationMs: number) => {
      if (flipping) return;
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        router.push(href);
        return;
      }
      setFlipping(true);
      window.setTimeout(() => router.push(href), durationMs);
    },
    [flipping, router],
  );

  return { flipping, trigger };
}
