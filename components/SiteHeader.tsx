import Link from "next/link";

type ActivePage = "course" | "notes";

export type Breadcrumb = {
  label: string;
  // Omit href on the last (current-page) segment.
  href?: string;
};

export default function SiteHeader({
  active,
  breadcrumbs = [],
}: {
  active?: ActivePage;
  breadcrumbs?: Breadcrumb[];
}) {
  return (
    <>
      <header>
        <span className="eyebrow">Study Notebook</span>
        <h1>내 수학 노트 · My Math Notebook</h1>
      </header>
      <nav aria-label="Pages">
        <Link href="/" aria-current={active === "course" ? "page" : undefined} transitionTypes={["nav-back"]}>
          Course 코스
        </Link>
        <span className="nav-disabled" title="Coming in a future update">
          Notes 노트
        </span>
      </nav>
      {breadcrumbs.length > 0 && (
        <div className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span className="breadcrumb-segment" key={`${crumb.label}-${i}`}>
              {crumb.href ? (
                <Link href={crumb.href} transitionTypes={["nav-back"]}>
                  {crumb.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="breadcrumb-sep">›</span>}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
