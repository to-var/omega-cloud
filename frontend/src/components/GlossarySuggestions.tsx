export interface GlossaryEntry {
  source: string;
  target: string;
}

interface Props {
  segmentSource: string | null;
  glossary: GlossaryEntry[];
}

/** Returns glossary entries whose source term appears in the given segment text (case-insensitive). */
export function getSuggestionsForSegment(
  segmentSource: string,
  glossary: GlossaryEntry[]
): GlossaryEntry[] {
  const normalized = segmentSource.toLowerCase();
  return glossary.filter((entry) =>
    normalized.includes(entry.source.toLowerCase())
  );
}

/** Shows suggested glossary terms for the current segment based on its source text. */
export default function GlossarySuggestions({
  segmentSource,
  glossary,
}: Props) {
  if (!segmentSource?.trim()) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-xs text-slate-400">
        Select a segment to see suggested terms.
      </div>
    );
  }

  const suggestions = getSuggestionsForSegment(segmentSource, glossary);

  if (suggestions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-xs text-slate-400">
        No glossary terms match this segment.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      {suggestions.map((entry, i) => (
        <div
          key={i}
          className="rounded border border-slate-100 bg-white py-1.5 px-2 shadow-sm"
        >
          <div className="text-slate-800 font-medium">{entry.source}</div>
          <div className="mt-1 text-emerald-800">{entry.target}</div>
        </div>
      ))}
    </div>
  );
}
