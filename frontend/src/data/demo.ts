/**
 * Demo / mock data for the prototype.
 * Demo source texts are embedded from markdown files in src/data/demo-documents/.
 */

import catToolMd from "./demo-documents/cat-tool.md?raw";
import translationMemoryBasicsMd from "./demo-documents/translation-memory-basics.md?raw";
import glossaryAndQaMd from "./demo-documents/glossary-and-qa.md?raw";

/** List of available demo documents (markdown content embedded at build time). */
export const DEMO_DOCUMENTS = [
  {
    id: "cat-tool",
    name: "CAT tool overview",
    file: "cat-tool.md",
    content: catToolMd.trim(),
  },
  {
    id: "translation-memory-basics",
    name: "Translation memory basics",
    file: "translation-memory-basics.md",
    content: translationMemoryBasicsMd.trim(),
  },
  {
    id: "glossary-and-qa",
    name: "Glossary and QA",
    file: "glossary-and-qa.md",
    content: glossaryAndQaMd.trim(),
  },
] as const;

export type DemoDocumentId = (typeof DEMO_DOCUMENTS)[number]["id"];

/** Fallback text if no document content is available. */
export const DEMO_SOURCE_TEXT_FALLBACK =
  "No document loaded. Select a demo document from the list.";

/** Converts plain text to HTML for the rich text editor (paragraphs and line breaks). */
export function demoTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/** Default document name shown in the UI (replaced when a demo doc is loaded). */
export const DEMO_DOCUMENT_NAME_DEFAULT = "demo_text.txt";

/** Glossary: source term → target term (for consistent terminology). */
export const DEMO_GLOSSARY: { source: string; target: string }[] = [
  { source: "CAT tool", target: "Herramienta TAO" },
  {
    source: "Computer-Assisted Translation",
    target: "Traducción Asistida por Ordenador",
  },
  { source: "translation memory", target: "memoria de traducción" },
  { source: "TM", target: "MT" },
  { source: "terminology management", target: "gestión terminológica" },
  { source: "glossary", target: "glosario" },
  { source: "termbase", target: "base terminológica" },
  { source: "segmented editor", target: "editor segmentado" },
  { source: "segments", target: "segmentos" },
  { source: "alignment tools", target: "herramientas de alineación" },
  { source: "Quality assurance", target: "Garantía de calidad" },
  { source: "machine translation", target: "traducción automática" },
];

/** Dictionary: term → definition or translation note. */
export const DEMO_DICTIONARY: { term: string; definition: string }[] = [
  {
    term: "CAT tool",
    definition:
      "Software that helps translators by reusing previous translations and managing terminology.",
  },
  {
    term: "Translation memory (TM)",
    definition:
      "Database of source and target segment pairs used for reuse and fuzzy matching.",
  },
  {
    term: "Termbase",
    definition: "Glossary or database of approved terms and their translations.",
  },
  {
    term: "Segment",
    definition:
      "A unit of text (sentence or phrase) treated as one translatable item.",
  },
  {
    term: "Alignment",
    definition:
      "Process of matching source and target segments to build a TM from existing translations.",
  },
  {
    term: "QA",
    definition: "Quality assurance; checks for consistency, numbers, and formatting.",
  },
  {
    term: "Fuzzy match",
    definition:
      "TM suggestion that is similar but not identical to the current segment.",
  },
];
