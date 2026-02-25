# GarageBot Analytics Setup Handoff

## Overview

GarageBot has a **fully built, self-hosted analytics system** — no third-party analytics SDK is installed yet. The platform also supports **Google AdSense** for ad monetization and has a **full SEO management system**. This document explains how to activate and configure all analytics-related services.

---

## 1. Built-In Analytics (Already Live)

GarageBot tracks all visitor activity using a custom, privacy-first analytics system stored in the PostgreSQL database.

### What It Tracks
- **Sessions**: Visitor ID, IP hash (privacy-safe), user agent, browser, OS, device type, referrer, UTM params (source/medium/campaign), landing page
- **Page Views**: Route, page title, referrer, duration, scroll depth — linked to sessions
- **Custom Events**: Named events with category, label, numeric value, route, and arbitrary JSON metadata

### Database Tables
- `analytics_sessions` — One row per visitor session
- `analytics_page_views` — One row per page view, foreign key to sessions
- `analytics_events` — Custom event tracking (clicks, searches, conversions, etc.)

### Frontend Hook
The `useAnalytics()` hook in `client/src/hooks/useAnalytics.ts` auto-initializes on every page load. It:
1. Creates/resumes a session via `POST /api/analytics/session`
2. Tracks every route change via `POST /api/analytics/pageview`
3. Ends session on tab close via `POST /api/analytics/session/:id/end` (using `navigator.sendBeacon`)

To track custom events anywhere in the app:
```typescript
import { trackEvent } from '@/hooks/useAnalytics';

trackEvent('button_click', 'checkout', 'pro_upgrade', 49.99, { plan: 'annual' });
```

Or via the global window object:
```javascript
window.garagebotAnalytics.trackEvent('affiliate_click', 'vendor', 'autozone');
```

### Dashboard API Endpoints (All `GET`, no auth required currently)
| Endpoint | Description | Query Params |
|---|---|---|
| `/api/analytics/summary` | Total page views, unique visitors, sessions, avg duration, bounce rate | `?days=30` |
| `/api/analytics/realtime` | Currently active visitor count | — |
| `/api/analytics/traffic` | Page views and sessions grouped by date | `?days=30` |
| `/api/analytics/pages` | Top pages by view count | `?limit=10` |
| `/api/analytics/referrers` | Top referrer URLs | `?limit=10` |
| `/api/analytics/devices` | Device type breakdown (desktop/mobile/tablet) | — |
| `/api/analytics/browsers` | Browser breakdown (Chrome/Safari/Firefox/etc.) | — |
| `/api/analytics/geo` | Geographic breakdown by IP hash region | — |
| `/api/analytics/events` | Query tracked events | `?event=name&startDate=&endDate=` |

### Admin Dashboard UI
The `AnalyticsDashboard` component (`client/src/components/AnalyticsDashboard.tsx`) renders the full analytics dashboard with:
- Summary cards (page views, visitors, sessions, bounce rate, avg duration)
- Traffic trend line chart (Recharts)
- Top pages bar chart
- Device/browser pie charts
- Referrer breakdown
- SEO page management (CRUD for meta tags per route)

This component is used inside the Command Center admin panel.

---

## 2. Google AdSense (Ready to Activate)

### Current Status
AdSense is **fully coded but not active** — it needs a publisher ID.

