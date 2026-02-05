import { useEffect, useRef } from "react";

interface AdSenseSlotProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}


export default function AdSenseSlot({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  className = "",
  style
}: AdSenseSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.log("AdSense not loaded yet");
    }
  }, []);

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
