import { useEffect, useRef, useState } from "react";
import type { DemoDocumentId } from "../data/demo";

type SectionKey = "project" | "glossary" | "dictionaries";

export interface GlossaryEntry {
  source: string;
  target: string;
}

export interface DictionaryEntry {
  term: string;
  definition: string;
}

export interface DemoDocumentItem {
  id: DemoDocumentId;
  name: string;
  file: string;
  content: string;
}

export interface ProjectSidebarProps {
  documentName: string;
  demoDocuments: ReadonlyArray<DemoDocumentItem>;
  selectedDemoId: DemoDocumentId;
  onSelectDemoDocument: (id: DemoDocumentId) => void;
  glossary: GlossaryEntry[];
  dictionary: DictionaryEntry[];
  /** Terms to highlight in the Dictionary list (e.g. terms contained in the selected segment). */
  highlightedDictionaryTerms: string[];
  /** When set, open Dictionary and scroll to this term (e.g. from hovering a term in the segment). */
  scrollToDictionaryTerm: string | null;
}

/** OmegaT-style left pane: vertically collapsible Project Files, Glossary, Dictionary. */
export default function ProjectSidebar({
  documentName,
  demoDocuments,
  selectedDemoId,
  onSelectDemoDocument,
  glossary,
  dictionary,
  highlightedDictionaryTerms,
  scrollToDictionaryTerm,
}: ProjectSidebarProps) {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set(["project"])
  );
  const dictionaryEntryRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!scrollToDictionaryTerm?.trim()) return;
    const term = scrollToDictionaryTerm.trim().toLowerCase();
    const index = dictionary.findIndex(
      (e) => e.term.toLowerCase() === term
    );
    if (index === -1) return;
    setOpenSections((prev) => new Set(prev).add("dictionaries"));
    const scrollToEntry = () => {
      dictionaryEntryRefs.current[index]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    };
    const t = setTimeout(scrollToEntry, 100);
    return () => clearTimeout(t);
  }, [scrollToDictionaryTerm, dictionary]);

  const toggle = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sections: { key: SectionKey; label: string; children: React.ReactNode }[] = [
    {
      key: "project",
      label: "Project Files",
      children: (
        <div className="space-y-0.5 text-xs text-slate-600">
          {demoDocuments.map((d) => {
            const isSelected = selectedDemoId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDemoDocument(d.id)}
                className={`block w-full rounded py-1.5 px-2 text-left transition hover:bg-slate-100 ${
                  isSelected ? "bg-emerald-100 font-medium text-emerald-800" : ""
                }`}
              >
                {d.file}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      key: "glossary",
      label: "Glossary",
      children: glossary.length === 0 ? (
        <div className="flex items-center justify-center p-4 text-xs text-slate-400">
          Glossary entries will appear here when available.
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          {glossary.map((entry, i) => (
            <div
              key={i}
              className="rounded border border-slate-100 bg-white py-2 px-2.5 shadow-sm hover:border-slate-200"
            >
              <div className="text-slate-800 font-medium">{entry.source}</div>
              <div className="mt-1.5 text-emerald-800">{entry.target}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "dictionaries",
      label: "Dictionary",
      children: dictionary.length === 0 ? (
        <div className="flex items-center justify-center p-4 text-xs text-slate-400">
          No dictionary loaded.
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          {dictionary.map((entry, i) => {
            const termLower = entry.term.toLowerCase();
            const isHighlighted =
              highlightedDictionaryTerms.some(
                (t) => t.trim().toLowerCase() === termLower
              ) ||
              (!!scrollToDictionaryTerm?.trim() &&
                termLower === scrollToDictionaryTerm.trim().toLowerCase());
            return (
              <div
                key={i}
                ref={(el) => {
                  dictionaryEntryRefs.current[i] = el;
                }}
                className={`rounded py-1.5 px-2 border-b border-slate-100 last:border-0 transition-colors ${
                  isHighlighted
                    ? "bg-amber-100 ring-1 ring-amber-300"
                    : "hover:bg-slate-100"
                }`}
              >
                <div className="font-medium text-slate-700">{entry.term}</div>
                <div className="mt-0.5 text-slate-600">{entry.definition}</div>
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-slate-200 px-2 pt-2">
        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Project
        </h2>
      </div>
      <div className="flex-1 overflow-auto">
        {sections.map(({ key, label, children }) => {
          const isOpen = openSections.has(key);
          return (
            <div
              key={key}
              className="border-b border-slate-200 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100/80"
              >
                <span>{label}</span>
                <span
                  className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  ▶
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-white/50 px-2 pb-2 pt-1">
                  {children}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
