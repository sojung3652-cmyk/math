import type { Element, ElementContent, Root, RootContent, Text } from "hast";

// Matches a single English word (optionally hyphenated) directly followed by
// its Korean gloss in parentheses, e.g. "limit (극한)" or "left-hand (좌측)".
// Deliberately excludes spaces from the word so a preceding, unrelated word
// (e.g. the "A" in "A limit (극한)") is never pulled into the match.
const TERM_PATTERN = /\b([A-Za-z][A-Za-z'-]*)\s\(([ㄱ-㆏가-힣]+)\)/g;

const STEP_PATTERN = /^Step\s+(\d+)\s*[—-]\s*/i;
const CIRCLED_DIGITS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

function stepBadge(n: number): string {
  return CIRCLED_DIGITS[n - 1] ?? `(${n})`;
}

function isKatexElement(node: RootContent): boolean {
  return (
    node.type === "element" &&
    Array.isArray(node.properties?.className) &&
    (node.properties.className as unknown[]).includes("katex")
  );
}

function splitTerms(value: string): ElementContent[] {
  const matches = [...value.matchAll(TERM_PATTERN)];
  if (matches.length === 0) return [{ type: "text", value }];

  const out: ElementContent[] = [];
  let cursor = 0;
  for (const match of matches) {
    const start = match.index ?? 0;
    if (start > cursor) {
      out.push({ type: "text", value: value.slice(cursor, start) });
    }
    out.push({
      type: "element",
      tagName: "mark",
      properties: { className: ["term"] },
      children: [{ type: "text", value: match[0] }],
    });
    cursor = start + match[0].length;
  }
  if (cursor < value.length) {
    out.push({ type: "text", value: value.slice(cursor) });
  }
  return out;
}

function textOf(node: RootContent | ElementContent): string {
  if (node.type === "text") return (node as Text).value;
  if ("children" in node) {
    return node.children.map((child) => textOf(child)).join("");
  }
  return "";
}

// Finds where a read-aloud quote ends, given text starting at (or before) 🗣.
// Looks for the first "..." pair after the emoji; returns the index just
// past the closing quote, or -1 if there's no clean quoted phrase.
function findQuoteEnd(text: string): number {
  const open = text.indexOf('"');
  if (open === -1) return -1;
  const close = text.indexOf('"', open + 1);
  if (close === -1) return -1;
  return close + 1;
}

// Splits a paragraph so a 🗣 read-aloud line is ALWAYS on its own line, even
// if the model ran it into the same paragraph as surrounding prose. Returns
// 1-3 sibling <p> elements: [before?, read-aloud, after?].
function splitReadAloudParagraph(p: Element): Element[] {
  const kids = p.children as ElementContent[];
  let micIndex = -1;
  let micOffset = -1;
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i];
    if (k.type === "text" && k.value.includes("🗣")) {
      micIndex = i;
      micOffset = k.value.indexOf("🗣");
      break;
    }
  }
  if (micIndex === -1) return [p];

  const beforeNodes = kids.slice(0, micIndex);
  const afterNodes = kids.slice(micIndex + 1);
  const micText = (kids[micIndex] as Text).value;
  const beforeText = micText.slice(0, micOffset);
  const micRest = micText.slice(micOffset);

  const quoteEnd = findQuoteEnd(micRest);
  const readAloudText = quoteEnd === -1 ? micRest : micRest.slice(0, quoteEnd);
  const trailingText = quoteEnd === -1 ? "" : micRest.slice(quoteEnd);

  const before: ElementContent[] = [...beforeNodes];
  if (beforeText.trim()) before.push(...splitTerms(beforeText));

  const after: ElementContent[] = [];
  if (trailingText.trim()) after.push(...splitTerms(trailingText));
  after.push(...afterNodes);

  const parts: Element[] = [];
  if (before.length) {
    parts.push({ type: "element", tagName: "p", properties: {}, children: before });
  }
  parts.push({
    type: "element",
    tagName: "p",
    properties: { className: ["read-aloud"] },
    children: [{ type: "text", value: readAloudText }],
  });
  if (after.length) {
    parts.push({ type: "element", tagName: "p", properties: {}, children: after });
  }
  return parts;
}

function stripLeadingText(p: Element, length: number): void {
  const first = p.children[0];
  if (first && first.type === "text") {
    first.value = first.value.slice(length);
  }
}

function buildStepBlock(n: number, content: Element): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["step-block"] },
    children: [
      {
        type: "element",
        tagName: "span",
        properties: { className: ["step-badge"] },
        children: [{ type: "text", value: stepBadge(n) }],
      },
      {
        type: "element",
        tagName: "div",
        properties: { className: ["step-content"] },
        children: content.children,
      },
    ],
  };
}

