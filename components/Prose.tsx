"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeInlineFormatting } from "@/lib/tutor-markdown";
import Graph from "@/components/Graph";
import type { GraphSpec } from "@/lib/graph-spec";

// `inline` swaps the markdown renderer's block-level <p> wrapper for a
// <span>, so short strings (choice text, an answer quoted mid-sentence) can
// render safely inside a <button> or another paragraph. `graphs` lets a
// {{graph:id}} placeholder in the text resolve to an actual <Graph>.
export default function Prose({
  children,
  inline = false,
  graphs,
}: {
  children: string;
  inline?: boolean;
  graphs?: GraphSpec[];
}) {
  const components: Record<string, unknown> = {};
  if (inline) components.p = "span";
  if (graphs) {
    components["lesson-graph"] = (props: { "data-graph-id"?: string }) => {
      const spec = graphs.find((g) => g.id === props["data-graph-id"]);
      if (!spec) {
        return (
          <p className="graph-unavailable">
            📉 그래프를 표시할 수 없어요 · Graph unavailable
          </p>
        );
      }
      return <Graph spec={spec} />;
    };
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeInlineFormatting]}
      components={components as Components}
    >
      {children}
    </ReactMarkdown>
  );
}
