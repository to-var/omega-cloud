import type { Match } from "../types";

interface Props {
  match: Match | null;
  source: string | null;
}

/** Shows fuzzy matches for the current segment (OmegaT-style right pane). */
export default function FuzzyMatches({ match, source }: Props) {
  const isFuzzy = match?.matchType === "fuzzy" || match?.matchType === "exact";

  if (!source) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-xs text-slate-400">
        No segment selected.
      </div>
    );
  }

  if (!match || !isFuzzy) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-xs text-slate-400">
        No fuzzy matches.
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
          {match.confidence}% {match.matchType}
        </div>
      </div>
    </div>
  );
}
