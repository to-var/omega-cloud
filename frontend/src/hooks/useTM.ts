import { useMutation } from "@tanstack/react-query";
import client from "../api/client";
import type { MatchResponse, Segment, UploadResponse } from "../types";

export function useUploadTM() {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await client.post("/tm/upload", formData);
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
