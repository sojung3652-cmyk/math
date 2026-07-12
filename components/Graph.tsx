"use client";

import { useEffect, useRef, useState } from "react";
import type { FunctionPlotDatum, FunctionPlotAnnotation } from "function-plot";
import { GRAPH_COLOR_HEX, type GraphSpec } from "@/lib/graph-spec";

export default function Graph({ spec }: { spec: GraphSpec }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setError(null);

    function render() {
      if (cancelled || !container) return;
      container.innerHTML = "";
      const width = container.clientWidth || 320;

      const data: FunctionPlotDatum[] = [
        ...spec.functions.map((f) => ({
          fn: f.expression,
          color: GRAPH_COLOR_HEX[f.color],
          range: f.domain as [number, number] | undefined,
          graphType: "polyline" as const,
          attr: f.dashed ? { "stroke-dasharray": "6,5" } : undefined,
        })),
        ...spec.points.map((p) => ({
          points: [[p.x, p.y]],
          fnType: "points" as const,
          graphType: "scatter" as const,
          attr:
            p.style === "open"
              ? {
                  fill: "#fff",
                  stroke: GRAPH_COLOR_HEX[p.color],
                  "stroke-width": 2,
                  r: 5,
                  opacity: 1,
                }
              : { fill: GRAPH_COLOR_HEX[p.color], r: 5, opacity: 1 },
        })),
      ];

      const annotations: FunctionPlotAnnotation[] = spec.asymptotes.map((a) =>
        a.axis === "x" ? { x: a.value } : { y: a.value },
      );

      import("function-plot")
        .then(({ default: functionPlot }) => {
          if (cancelled || !container) return;
          functionPlot({
            target: container,
            width,
            height: Math.round(Math.min(320, width * 0.72)),
            grid: true,
            disableZoom: true,
            xAxis: { domain: spec.xDomain },
            yAxis: { domain: spec.yDomain },
            data,
            annotations,
          });
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Could not render this graph.");
          }
        });
    }

    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [spec]);

  if (error) {
    return (
      <p className="graph-unavailable">
        📉 그래프를 표시할 수 없어요 · Graph unavailable
      </p>
    );
  }

  return (
    <div className="graph-box">
      <div ref={containerRef} className="graph-canvas" />
      <p className="graph-caption">
        {spec.captionEn} <span className="graph-caption-ko">· {spec.captionKo}</span>
      </p>
    </div>
  );
}
