import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useExtractSegments, useMatchSegments, useTMs } from "../hooks/useTM";
import MarkdownText from "../components/MarkdownText";
import SegmentEditor from "../components/SegmentEditor";
import SegmentWithDictionary from "../components/SegmentWithDictionary";
import ProjectSidebar from "../components/ProjectSidebar";
import MenuBar from "../components/MenuBar";
import Toolbar from "../components/Toolbar";
import client from "../api/client";
import GlossarySuggestions, {
  getSuggestionsForSegment,
} from "../components/GlossarySuggestions";
import type { Match, Segment, SegmentTranslation } from "../types";
import {
  DEMO_DOCUMENTS,
  DEMO_DOCUMENT_NAME_DEFAULT,
  DEMO_GLOSSARY,
  DEMO_DICTIONARY,
  DEMO_SOURCE_TEXT_FALLBACK,
} from "../data/demo";
import type { DemoDocumentId } from "../data/demo";

const USER_NAME = "User";

/** Returns dictionary terms that appear in the given source (case-insensitive). */
function getTermsInSegment(
  source: string,
  dictionary: { term: string }[]
): string[] {
  const lower = source.toLowerCase();
  return dictionary
    .filter((e) => lower.includes(e.term.toLowerCase()))
    .map((e) => e.term);
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function matchToTranslation(match: Match): SegmentTranslation {
  const ts = nowIso();
  const origin: SegmentTranslation["origin"] =
    match.matchType === "exact" || match.matchType === "fuzzy"
      ? "translation_memory"
      : match.aiSuggested
        ? "ai_suggested"
        : "manual";
  return {
    target: match.target ?? "",
    changedOn: ts,
    changedBy: USER_NAME,
    createdOn: ts,
    createdBy: USER_NAME,
    origin,
  };
}

export default function Workspace() {
  const { data: tmsData, isLoading: tmsLoading } = useTMs();
  const extractSegments = useExtractSegments();
  const matchSegments = useMatchSegments();

  type MiddleView = "diff" | "editor";
  const [middleView, setMiddleView] = useState<MiddleView>("editor");

  const [selectedDemoId, setSelectedDemoId] = useState<DemoDocumentId>(
    DEMO_DOCUMENTS[0].id
  );
  const doc = DEMO_DOCUMENTS.find((d) => d.id === selectedDemoId);
  const [editorPlainText, setEditorPlainText] = useState(
    () => doc?.content ?? DEMO_SOURCE_TEXT_FALLBACK
  );
  const [documentName, setDocumentName] = useState(
    () => doc?.file ?? DEMO_DOCUMENT_NAME_DEFAULT
  );
  const [segments, setSegments] = useState<Segment[]>([]);
  const [tmId, setTmId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, Match>>(new Map());
  const [translations, setTranslations] = useState<Map<number, SegmentTranslation>>(new Map());
  const [aiTranslatingSegmentIndex, setAiTranslatingSegmentIndex] = useState<number | null>(null);
  const [aiTranslatingAll, setAiTranslatingAll] = useState(false);
  const [scrollToDictionaryTerm, setScrollToDictionaryTerm] = useState<string | null>(null);

  const extractDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When demo document selection changes, use its embedded content
  useEffect(() => {
    const d = DEMO_DOCUMENTS.find((x) => x.id === selectedDemoId);
    if (d) {
      setEditorPlainText(d.content || DEMO_SOURCE_TEXT_FALLBACK);
      setDocumentName(d.file);
    }
  }, [selectedDemoId]);

  useEffect(() => {
    const trimmed = editorPlainText.trim();

    if (!trimmed) {
      if (extractDebounceRef.current) {
        clearTimeout(extractDebounceRef.current);
        extractDebounceRef.current = null;
      }
      const t = setTimeout(() => {
        clearDebounceRef.current = null;
        setSegments([]);
        setSelectedIndex(null);
        setMatches(new Map());
        setTranslations(new Map());
      }, 250);
      clearDebounceRef.current = t;
      return () => {
        if (clearDebounceRef.current) clearTimeout(clearDebounceRef.current);
      };
    }

    if (clearDebounceRef.current) {
      clearTimeout(clearDebounceRef.current);
      clearDebounceRef.current = null;
    }
    if (extractDebounceRef.current) clearTimeout(extractDebounceRef.current);
    extractDebounceRef.current = setTimeout(() => {
      extractDebounceRef.current = null;
      extractSegments.mutate(trimmed, {
        onSuccess: (result) => {
          setSegments(result);
          setSelectedIndex(null);
          setMatches(new Map());
          setTranslations(new Map());
        },
      });
    }, 400);
    return () => {
      if (extractDebounceRef.current) clearTimeout(extractDebounceRef.current);
    };
    // Only react to source text; extractSegments is stable but its reference can change and would cause an infinite loop
  }, [editorPlainText]);

  const handleRunMatching = useCallback(async () => {
    if (!tmId || segments.length === 0) return;
    const matchResult = await matchSegments.mutateAsync({
      segments,
      tm_id: tmId,
    });
    const newMatches = new Map<number, Match>();
    const newTranslations = new Map<number, SegmentTranslation>();
    matchResult.segments.forEach((sm) => {
      newMatches.set(sm.index, sm.match);
      newTranslations.set(sm.index, matchToTranslation(sm.match));
    });
    setMatches(newMatches);
    setTranslations(newTranslations);
  }, [tmId, segments, matchSegments]);

  const handleTranslationChange = useCallback(
    (index: number, target: string) => {
      const ts = nowIso();
      setTranslations((prev) => {
        const next = new Map(prev);
        const existing = next.get(index);
        next.set(index, {
          target,
          changedOn: ts,
          changedBy: USER_NAME,
          createdOn: existing?.createdOn ?? ts,
          createdBy: existing?.createdBy ?? USER_NAME,
          origin: "manual",
        });
        return next;
      });
    },
    []
  );

  const handleRequestAiTranslation = useCallback(
    async (segmentIndex: number) => {
      const segment = segments.find((s) => s.index === segmentIndex);
      if (!segment) return;
      setAiTranslatingSegmentIndex(segmentIndex);
      try {
        const suggestedTerms = getSuggestionsForSegment(
          segment.source,
          DEMO_GLOSSARY
        );
        const { data } = await client.post<{ translation: string }>(
          "/ai/translate",
          {
            segment_source: segment.source,
            suggested_terms: suggestedTerms,
          }
        );
        const ts = nowIso();
        setTranslations((prev) => {
          const next = new Map(prev);
          const existing = next.get(segmentIndex);
          next.set(segmentIndex, {
            target: data.translation,
            changedOn: ts,
            changedBy: USER_NAME,
            createdOn: existing?.createdOn ?? ts,
            createdBy: existing?.createdBy ?? USER_NAME,
            origin: "ai_suggested",
          });
          return next;
        });
      } catch {
        // Error could be shown in UI; for now just clear loading state
      } finally {
        setAiTranslatingSegmentIndex(null);
      }
    },
    [segments]
  );

  const handleTranslateWholeDocument = useCallback(async () => {
    if (segments.length === 0) return;
    setAiTranslatingAll(true);
    const ts = nowIso();
    for (const seg of segments) {
      try {
        const { data } = await client.post<{ translation: string }>(
          "/ai/translate",
          {
            segment_source: seg.source,
            suggested_terms: DEMO_GLOSSARY,
          }
        );
        setTranslations((prev) => {
          const next = new Map(prev);
          const existing = next.get(seg.index);
          next.set(seg.index, {
            target: data.translation,
            changedOn: ts,
            changedBy: USER_NAME,
            createdOn: existing?.createdOn ?? ts,
            createdBy: existing?.createdBy ?? USER_NAME,
            origin: "ai_suggested",
          });
          return next;
        });
      } catch {
        // Continue with next segment on error
      }
    }
    setAiTranslatingAll(false);
  }, [segments]);

  const selectedSegment = segments.find((s) => s.index === selectedIndex);
  const highlightedDictionaryTerms = useMemo(() => {
    const seg = segments.find((s) => s.index === selectedIndex);
    return seg ? getTermsInSegment(seg.source, DEMO_DICTIONARY) : [];
  }, [selectedIndex, segments]);
  const selectedTranslation =
    selectedIndex !== null ? translations.get(selectedIndex) ?? null : null;
  const tms = tmsData?.items ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="flex shrink-0 items-center border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          OmegaT Cloud
        </h1>
      </header>
      <MenuBar />
      <Toolbar />

      <div className="flex min-h-0 flex-1">
        {/* Left: Project / Glossary / Dictionaries — sticky */}
        <aside className="w-52 shrink-0 overflow-hidden border-r border-slate-200 bg-slate-50/50">
          <ProjectSidebar
            documentName={documentName}
            demoDocuments={[...DEMO_DOCUMENTS]}
            selectedDemoId={selectedDemoId}
            onSelectDemoDocument={setSelectedDemoId}
            glossary={DEMO_GLOSSARY}
            dictionary={DEMO_DICTIONARY}
            highlightedDictionaryTerms={highlightedDictionaryTerms}
            scrollToDictionaryTerm={scrollToDictionaryTerm}
          />
        </aside>

        {/* Center: scrollable area — view switcher + Source / Translation / Segment editor */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-slate-200 bg-white">
          <div className="flex shrink-0 border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setMiddleView("diff")}
              className={`px-4 py-2 text-sm font-medium transition ${
                middleView === "diff"
                  ? "border-b-2 border-emerald-600 text-emerald-700 bg-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Source & translation
            </button>
            <button
              type="button"
              onClick={() => setMiddleView("editor")}
              className={`px-4 py-2 text-sm font-medium transition ${
                middleView === "editor"
                  ? "border-b-2 border-emerald-600 text-emerald-700 bg-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Segment editor
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {extractSegments.isPending && (
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
                  Extracting segments…
                </div>
              )}
              {extractSegments.isError && (
                <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {extractSegments.error?.message ?? "Failed to extract segments."}
                </div>
              )}

              {middleView === "diff" && (
                <div className="flex flex-col">
                  {segments.length === 0 ? (
                    <p className="p-4 text-sm text-slate-400">No segments yet.</p>
                  ) : (
                    <>
                      <div className="sticky top-0 z-10 flex flex-col border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-end gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
                          <button
                            type="button"
                            onClick={handleTranslateWholeDocument}
                            disabled={aiTranslatingAll}
                            className="flex items-center gap-2 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            title="Translate all segments with AI (uses full glossary)"
                          >
                            {aiTranslatingAll ? (
                              <>
                                <i className="fas fa-spinner fa-spin" aria-hidden />
                                Translating all…
                              </>
                            ) : (
                              <>
                                <i className="fas fa-wand-magic-sparkles" aria-hidden />
                                Translate all with AI
                              </>
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <div className="border-r border-slate-200 px-4 py-2">
                            Source
                          </div>
                          <div className="px-4 py-2">Translation</div>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-200">
                        {segments.map((seg) => (
                          <div
                            key={seg.index}
                            className="grid grid-cols-2 border-slate-200"
                          >
                            <div className="border-r border-slate-200 bg-red-50/30 px-4 py-3 text-sm text-slate-800">
                              <SegmentWithDictionary
                                source={seg.source}
                                dictionary={DEMO_DICTIONARY}
                                onHighlightDictionaryTerm={setScrollToDictionaryTerm}
                              />
                            </div>
                            <div className="bg-emerald-50/30 px-4 py-3 text-sm text-slate-800">
                              {(() => {
                                const target = translations.get(seg.index)?.target;
                                return target ? (
                                  <MarkdownText>{target}</MarkdownText>
                                ) : (
                                  <span className="italic text-slate-400">—</span>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {middleView === "editor" && (
                <SegmentEditor
                  segments={segments}
                  translations={translations}
                  dictionary={DEMO_DICTIONARY}
                  selectedIndex={selectedIndex}
                  onSelectSegment={setSelectedIndex}
                  onTranslationChange={handleTranslationChange}
                  onRequestAiTranslation={handleRequestAiTranslation}
                  onHighlightDictionaryTerm={setScrollToDictionaryTerm}
                  aiTranslatingSegmentIndex={aiTranslatingSegmentIndex}
                  userName={USER_NAME}
                />
              )}
            </div>

            {/* Middle column footer: summary in diff tab, thin info bar in editor tab */}
            <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-100 px-4 py-1.5 text-xs text-slate-600">
              {middleView === "diff" ? (
                <>
                  <span>
                    {segments.length === 0
                      ? "No segments"
                      : `${segments.length} segment${segments.length === 1 ? "" : "s"}`}
                  </span>
                  <span>
                    {segments.length > 0 &&
                      (() => {
                        const translated = segments.filter(
                          (s) =>
                            (translations.get(s.index)?.target ?? "").trim()
                              .length > 0
                        ).length;
                        const pct =
                          segments.length === 0
                            ? 0
                            : Math.round(
                                (translated / segments.length) * 100
                              );
                        return `${translated} / ${segments.length} translated (${pct}%)`;
                      })()}
                  </span>
                </>
              ) : selectedIndex === null ? (
                <span className="text-slate-400">Select a segment</span>
              ) : (
                <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span>
                    Segment #{selectedIndex + 1}
                    {segments.length > 0 && ` / ${segments.length}`}
                  </span>
                  <span>·</span>
                  <span>{documentName}</span>
                  {selectedTranslation ? (
                    <>
                      <span>·</span>
                      <span>
                        {selectedTranslation.changedBy}{" "}
                        {formatShortDate(selectedTranslation.changedOn)}
                      </span>
                      <span>·</span>
                      <span>
                        {selectedTranslation.origin === "translation_memory"
                          ? "TM"
                          : selectedTranslation.origin === "ai_suggested"
                            ? "AI"
                            : "Manual"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>·</span>
                      <span className="text-slate-400">No translation yet</span>
                    </>
                  )}
                </span>
              )}
            </footer>
          </div>
        </main>

        {/* Right: Fuzzy Matches, Multiple Translations — sticky */}
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Suggested terms
            </h2>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <GlossarySuggestions
              segmentSource={selectedSegment?.source ?? null}
              glossary={DEMO_GLOSSARY}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
