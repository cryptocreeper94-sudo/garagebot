import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
  showUpgrade?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function isAdFree(user: any): boolean {
  if (!user) return false;
  if (user.subscriptionTier === 'pro') return true;
  if (user.adFreeSubscription && (!user.adFreeExpiresAt || new Date(user.adFreeExpiresAt) > new Date())) return true;
  return false;
}

export function AdSense({ adSlot, adFormat = 'auto', className = '', style, showUpgrade = true }: AdSenseProps) {
  const { user } = useAuth();
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (!publisherId || isAdFree(user)) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [publisherId, user]);

  if (isAdFree(user)) return null;

  if (!publisherId) {
    if (import.meta.env.DEV) {
      return (
        <div
          className={`bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center ${className}`}
          style={style}
          data-testid="adsense-placeholder"
        >
          <p className="text-xs text-muted-foreground">
            Ad Placeholder - Set VITE_ADSENSE_PUBLISHER_ID to enable
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`relative ${className}`} data-testid={`adsense-container-${adSlot}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-testid="adsense-ad"
      />
      {showUpgrade && !isAdFree(user) && (
        <div className="mt-1 text-center" data-testid="ad-free-upgrade-prompt">
          <a
            href="/pro"
            className="text-[10px] text-muted-foreground/60 hover:text-cyan-400 transition-colors"
          >
            Remove ads for $5/mo
          </a>
        </div>
      )}
    </div>
  );
}

export function AdSenseHorizontal({ className = '' }: { className?: string }) {
  return (
    <AdSense
      adSlot="HORIZONTAL_AD_SLOT"
      adFormat="horizontal"
      className={className}
      style={{ minHeight: '90px' }}
    />
  );
}

export function AdSenseRectangle({ className = '' }: { className?: string }) {
  return (
    <AdSense
      adSlot="RECTANGLE_AD_SLOT"
      adFormat="rectangle"
      className={className}
      style={{ minHeight: '250px', minWidth: '300px' }}
    />
  );
}

export function AdSenseVertical({ className = '' }: { className?: string }) {
  return (
    <AdSense
      adSlot="VERTICAL_AD_SLOT"
      adFormat="vertical"
      className={className}
      style={{ minHeight: '600px', minWidth: '160px' }}
    />
  );
}
