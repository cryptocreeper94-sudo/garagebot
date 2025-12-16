import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';

const VISITOR_ID_KEY = 'gb_visitor_id';
const SESSION_ID_KEY = 'gb_session_id';

function generateVisitorId(): string {
  return 'v_' + crypto.randomUUID();
}

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getSessionId(): string | null {
  return sessionStorage.getItem(SESSION_ID_KEY);
}

function setSessionId(id: string): void {
  sessionStorage.setItem(SESSION_ID_KEY, id);
}

function getUTMParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

async function createSession(visitorId: string): Promise<string | null> {
  try {
    const utmParams = getUTMParams();
    const response = await fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        landingPage: window.location.pathname,
        ...utmParams,
      }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Failed to create analytics session:', error);
    return null;
  }
}

async function trackPageView(
  sessionId: string,
  visitorId: string,
  route: string,
  title: string
): Promise<void> {
  try {
    await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        visitorId,
        route,
        title: title || document.title,
        referrer: document.referrer || null,
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

export async function trackEvent(
  eventName: string,
  eventCategory?: string,
  eventLabel?: string,
  eventValue?: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getSessionId();
    
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        visitorId,
        eventName,
        eventCategory,
        eventLabel,
        eventValue,
        route: window.location.pathname,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export function useAnalytics() {
  const [location] = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string>(getOrCreateVisitorId());
  const lastPathRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  const initSession = useCallback(async () => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const existingSessionId = getSessionId();
    if (existingSessionId) {
      sessionIdRef.current = existingSessionId;
      return;
    }
    
    const newSessionId = await createSession(visitorIdRef.current);
    if (newSessionId) {
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (location === lastPathRef.current) return;
    lastPathRef.current = location;
    
    const trackCurrentPage = async () => {
      await initSession();
      
      if (sessionIdRef.current) {
        await trackPageView(
          sessionIdRef.current,
          visitorIdRef.current,
          location,
          document.title
        );
      }
    };
    
    const timeoutId = setTimeout(trackCurrentPage, 100);
    return () => clearTimeout(timeoutId);
  }, [location, initSession]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = getSessionId();
      if (sessionId) {
        navigator.sendBeacon(`/api/analytics/session/${sessionId}/end`, '');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    trackEvent,
    visitorId: visitorIdRef.current,
    sessionId: sessionIdRef.current,
  };
}

if (typeof window !== 'undefined') {
  (window as any).garagebotAnalytics = { trackEvent };
}
