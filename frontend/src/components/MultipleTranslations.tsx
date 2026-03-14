import type { Match } from "../types";

interface Props {
  match: Match | null;
  source: string | null;
}

/** Shows alternative translations for the current segment (OmegaT-style right pane). */
export default function MultipleTranslations({ match, source }: Props) {
  if (!source) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-xs text-slate-400">
        No segment selected.
      </div>
    );
  }

  if (!match?.target) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-xs text-slate-400">
        No translations.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      <div className="rounded border border-slate-200 bg-white p-2 text-xs shadow-sm">
        <div className="mb-1 font-medium text-slate-500">Translation</div>
        <div className="text-slate-800">{match.target}</div>
        <div className="mt-1 text-slate-400">
          {match.confidence}% · {match.matchType}
          {match.aiSuggested ? " · AI" : ""}
        </div>
      </div>
    </div>
  );
}
