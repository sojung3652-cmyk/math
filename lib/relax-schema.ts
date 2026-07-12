// Claude's structured-outputs API accepts only a narrow subset of JSON
// Schema keywords per type — no minItems above 1, no maxItems, no
// minimum/maximum, no prefixItems (tuples), etc. This mirrors the official
// SDK's internal schema transform (@anthropic-ai/sdk's zodOutputFormat
// helper does the same thing, but bundled with an auto-parse step we can't
// use — see scripts/generate-lesson-content.ts): rebuild the schema keeping
// only supported keywords per node, and fold anything stripped into that
// node's `description` as a plain-text hint, so the model still sees the
// constraint even though the API can no longer enforce it structurally.

type JSONSchema = Record<string, unknown>;

const SUPPORTED_STRING_FORMATS = new Set([
  "date-time",
  "time",
  "date",
  "duration",
  "email",
  "hostname",
  "uri",
  "ipv4",
  "ipv6",
  "uuid",
]);

export function relaxJSONSchema(schema: unknown): unknown {
  if (schema === null || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(relaxJSONSchema);
  return relaxNode({ ...(schema as JSONSchema) });
}

function relaxNode(node: JSONSchema): JSONSchema {
  if ("$ref" in node) {
    return { $ref: node["$ref"] };
  }

  const out: JSONSchema = {};
  const leftover: JSONSchema = {};

  if ("$defs" in node && node.$defs && typeof node.$defs === "object") {
    out.$defs = Object.fromEntries(
      Object.entries(node.$defs as Record<string, unknown>).map(([k, v]) => [
        k,
        relaxNode(v as JSONSchema),
      ]),
    );
  }

  const { type, anyOf, oneOf, allOf, description, title, enum: enumValues, const: constValue, $defs: _defs, ...rest } = node;
  void _defs;

  if (Array.isArray(anyOf)) out.anyOf = anyOf.map((v) => relaxNode(v as JSONSchema));
  else if (Array.isArray(oneOf)) out.anyOf = oneOf.map((v) => relaxNode(v as JSONSchema));
  else if (Array.isArray(allOf)) out.allOf = allOf.map((v) => relaxNode(v as JSONSchema));
  else if (type !== undefined) out.type = type;

  if (description !== undefined) out.description = description;
  if (title !== undefined) out.title = title;
  // Explicitly documented as supported — keep structurally rather than
  // demoting to a description hint like other unsupported keywords.
  if (enumValues !== undefined) out.enum = enumValues;
  if (constValue !== undefined) out.const = constValue;

  if (type === "object") {
    const { properties, additionalProperties: _additionalProperties, required, ...objRest } = rest;
    void _additionalProperties;
    if (properties && typeof properties === "object") {
      out.properties = Object.fromEntries(
        Object.entries(properties as Record<string, unknown>).map(([k, v]) => [
          k,
          relaxNode(v as JSONSchema),
        ]),
      );
    }
    out.additionalProperties = false;
    if (required !== undefined) out.required = required;
    Object.assign(leftover, objRest);
  } else if (type === "array") {
    const { items, minItems, maxItems, prefixItems, ...arrRest } = rest;
    if (items !== undefined) out.items = relaxNode(items as JSONSchema);
    if (minItems === 0 || minItems === 1) out.minItems = minItems;
    else if (minItems !== undefined) leftover.minItems = minItems;
    if (maxItems !== undefined) leftover.maxItems = maxItems;
    if (prefixItems !== undefined) leftover.prefixItems = prefixItems;
    Object.assign(leftover, arrRest);
  } else if (type === "string") {
    const { format, ...strRest } = rest;
    if (typeof format === "string" && SUPPORTED_STRING_FORMATS.has(format)) {
      out.format = format;
    } else if (format !== undefined) {
      leftover.format = format;
    }
    Object.assign(leftover, strRest);
  } else {
    // number, integer, boolean, null — no extra supported keywords beyond
    // type/description (enum/const pass through fine as-is elsewhere, but
    // anything like minimum/maximum/multipleOf gets demoted below).
    Object.assign(leftover, rest);
  }

  if (Object.keys(leftover).length > 0) {
    const hint = Object.entries(leftover)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(", ");
    out.description = (out.description ? `${out.description}\n\n` : "") + `{${hint}}`;
  }

  return out;
}
