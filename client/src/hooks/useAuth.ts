import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

async function fetchAuthUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.ok) {
    const data = await res.json();
    if (data.user) return data.user;
  }
  return null;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
}
