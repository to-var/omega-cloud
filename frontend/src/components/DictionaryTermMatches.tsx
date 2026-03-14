export interface DictionaryEntry {
  term: string;
  definition: string;
}

interface Props {
  segmentSource: string | null;
  dictionary: DictionaryEntry[];
}

/** Returns dictionary entries whose term appears in the given segment text (case-insensitive). */
export function getDictionaryMatchesForSegment(
  segmentSource: string,
  dictionary: DictionaryEntry[]
): DictionaryEntry[] {
  const normalized = segmentSource.toLowerCase();
  return dictionary.filter((entry) =>
    normalized.includes(entry.term.toLowerCase())
  );
}

/** Shows dictionary term matches for the current segment (term + definition). */
export default function DictionaryTermMatches({
  segmentSource,
  dictionary,
}: Props) {
  if (!segmentSource?.trim()) {
    return (
      <div className="flex h-full min-h-[4rem] items-center justify-center p-3 text-xs text-slate-400">
        Select a segment to see dictionary term matches.
      </div>
    );
  }

  const matches = getDictionaryMatchesForSegment(segmentSource, dictionary);

  if (matches.length === 0) {
    return (
      <div className="flex h-full min-h-[4rem] items-center justify-center p-3 text-xs text-slate-400">
        No dictionary term matches for this segment.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      {matches.map((entry, i) => (
        <div
          key={i}
          className="rounded border border-slate-100 bg-white py-1.5 px-2 shadow-sm"
        >
          <div className="font-medium text-slate-800">{entry.term}</div>
          <div className="mt-1 text-slate-600 text-xs">{entry.definition}</div>
        </div>
      ))}
    </div>
  );
}
