import type { SegmentTranslation } from "../types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
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

interface Props {
  fileName: string;
  segmentIndex: number | null;
  translation: SegmentTranslation | null;
}

export default function SegmentProperties({
  fileName,
  segmentIndex,
  translation,
}: Props) {
  if (segmentIndex === null || !translation) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-slate-400">
        Select a segment to view properties.
      </div>
    );
  }

  const rows: { name: string; value: string }[] = [
    { name: "File", value: fileName },
    { name: "Changed on", value: formatDate(translation.changedOn) },
    { name: "Changed by", value: translation.changedBy },
    { name: "Created on", value: formatDate(translation.createdOn) },
    { name: "Created by", value: translation.createdBy },
    {
      name: "Origin",
      value:
        translation.origin === "translation_memory"
          ? "Translation Memory"
          : translation.origin === "ai_suggested"
            ? "AI Suggested"
            : "Unknown (Manual)",
    },
  ];

  return (
    <div className="overflow-auto p-3">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-slate-100">
              <td className="py-1.5 pr-4 font-medium text-slate-500">
                {row.name}
              </td>
              <td className="py-1.5 text-slate-800">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
