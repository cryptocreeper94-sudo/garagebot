import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSense({ adSlot, adFormat = 'auto', className = '', style }: AdSenseProps) {
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  
  useEffect(() => {
    if (!publisherId) return;
    
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [publisherId]);
  
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
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={publisherId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
      data-testid="adsense-ad"
    />
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
