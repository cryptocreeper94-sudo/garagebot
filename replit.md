# Overview

GarageBot is a comprehensive auto parts aggregator platform unifying inventory from over 40 retailers into a single searchable interface. It aims to provide the "Right Part. First Time. Every Engine." across all vehicle types (cars, trucks, RVs, boats, ATVs, motorcycles).

Key capabilities include:
- Unifying parts search from 40+ retailers.
- Vehicle fleet management with VIN decoding.
- AI-powered part recommendations and DIY repair guides.
- Vehicle-aware affiliate search links for guaranteed fitment.
- Shopping cart with Stripe payments.
- Genesis Hallmark NFT system for early adopters on Solana.
- Pro "Founders Circle" subscription for enhanced features.

# User Preferences

## CRITICAL - ALWAYS CONFIRM BEFORE CHANGES
**STOP AND ASK before implementing ANY changes.** Jason often gives voice commands while busy (driving, etc.) and needs to review the plan before work begins. Never start coding until explicit approval is given. This applies to ALL tasks - no exceptions.

**Workflow:**
1. Summarize what you understood from the request
2. Confirm which project (GarageBot vs DarkWave Studios vs other)
3. Ask "Should I proceed with this?" and WAIT for response
4. Only begin work after receiving explicit "yes" or approval

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript, Vite.
- **UI Components**: shadcn/ui on Radix UI primitives, styled with Tailwind CSS. Theme is "Deep Space / Future Forward" with electric cyan accents, custom fonts (Rajdhani, Inter, JetBrains Mono), and a dark palette. Custom CSS for UI effects (glows, 3D buttons, neon text).
- **State Management**: TanStack Query for server state, React Context for cart, custom `useAuth` hook.
- **Routing**: Wouter for client-side routing.
- **Animation**: Framer Motion for UI animations, including the Buddy AI mascot.

## Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with authentication middleware.
- **Session Management**: Express-session with PostgreSQL session store.
- **Authentication**: Custom PIN-based login (Name + Email + secure 8+ character PIN with uppercase, lowercase, and special character requirements). Auth page at /auth.

## AI Features (Buddy AI)
- **Service**: Unified AI assistant powered by OpenAI.
- **Capabilities**: Chat with memory, smart part recommendations, AI-generated DIY repair guides, mechanic estimates, proactive alerts, and part definitions.

## Data Storage
- **Database**: PostgreSQL via Neon serverless driver.
- **ORM**: Drizzle ORM for type-safe queries.
- **Core Tables**: Users, vehicles, vendors, deals, hallmarks, carts, orders, sessions.
- **Affiliate Tracking**: Tables for affiliate networks, partners, clicks, commissions, and payouts.

## Payment Processing
- **Provider**: Stripe for credit card payments using Stripe Elements React components and backend SDK.

## Build & Deployment
- **Development**: Client (Vite) and backend (tsx) dev servers with HMR.
- **Production Build**: Vite for client, esbuild for server.
- **Deployment**: Replit Autoscale deployment.

## DIY Repair Guides System
- **Taxonomy**: Comprehensive vehicle taxonomy across 18 categories.
- **Content**: Each guide includes YouTube search queries for video alternatives and per-step video links.
- **Translation**: Cross-industry terminology translation for part names.

## Affiliate Strategy
- **Current**: Vehicle-aware search links to 40+ retailers.
- **Future**: Product data feeds from affiliate networks and direct APIs with retailers for real-time inventory.

## Blockchain Verification
- **Purpose**: Tamper-proof verification of Genesis Hallmarks and Vehicle Passports on the Solana blockchain.
- **Technology**: Solana network via Helius RPC, `@solana/web3.js`.
- **Features**: SHA-256 hashing, on-chain transaction submission, Solscan links. Auto-verification for releases. Customer data hashing is opt-in.

## Member Referral Program
- **Features**: Points-based system for user signups and Pro conversions. Redemption for Pro membership tiers.
- **Database**: `referral_invites`, `referral_point_transactions`, `referral_redemptions`.

## Release Version Control System
- **Features**: Draft → Publish workflow, timestamped releases, categorized changelogs. Optional blockchain verification.

## ORBIT Staffing Ecosystem Integration
- **Hub URL**: https://orbitstaffing.io
- **App ID**: GarageBot (registered in ORBIT Staffing Ecosystem Hub)
- **Service File**: `server/services/orbitEcosystem.ts`
- **Environment Variables**: 
  - `ORBIT_HUB_URL` - Hub base URL
  - `ORBIT_ECOSYSTEM_API_KEY` - API key for authentication
  - `ORBIT_ECOSYSTEM_API_SECRET` - API secret for authentication  
  - `GARAGEBOT_WEBHOOK_SECRET` - Secret for verifying incoming webhooks
