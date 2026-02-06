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

## Break Room Hub
- **Route**: `/break-room`
- **Component**: `client/src/pages/BreakRoom.tsx`
- **Service**: `server/services/breakRoomService.ts`
- **Features** (organized in 4 tabs):
  - **News Tab**: Categorized motorsports/auto news with stacked carousels (NASCAR, F1, MotoGP, Off-Road, Trucking, Marine, Classic Cars, EV/Electric, Aviation, General). 60+ curated articles with curated data.
  - **Tools Tab**: Receipt/Document Scanner (OpenAI Vision OCR), Mileage Tracker (business miles for tax deductions), NHTSA Recall Checker (free public API), Maintenance Scheduler (links to Garage).
  - **Community Tab**: Speed Trap Alerts (community-reported), Fuel Price Finder (community-reported), Specialty Shops & Salvage Yards Directory (seeded with 10 shops), Car Shows & Events Finder (seeded with 10 events).
  - **Opportunities Tab**: CDL Schools & Trucking Programs directory (seeded with 10 programs including Werner, Swift, Schneider, CRST, Roehl, Prime, flight schools, marine/heavy equipment training), interest/referral forms for lead generation.
- **Database Tables**: `mileage_entries`, `speed_traps`, `specialty_shops`, `car_events`, `cdl_programs`, `cdl_referrals`, `fuel_reports`, `scanned_documents`
- **API Prefix**: `/api/break-room/*` (news, recalls, scan, mileage, speed-traps, specialty-shops, events, cdl-programs, cdl-referrals, fuel, scans)

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

## Shade Tree Mechanics (DIY Community)
- **Component**: `client/src/pages/ShadeTreeMechanics.tsx`
- **Route**: `/shade-tree`
- **Features**:
  - DIY repair guides with difficulty levels (beginner, intermediate, advanced)
  - Vehicle type filters (cars, trucks, boats, ATVs)
  - Category filters (maintenance, repairs, diagnostics, upgrades, tips)
  - Community tips section
  - Estimated time and money savings per guide
  - Search functionality for guides

## Marketing Hub & Social Media Integration
- **Service File**: `server/services/socialMedia.ts`
- **Component**: `client/src/pages/MarketingHub.tsx`
- **Tenant-Spaced**: Marketing Hub is a premium add-on for Mechanics Garage shops ($29-99/mo)
- **Platforms Supported**: X/Twitter, Facebook, Instagram, LinkedIn, Google Business, Nextdoor
- **Shop-Specific API Endpoints**:
  - `GET /api/shop/:shopId/marketing/subscription` - Check subscription status
  - `GET /api/shop/:shopId/marketing/integrations` - Shop's connected platforms
  - `GET /api/shop/:shopId/marketing/content` - Shop's marketing content
  - `POST /api/shop/:shopId/marketing/content` - Create content
  - `POST /api/shop/:shopId/marketing/subscribe` - Subscribe to Marketing Hub
- **Database Tables**: `marketing_hub_subscriptions`, `shop_social_credentials`, `shop_marketing_content`
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

## QuickBooks Integration
- **Service File**: `server/services/quickbooks.ts`
- **Features**: OAuth flow for connecting shops to QuickBooks Online
- **Endpoints**:
  - `GET /api/quickbooks/status` - Check if integration is configured
  - `GET /api/quickbooks/connect/:shopId` - Start OAuth flow
  - `GET /api/quickbooks/callback` - Handle OAuth callback
- **Environment Variables**: `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`
- **Capabilities**: Sync repair orders to invoices, customer management

## PartsTech Integration
- **Service File**: `server/services/partstech.ts`
- **Features**: Real-time parts ordering from 20,000+ retailers
- **Endpoints**:
  - `GET /api/partstech/status` - Check if integration is configured
  - `POST /api/partstech/search` - Search parts with vehicle fitment
- **Environment Variables**: `PARTSTECH_API_KEY`
- **Capabilities**: Parts search, inventory check, VIN decode, order placement

## Mechanics Garage Sales Page
- **Component**: `client/src/pages/MechanicsGarageSales.tsx`
- **Route**: `/mechanics-garage/info`
- **Features**:
  - Interactive slideshow showcasing features
  - Feature comparison table vs competitors ($49/mo vs $179/mo)
  - Customer testimonials
  - Request information form (emails to jason@darkwavestudios.io)

## Key NPM Packages
- **UI/Frontend**: `@radix-ui/*`, `tailwindcss`, `framer-motion`, `wouter`, `@tanstack/react-query`, `@stripe/react-stripe-js`, `react-leaflet`, `leaflet`
- **Backend**: `express`, `drizzle-orm`, `@neondatabase/serverless`, `stripe`, `openai`, `express-session`, `passport`, `connect-pg-simple`, `@solana/web3.js`
- **Build Tools**: `vite`, `esbuild`, `tsx`