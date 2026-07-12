import { z } from "zod";

export const GRAPH_COLOR_HEX = {
  ink: "#1F2B3D",
  "pen-blue": "#2B4C9B",
  "red-pen": "#C6382E",
} as const;

export const GraphColorSchema = z.enum(["ink", "pen-blue", "red-pen"]);

// A plain (homogeneous) 2-number array rather than z.tuple() — zod's tuple
// support renders as JSON Schema's `prefixItems`, which the structured-
// outputs API rejects. An array + runtime `.length(2)` gets the same
// 2-number-pair guarantee without it.
const Point2 = z.array(z.number()).length(2);

export const GraphFunctionSchema = z.object({
  expression: z.string(),
  color: GraphColorSchema.default("pen-blue"),
  domain: Point2.optional(),
  dashed: z.boolean().optional(),
});

export const GraphPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  style: z.enum(["open", "closed"]).default("closed"),
  color: GraphColorSchema.default("red-pen"),
});

export const GraphAsymptoteSchema = z.object({
  axis: z.enum(["x", "y"]),
  value: z.number(),
});

export const GraphSpecSchema = z.object({
  id: z.string(),
  captionEn: z.string(),
  captionKo: z.string(),
  xDomain: Point2,
  yDomain: Point2.optional(),
  functions: z.array(GraphFunctionSchema).min(1).max(4),
  points: z.array(GraphPointSchema).max(6).default([]),
  asymptotes: z.array(GraphAsymptoteSchema).max(4).default([]),
});
export type GraphSpec = z.infer<typeof GraphSpecSchema>;

export const LessonTextField = z.enum([
  "intuition",
  "definition",
  "workedExample",
  "teachingNote",
  "note",
]);

export const GraphPlacementSchema = z.object({
  graph: GraphSpecSchema,
  field: LessonTextField,
  afterParagraph: z.number().int().min(0),
});
export type GraphPlacement = z.infer<typeof GraphPlacementSchema>;

export const AddGraphsResponseSchema = z.object({
  placements: z.array(GraphPlacementSchema).max(6).default([]),
});
export type AddGraphsResponse = z.infer<typeof AddGraphsResponseSchema>;
