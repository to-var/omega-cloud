import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import type { User } from "../types";

export function useAuth() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await client.get("/auth/me");
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/auth/login`;
  };

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user && !isError,
    login,
  };
}
