import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useAuthGate() {
  const { user } = useAuth();
  const { toast } = useToast();

  const requireAuth = useCallback((action: () => void, featureName?: string) => {
    if (user) {
      action();
      return;
    }
    
    toast({
      title: "Sign up to unlock this",
      description: featureName 
        ? `Create a free account to ${featureName}. It only takes a minute!` 
        : "Create a free account to access this feature. It only takes a minute!",
      variant: "destructive",
      duration: 5000,
    });
    
    sessionStorage.removeItem("garagebot_welcome_dismissed");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("garagebot:open-welcome"));
    }, 300);
  }, [user, toast]);

  return { requireAuth, isAuthenticated: !!user };
}
