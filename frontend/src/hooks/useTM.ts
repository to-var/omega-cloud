import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../api/client";
import type { MatchResponse, Segment, TMListItem } from "../types";

export function useExtractSegments() {
  return useMutation<Segment[], Error, string>({
    mutationFn: async (text: string) => {
      const res = await client.post("/docs/segments", { text });
      return res.data;
    },
  });
}

export function useTMs(targetLanguage: string | null) {
  return useQuery<{ items: TMListItem[] }>({
    queryKey: ["tms", targetLanguage],
    queryFn: async () => {
      const params = targetLanguage ? { target_language: targetLanguage } : {};
      const res = await client.get("/tm", { params });
      return res.data;
    },
  });
}

export function useMatchSegments() {
  return useMutation<
    MatchResponse,
    Error,
    { segments: Segment[]; tm_id: string }
  >({
    mutationFn: async ({ segments, tm_id }) => {
      const res = await client.post("/tm/match", { segments, tm_id });
      return res.data;
    },
  });
}