### How to Activate
1. Get your AdSense publisher ID from [Google AdSense](https://www.google.com/adsense/) (format: `ca-pub-XXXXXXXXXX`)
2. Set the environment variable:
   ```
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
   ```
3. Replace the placeholder ad slot IDs in `client/src/components/AdSense.tsx`:
   - `HORIZONTAL_AD_SLOT` — for banner ads
   - `RECTANGLE_AD_SLOT` — for sidebar/inline ads
   - `VERTICAL_AD_SLOT` — for tall sidebar ads

### Ad Placement Rules (Already Enforced in Code)
- Ads are **hidden** for Pro subscribers and Ad-Free ($5/mo) subscribers
- Ads **never** appear on: Login, Signup, Checkout, SMS Consent pages
- Ads appear on: Dashboard, Search Results, DIY Guides, Blog, Break Room, Explore
- Each ad shows a small "Remove ads for $5/mo" upgrade link

### Components Available
- `<AdSense />` — Base component, configurable slot/format
- `<AdSenseHorizontal />` — 90px min height banner
- `<AdSenseRectangle />` — 300x250 rectangle
- `<AdSenseVertical />` — 160x600 skyscraper
- `<AdSenseSlot />` — Alternative slot component in `AdSenseSlot.tsx`

---

## 3. Google Analytics 4 (Not Yet Installed)

Google Analytics is **not currently installed**. To add it:

### Steps
1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add the GA4 script tag to `client/index.html` in the `<head>`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
4. Optionally set as an environment variable: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### Notes
- The built-in analytics system can run alongside GA4 — they don't conflict
- GA4 gives you Google's ecosystem (Search Console integration, audience insights, conversion tracking)
- The built-in system gives you raw data ownership and real-time queries in your own database

---

## 4. SEO Management System (Already Live)

### Database Table
`seo_pages` — Stores per-route SEO metadata:
- `route` (unique), `title`, `description`, `keywords`
- `ogTitle`, `ogDescription`, `ogImage` (Open Graph)
- `twitterTitle`, `twitterDescription`, `twitterImage` (Twitter Cards)
- `canonicalUrl`, `robots`, `isActive`

### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/seo/pages` | List all SEO page configs |
| `GET` | `/api/seo/pages/:id` | Get specific page config |
| `GET` | `/api/seo/route?route=/path` | Lookup by route |
| `POST` | `/api/seo/pages` | Create new page SEO config |
| `PUT` | `/api/seo/pages/:id` | Update page SEO config |
| `DELETE` | `/api/seo/pages/:id` | Delete page SEO config |

### Management UI
SEO pages are managed via the Analytics Dashboard (tab within Command Center). The UI supports creating, editing, and deleting SEO configs for any route.

---

## 5. Environment Variables Needed

| Variable | Purpose | Status |
|---|---|---|
| `VITE_ADSENSE_PUBLISHER_ID` | Google AdSense publisher ID | **Not set** — ads show placeholders in dev |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID | **Not set** — GA4 not installed |

---

## 6. Key Files Reference

| File | Purpose |
|---|---|
| `client/src/hooks/useAnalytics.ts` | Frontend analytics hook — auto page tracking + event API |
| `client/src/components/AnalyticsDashboard.tsx` | Full admin analytics dashboard UI (622 lines) |
| `client/src/components/AdSense.tsx` | AdSense ad components with subscriber gating |
| `client/src/components/AdSenseSlot.tsx` | Alternative AdSense slot component |
| `shared/schema.ts` | DB schema: `analyticsSessions`, `analyticsPageViews`, `analyticsEvents`, `seoPages` |
| `server/routes.ts` | API routes: `/api/analytics/*` (lines ~9662-9881), `/api/seo/*` (lines ~8544-8620) |
| `server/storage.ts` | Storage interface: all analytics CRUD + aggregation queries |
| `client/index.html` | Where GA4 script tag would be added |

---

## 7. Quick Start Checklist

- [ ] **Google AdSense**: Get publisher ID → set `VITE_ADSENSE_PUBLISHER_ID` → replace ad slot IDs in AdSense.tsx
- [ ] **Google Analytics 4**: Create GA4 property → add script tag to `client/index.html`
- [ ] **Built-in Analytics**: Already working — check `/api/analytics/summary` to verify data collection
- [ ] **SEO Pages**: Use Command Center → Analytics tab to configure meta tags per route
- [ ] **Ad-Free Tier**: Already coded — Pro and Ad-Free subscribers automatically see no ads