- **Integration Points**:
  - Shop creation → Syncs shop owner as contractor to ORBIT
  - Repair order completion → Reports job/timesheet to ORBIT
  - Pro subscription payment → Reports revenue event to ORBIT
- **API Endpoints**:
  - `GET /api/orbit/status` - Check ORBIT connection status
  - `POST /api/orbit/test-sync` - Test contractor sync (authenticated)
- **Permissions**: read/write for workers, contractors, 1099, timesheets, certifications, and code

## Trust Layer Gateway Integration
- **Gateway URL**: https://tlid.io
- **App Name**: GarageBot
- **Service File**: `server/services/trustLayer.ts`
- **Environment Variables**:
  - `TRUST_LAYER_URL` - Gateway base URL
  - `TRUST_LAYER_ENTRY_POINT` - App name for X-App-Name header
- **Self-Service Endpoints** (no credentials needed):
  - `GET /api/ecosystem/connection` - App details, endpoints, headers, sites list
  - `GET /api/ecosystem/status` - Test connection with X-App-Name header
- **API Endpoints**:
  - `GET /api/trust-layer/status` - Check Trust Layer configuration
  - `GET /api/trust-layer/connection` - Fetch ecosystem connection info
  - `GET /api/trust-layer/domains/resolve/:subdomain` - Resolve .tlid subdomain
  - `GET /api/trust-layer/domains/check/:name` - Check domain availability

## Partner API System
- **Purpose**: B2B API access for Mechanics Garage shops.
- **Security**: API Key + Secret authentication with SHA-256 hashing, granular scopes, and rate limiting.
- **Endpoints**: `/shop`, `/orders`, `/appointments`, `/customers`, `/estimates`, `/analytics`, `/locations`, `/usage`.

## Weather Radar System
- **Component**: `WeatherRadar.tsx` using Leaflet map and RainViewer radar tiles for precipitation.
- **Alerts**: NOAA Weather Alerts API for severe weather warnings.
- **Features**: Animated radar, layer controls, fullscreen mode, mobile-responsive design, ZIP persistence.

## Marketing Hub & Social Media Integration
- **Service File**: `server/services/socialMedia.ts`
- **Component**: `client/src/pages/MarketingHub.tsx`
- **Platforms Supported**: X/Twitter, Facebook, Instagram, LinkedIn, Google Business, Nextdoor
- **Features**:
  - DAM (Digital Asset Management) with quality/season/style/subject filtering
  - Content bundles pairing images with messages
  - Calendar view for visual scheduling
  - Analytics dashboard with engagement metrics
  - Paid ads management with budget ranges and audience targeting
  - AI content generation via OpenAI GPT-4o
  - Character limit validation per platform
- **Environment Variables Required**:
  - X/Twitter: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`
  - Facebook: `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID`
  - Instagram: `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`
  - LinkedIn: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID`
  - Google Business: `GOOGLE_BUSINESS_ACCESS_TOKEN`, `GOOGLE_BUSINESS_LOCATION_ID`
  - Nextdoor: `NEXTDOOR_API_KEY`, `NEXTDOOR_AGENCY_ID`
- **API Endpoints**:
  - `GET /api/marketing/integrations` - Check connection status for all platforms
  - `POST /api/marketing/post-now` - Post to selected platforms immediately
  - `POST /api/marketing/generate` - AI-generate marketing content
  - `GET /api/marketing/bundles` - List content bundles
  - `POST /api/marketing/bundles` - Create new bundle
- **Auto-Schedule**: Posts at 8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm daily (when credentials configured)

## Version Constraints
- **React**: ^18.3.1
- **framer-motion**: ^11.15.0
- **@tanstack/react-query**: ^5.60.5

# External Dependencies

## Third-Party Services
- **Authentication**: Replit OIDC service
- **Database**: Neon PostgreSQL
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Blockchain**: Solana (via Helius API)
- **Weather Radar**: RainViewer API, NOAA Weather Alerts API
- **ORBIT Ecosystem**: ORBIT Staffing Ecosystem Hub (orbitstaffing.io)

## Key NPM Packages
- **UI/Frontend**: `@radix-ui/*`, `tailwindcss`, `framer-motion`, `wouter`, `@tanstack/react-query`, `@stripe/react-stripe-js`, `react-leaflet`, `leaflet`
- **Backend**: `express`, `drizzle-orm`, `@neondatabase/serverless`, `stripe`, `openai`, `express-session`, `passport`, `connect-pg-simple`, `@solana/web3.js`
- **Build Tools**: `vite`, `esbuild`, `tsx`