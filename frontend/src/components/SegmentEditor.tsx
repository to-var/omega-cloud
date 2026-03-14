import type { Segment, SegmentTranslation } from "../types";
import type { DictionaryEntry } from "./SegmentWithDictionary";
import SegmentWithDictionary from "./SegmentWithDictionary";

interface Props {
  segments: Segment[];
  translations: Map<number, SegmentTranslation>;
  dictionary?: DictionaryEntry[];
  selectedIndex: number | null;
  onSelectSegment: (index: number) => void;
  onTranslationChange: (index: number, target: string) => void;
  onRequestAiTranslation?: (segmentIndex: number) => void;
  onHighlightDictionaryTerm?: (term: string | null) => void;
  aiTranslatingSegmentIndex?: number | null;
  userName?: string;
}

function formatSegmentDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function SegmentEditor({
  segments,
  translations,
  dictionary,
  selectedIndex,
  onSelectSegment,
  onTranslationChange,
  onRequestAiTranslation,
  onHighlightDictionaryTerm,
  aiTranslatingSegmentIndex = null,
  userName = "User",
}: Props) {
  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-slate-400">
        Loading document…
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Editor
        </h2>
      </div>
      <div className="flex-1 space-y-0 p-4">
        {segments.map((seg) => {
          const trans = translations.get(seg.index);
          const target = trans?.target ?? "";
          const isSelected = selectedIndex === seg.index;

          return (
            <div
              key={seg.index}
              onClick={() => onSelectSegment(seg.index)}
              className={`cursor-pointer rounded-lg border px-4 py-3 transition ${
                isSelected
                  ? "border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-200"
                  : "border-transparent bg-white hover:bg-slate-50"
              }`}
            >
              {/* Source + AI translate button (right) */}
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 text-sm font-medium text-slate-600">
                  <SegmentWithDictionary
                    source={seg.source}
                    dictionary={dictionary}
                    onHighlightDictionaryTerm={onHighlightDictionaryTerm}
                  />
                </div>
                {onRequestAiTranslation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestAiTranslation(seg.index);
                    }}
                    disabled={aiTranslatingSegmentIndex === seg.index}
                    title="Translate this segment with AI (uses suggested terms)"
                    className="flex shrink-0 items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-50"
                  >
                    {aiTranslatingSegmentIndex === seg.index ? (
                      <i className="fas fa-spinner fa-spin" aria-hidden />
                    ) : (
                      <i className="fas fa-wand-magic-sparkles" aria-hidden />
                    )}
                    <span>AI translate</span>
                  </button>
                )}
              </div>
              {/* Translation by ... on ... */}
              {trans && (
                <div className="mb-2 text-xs text-slate-400">
                  TRANSLATION by {trans.changedBy} on{" "}
                  {formatSegmentDate(trans.changedOn)}
                </div>
              )}
              {/* Editable target */}
              <textarea
                value={target}
                onChange={(e) => onTranslationChange(seg.index, e.target.value)}
                onFocus={() => onSelectSegment(seg.index)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter translation…"
                className="mb-2 w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={Math.max(2, target.split("\n").length + 1)}
              />
              <div className="text-xs text-slate-400">
                EDITED SEGMENT #{String(seg.index + 1).padStart(4, "0")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
