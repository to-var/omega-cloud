import type { Match } from "../types";

interface Props {
  match?: Match;
}

export default function MatchBadge({ match }: Props) {
  if (!match) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        Pending
      </span>
    );
  }

  if (match.matchType === "exact") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        {match.confidence}% Exact
      </span>
    );
  }

  if (match.matchType === "fuzzy") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        {match.confidence}% Fuzzy
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
      No Match {match.aiSuggested && "· AI"}
    </span>
  );
}