function buildKeyIdea(content: Element): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["key-idea"] },
    children: [
      {
        type: "element",
        tagName: "span",
        properties: { className: ["key-idea-label"] },
        children: [{ type: "text", value: "핵심 · Key idea" }],
      },
      {
        type: "element",
        tagName: "div",
        properties: { className: ["key-idea-body"] },
        children: content.children,
      },
    ],
  };
}

function walk(node: Root | Element): void {
  const children = node.children as ElementContent[];
  const next: ElementContent[] = [];

  for (const child of children) {
    if (isKatexElement(child)) {
      next.push(child);
      continue;
    }
    if (child.type === "text") {
      next.push(...splitTerms(child.value));
      continue;
    }
    if (child.type === "element") {
      if (child.tagName === "p") {
        const text = textOf(child).trim();

        if (text.includes("🗣")) {
          const parts = splitReadAloudParagraph(child);
          for (const part of parts) walk(part);
          next.push(...parts);
          continue;
        }

        const stepMatch = text.match(STEP_PATTERN);
        if (stepMatch) {
          stripLeadingText(child, stepMatch[0].length);
          walk(child);
          next.push(buildStepBlock(Number(stepMatch[1]), child));
          continue;
        }

        if (text.startsWith("💡")) {
          walk(child);
          next.push(buildKeyIdea(child));
          continue;
        }
      }
      walk(child);
      next.push(child);
    } else {
      next.push(child);
    }
  }

  node.children = next as (Root | Element)["children"];
}

function headingText(node: RootContent): string | null {
  if (node.type !== "element" || !/^h[1-6]$/.test(node.tagName)) return null;
  return textOf(node);
}

function buildPracticeBox(heading: Element, body: RootContent[]): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["practice"] },
    children: [
      {
        type: "element",
        tagName: "span",
        properties: { className: ["label"] },
        children: [{ type: "text", value: "PRACTICE · 연습문제" }],
      },
      ...(body as ElementContent[]),
    ],
  };
}

function buildNoteCard(heading: Element, body: RootContent[]): Element {
  const label = textOf(heading).replace(/^📌\s*/, "").trim() || "NOTE";
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["note-card"] },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { className: ["note-tab"] },
        children: [
          { type: "text", value: "📌 " },
          {
            type: "element",
            tagName: "b",
            properties: {},
            children: [{ type: "text", value: label }],
          },
        ],
      },
      {
        type: "element",
        tagName: "div",
        properties: { className: ["note-body"] },
        children: body as ElementContent[],
      },
      {
        type: "element",
        tagName: "div",
        properties: { className: ["note-actions"] },
        children: [
          {
            type: "element",
            tagName: "button",
            properties: {
              className: ["btn-save"],
              disabled: true,
              title: "Saving notes is coming in a future update",
            },
            children: [{ type: "text", value: "Save note" }],
          },
        ],
      },
    ],
  };
}

function wrapSections(tree: Root): void {
  const children = tree.children as RootContent[];
  const result: RootContent[] = [];
  let i = 0;

  while (i < children.length) {
    const node = children[i];
    const heading = headingText(node);

    if (heading && /📌|note/i.test(heading)) {
      const rest = children.slice(i + 1);
      result.push(buildNoteCard(node as Element, rest));
      i = children.length;
      continue;
    }

    if (heading && /practice/i.test(heading)) {
      const collected: RootContent[] = [];
      let j = i + 1;
      while (j < children.length && !headingText(children[j])) {
        collected.push(children[j]);
        j++;
      }
      result.push(buildPracticeBox(node as Element, collected));
      i = j;
      continue;
    }

    result.push(node);
    i++;
  }

  tree.children = result;
}

/**
 * Rehype plugin: highlights bilingual terms like "limit (극한)"; guarantees
 * read-aloud lines (🗣 ...) always render on their own line in the red-pen
 * style, splitting the paragraph if the model ran it into surrounding
 * prose; turns "Step N — ..." paragraphs into numbered-badge blocks; and
 * wraps "💡 ..." sentences in a 핵심 · Key idea callout. Use this alone when
 * the page already builds its own section structure (e.g. the static
 * lesson page rendering each field into its own container).
 */
export function rehypeInlineFormatting() {
  return (tree: Root) => {
    walk(tree);
  };
}

/**
 * Rehype plugin: everything `rehypeInlineFormatting` does, plus wraps the
 * trailing "Practice" and "📌 Note" sections in their card containers. Use
 * this for free-flowing chat output where the model's own headings define
 * the structure.
 */
export function rehypeTutorFormatting() {
  return (tree: Root) => {
    walk(tree);
    wrapSections(tree);
  };
}
