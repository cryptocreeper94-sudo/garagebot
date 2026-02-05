import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const state = params.get("state");

      if (!token) {
        setStatus("error");
        setError("No authentication token received");
        return;
      }

      try {
        const res = await fetch(`/api/auth/sso/callback?token=${encodeURIComponent(token)}&state=${encodeURIComponent(state || "")}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          setError(data.error || "Authentication failed");
          return;
        }

        setStatus("success");
        setTimeout(() => setLocation("/"), 1500);
      } catch (err) {
        setStatus("error");
        setError("Connection error. Please try again.");
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-card/50 border-primary/20">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-tech font-bold uppercase text-primary mb-2">
              Authenticating...
            </h2>
            <p className="text-muted-foreground text-sm">
              Verifying your Trust Layer credentials
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-tech font-bold uppercase text-green-400 mb-2">
              Welcome to GarageBot!
            </h2>
            <p className="text-muted-foreground text-sm">
              Redirecting you to the dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-tech font-bold uppercase text-red-400 mb-2">
              Authentication Failed
            </h2>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <a
              href="/auth"
              className="text-primary hover:underline text-sm"
            >
              Try again
            </a>
          </>
        )}
      </Card>
    </div>
  );
}
