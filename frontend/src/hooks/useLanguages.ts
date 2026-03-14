import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export interface LanguageItem {
  code: string;
  name: string;
}

interface LanguagesResponse {
  items: LanguageItem[];
}

/** Supported target languages from the API (single source of truth with backend). */
export function useLanguages() {
  return useQuery<LanguagesResponse>({
    queryKey: ["languages"],
    queryFn: async () => {
      const res = await client.get("/languages");
      return res.data;
    },
  });
}
