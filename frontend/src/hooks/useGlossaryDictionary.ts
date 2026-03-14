import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export interface GlossaryEntry {
  source: string;
  target: string;
  target_language?: string;
}

export interface DictionaryEntry {
  term: string;
  definition: string;
  target_language?: string;
}

interface GlossaryResponse {
  entries: GlossaryEntry[];
}

interface DictionaryResponse {
  entries: DictionaryEntry[];
}

export function useGlossary(targetLanguage: string | null) {
  return useQuery<GlossaryResponse>({
    queryKey: ["glossary", targetLanguage],
    queryFn: async () => {
      const params = targetLanguage ? { target_language: targetLanguage } : {};
      const res = await client.get("/glossary", { params });
      return res.data;
    },
  });
}

export function useDictionary(targetLanguage: string | null) {
  return useQuery<DictionaryResponse>({
    queryKey: ["dictionary", targetLanguage],
    queryFn: async () => {
      const params = targetLanguage ? { target_language: targetLanguage } : {};
      const res = await client.get("/dictionary", { params });
      return res.data;
    },
  });
}
