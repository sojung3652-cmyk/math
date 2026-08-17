"use client";

import { useEffect, useState } from "react";
import type { LessonStatus } from "@/lib/progress-store";

const SIZE = 22;
const STROKE = 2;
const CENTER = SIZE / 2;
const RADIUS = CENTER - STROKE;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({
  lessonId,
  percent,
  status,
}: {
  lessonId: string;
  percent: number;
  status: LessonStatus;
}) {
  const [justMastered, setJustMastered] = useState(false);

  useEffect(() => {
    if (status !== "mastered") return;
    const key = `mastered-seen-${lessonId}`;
    if (typeof window === "undefined" || window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    setJustMastered(true);
  }, [status, lessonId]);

  const fraction = Math.min(Math.max(percent, 0), 100) / 100;
  const dashoffset = CIRCUMFERENCE * (1 - fraction);

  return (
    <span className={`progress-ring ${status}${justMastered ? " pop" : ""}`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle className="ring-track" cx={CENTER} cy={CENTER} r={RADIUS} />
        {status === "in_progress" && (
          <circle
            className="ring-fill"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        )}
        {status === "mastered" && (
          <circle className="ring-mastered-fill" cx={CENTER} cy={CENTER} r={CENTER} />
        )}
      </svg>
      {status === "mastered" && <span className="ring-check">✓</span>}
    </span>
  );
}
