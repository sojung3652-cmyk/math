import Link from "next/link";

type ActivePage = "course" | "tutor" | "notes";

export default function SiteHeader({
  active,
  subtitle = "Unit 1 — 함수의 극한과 연속 · Limits & Continuity",
}: {
  active: ActivePage;
  subtitle?: string;
}) {
  return (
    <>
      <header>
        <span className="eyebrow">Study Notebook</span>
        <h1>수학 Ⅱ · Math Tutor</h1>
        <span className="unit-chip">{subtitle}</span>
      </header>
      <nav aria-label="Pages">
        <Link href="/" aria-current={active === "course" ? "page" : undefined}>
          Course 코스
        </Link>
        <Link href="/chat" aria-current={active === "tutor" ? "page" : undefined}>
          Tutor 튜터
        </Link>
        <span className="nav-disabled" title="Coming in a future update">
          Notes 노트
        </span>
      </nav>
    </>
  );
}
