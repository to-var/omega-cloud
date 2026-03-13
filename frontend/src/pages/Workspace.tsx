import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useMatchSegments, useUploadTM } from "../hooks/useTM";
import DocumentInput from "../components/DocumentInput";
import SegmentList from "../components/SegmentList";
import MatchBadge from "../components/MatchBadge";
import type { Match, Segment } from "../types";

export default function Workspace() {
  const { user } = useAuth();
  const uploadTM = useUploadTM();
  const matchSegments = useMatchSegments();

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [tmId, setTmId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, Match>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: segments = [],
    isLoading: segmentsLoading,
    isError: segmentsError,
  } = useQuery<Segment[]>({
    queryKey: ["segments", documentId],
    queryFn: async () => {
      const res = await client.get(`/docs/${documentId}/segments`);
      return res.data;
    },
    enabled: !!documentId,
  });

  const handleLoadDoc = useCallback((docId: string) => {
    setDocumentId(docId);
    setSelectedIndex(null);
    setMatches(new Map());
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await uploadTM.mutateAsync(file);
      setTmId(result.tm_id);

      if (segments.length > 0) {
        const matchResult = await matchSegments.mutateAsync({
          segments,
          tm_id: result.tm_id,
        });
        const newMatches = new Map<number, Match>();
        matchResult.segments.forEach((sm) => newMatches.set(sm.index, sm.match));
        setMatches(newMatches);
      }
    },
    [segments, uploadTM, matchSegments]
  );

  const handleRunMatching = useCallback(async () => {
    if (!tmId || segments.length === 0) return;
    const matchResult = await matchSegments.mutateAsync({
      segments,
      tm_id: tmId,
    });
    const newMatches = new Map<number, Match>();
    matchResult.segments.forEach((sm) => newMatches.set(sm.index, sm.match));
    setMatches(newMatches);
  }, [tmId, segments, matchSegments]);

  const selectedMatch = selectedIndex !== null ? matches.get(selectedIndex) : undefined;
  const selectedSegment = segments.find((s) => s.index === selectedIndex);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            OmegaWeb
          </h1>
          {user && (
            <div className="flex items-center gap-3">
              {user.picture && (
                <img
                  src={user.picture}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-slate-600">{user.email}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="flex w-1/2 flex-col gap-4 overflow-y-auto border-r border-slate-200 p-6">
          <DocumentInput onLoad={handleLoadDoc} isLoading={segmentsLoading} />

          {/* TMX upload */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".tmx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadTM.isPending}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {uploadTM.isPending ? "Uploading..." : "Upload TMX"}
            </button>
            {tmId && (
              <span className="text-xs text-slate-400">
                TM loaded ({uploadTM.data?.unit_count} units)
              </span>
            )}
            {tmId && segments.length > 0 && (
              <button
                onClick={handleRunMatching}
                disabled={matchSegments.isPending}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {matchSegments.isPending ? "Matching..." : "Run Matching"}
              </button>
            )}
          </div>

          {segmentsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              Failed to load document segments. Check the document ID and try
              again.
            </div>
          )}

          <SegmentList
            segments={segments}
            matches={matches}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>

        {/* Right panel */}
        <div className="flex w-1/2 flex-col overflow-y-auto p-6">
          {selectedSegment ? (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Source Segment #{(selectedSegment.index + 1)}
                </h2>
                <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-800">
                  {selectedSegment.source}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedSegment.wordCount} words
                </p>
              </div>

              {selectedMatch ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Match Result
                    </h2>
                    <MatchBadge match={selectedMatch} />
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs font-medium text-slate-400">
                          Target Translation
                        </dt>
                        <dd className="mt-1 text-sm text-slate-800">
                          {selectedMatch.target || "—"}
                        </dd>
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <dt className="text-xs font-medium text-slate-400">
                            Confidence
                          </dt>
                          <dd className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedMatch.confidence}%
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-400">
                            Match Type
                          </dt>
                          <dd className="mt-1 text-sm text-slate-800 capitalize">
                            {selectedMatch.matchType}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-400">
                            AI Suggested
                          </dt>
                          <dd className="mt-1 text-sm text-slate-800">
                            {selectedMatch.aiSuggested ? "Yes" : "No"}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                  Upload a TMX file and run matching to see results.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-slate-400">
                Select a segment to view match details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
