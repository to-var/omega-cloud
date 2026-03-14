/**
 * Demo / mock data for the prototype.
 * Demo source texts are embedded from markdown files in src/data/demo-documents/.
 */

import earlyArcadeMd from "./demo-documents/early-arcade-and-consoles.md?raw";
import riseOf3dMd from "./demo-documents/rise-of-3d-and-cdrom.md?raw";
import indieAndDigitalMd from "./demo-documents/indie-and-digital-distribution.md?raw";

/** List of available demo documents (markdown content embedded at build time). */
export const DEMO_DOCUMENTS = [
  {
    id: "early-arcade-and-consoles",
    name: "Early arcade and home consoles",
    file: "early-arcade-and-consoles.md",
    content: earlyArcadeMd.trim(),
  },
  {
    id: "rise-of-3d-and-cdrom",
    name: "Rise of 3D and CD-ROM",
    file: "rise-of-3d-and-cdrom.md",
    content: riseOf3dMd.trim(),
  },
  {
    id: "indie-and-digital-distribution",
    name: "Indie games and digital distribution",
    file: "indie-and-digital-distribution.md",
    content: indieAndDigitalMd.trim(),
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

/** Glossary and dictionary are loaded from the API (see useGlossary / useDictionary). */
