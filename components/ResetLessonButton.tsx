"use client";

import { useState } from "react";

export default function ResetLessonButton({ lessonId }: { lessonId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function confirmReset() {
    setResetting(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, event: "reset" }),
      });
    } finally {
      // Full reload clears in-memory practice/quiz answers and re-renders
      // the course map ring from the (now reset) server record.
      window.location.reload();
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn-reset-lesson"
        onClick={() => setConfirming(true)}
      >
        Reset lesson 초기화
      </button>
      {confirming && (
        <div className="reset-confirm-backdrop" onClick={() => setConfirming(false)}>
          <div className="reset-confirm-card" onClick={(e) => e.stopPropagation()}>
            <p>Reset progress for this lesson? 이 수업의 진행상황을 초기화할까요?</p>
            <div className="reset-confirm-actions">
              <button
                type="button"
                className="btn-reset-cancel"
                onClick={() => setConfirming(false)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-reset-confirm"
                onClick={confirmReset}
                disabled={resetting}
              >
                {resetting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
