import { useState } from "react";

interface Props {
  onLoad: (documentId: string) => void;
  isLoading: boolean;
}

function extractDocumentId(input: string): string {
  const match = input.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}

export default function DocumentInput({ onLoad, isLoading }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = extractDocumentId(value);
    if (docId) onLoad(docId);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste Google Doc ID or URL..."
        className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Load Segments"}
      </button>
    </form>
  );
}
