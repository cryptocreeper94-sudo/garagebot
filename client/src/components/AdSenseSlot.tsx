import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AdSenseSlotProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function isAdFree(user: any): boolean {
  if (!user) return false;
  if (user.subscriptionTier === 'pro') return true;
  if (user.adFreeSubscription && (!user.adFreeExpiresAt || new Date(user.adFreeExpiresAt) > new Date())) return true;
  return false;
}

export default function AdSenseSlot({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  className = "",
  style
}: AdSenseSlotProps) {
  const { user } = useAuth();
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || isAdFree(user)) return;
    initialized.current = true;

    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
    }
  }, [user]);

  if (isAdFree(user)) return null;

  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    return null;
  }

  return (
    <div className={className} data-testid={`adsense-slot-${adSlot}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style || { display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}
