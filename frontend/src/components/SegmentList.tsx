import type { Match, Segment } from "../types";
import MatchBadge from "./MatchBadge";

interface Props {
  segments: Segment[];
  matches: Map<number, Match>;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function SegmentList({
  segments,
  matches,
  selectedIndex,
  onSelect,
}: Props) {
  if (segments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        Load a Google Doc to see segments here.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
      {segments.map((seg) => {
        const match = matches.get(seg.index);
        const isSelected = selectedIndex === seg.index;

        return (
          <button
            key={seg.index}
            onClick={() => onSelect(seg.index)}
            className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50 ${
              isSelected ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="mr-2 inline-block text-xs font-medium text-slate-400">
                #{seg.index + 1}
              </span>
              <span className="text-sm text-slate-700">{seg.source}</span>
              <span className="ml-2 text-xs text-slate-400">
                {seg.wordCount}w
              </span>
            </div>
            <MatchBadge match={match} />
          </button>
        );
      })}
    </div>
  );
}
