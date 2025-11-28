import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

async function fetchAuthUser(): Promise<User | null> {
  // Try custom auth first
  const customAuthRes = await fetch("/api/auth/me", { credentials: "include" });
  if (customAuthRes.ok) {
    const data = await customAuthRes.json();
    if (data.user) return data.user;
  }
  
  // Fall back to Replit OIDC
  const replitAuthRes = await fetch("/api/auth/user", { credentials: "include" });
  if (replitAuthRes.ok) {
    return await replitAuthRes.json();
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
    await refetch();
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
}
