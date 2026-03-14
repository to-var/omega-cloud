import type { Match } from "../types";

interface Props {
  match: Match | null;
  source: string | null;
  /** Called when user clicks Insert to apply the fuzzy/TM target to the segment. */
  onInsert?: (target: string) => void;
}

/** Shows TM match (exact/fuzzy) for the selected segment. Insert button applies it to the segment. */
export default function FuzzyMatches({ match, source, onInsert }: Props) {
  const hasMatch = match?.matchType === "fuzzy" || match?.matchType === "exact";
  const insertableTarget = (match?.target ?? "").trim();

  if (!source) {
    return (
      <div className="flex h-full min-h-[4rem] items-center justify-center p-3 text-xs text-slate-400">
        Select a segment to see TM or fuzzy match.
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex h-full min-h-[4rem] items-center justify-center p-3 text-xs text-slate-400">
        No TM selected or run matching first.
      </div>
    );
  }

  if (!hasMatch && !insertableTarget) {
    return (
      <div className="space-y-2 p-3">
        <div className="rounded border border-slate-200 bg-slate-50/50 p-2 text-xs">
          <div className="mb-1 font-medium text-slate-500">Source</div>
          <div className="text-slate-800">{source}</div>
          <div className="mt-2 font-medium text-slate-500">Target</div>
          <div className="text-slate-400">No match in TM.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      <div className="rounded border border-slate-200 bg-slate-50/50 p-2 text-xs">
        <div className="mb-1 font-medium text-slate-500">Source</div>
        <div className="text-slate-800">{source}</div>
        <div className="mt-2 font-medium text-slate-500">Target</div>
        <div className="text-slate-800">{match.target ?? "—"}</div>
        <div className="mt-1 text-slate-400">
          {hasMatch ? `${match.confidence}% ${match.matchType}` : "No match"}
        </div>
        {insertableTarget && onInsert && (
          <button
            type="button"
            onClick={() => onInsert(match!.target ?? "")}
            className="mt-2 w-full rounded bg-emerald-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
          >
            Insert into segment
          </button>
        )}
      </div>
    </div>
  );
}
