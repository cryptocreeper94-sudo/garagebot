# Overview

GarageBot is a comprehensive parts aggregator platform designed to unify inventory from 104 retailers, enabling users to find the "Right Part. First Time. Every Engine." for all motorized vehicles and equipment, including a dedicated Motorized Hobby section. The platform offers advanced search, AI-powered recommendations, vehicle fleet management with VIN decoding, and integrated DIY repair guides. It features an e-commerce system with Stripe payments, a Genesis Hallmark NFT system, and a Pro "Founders Circle" subscription. The vision is to become the leading platform for casual users, professional mechanics, and hobby enthusiasts.

# User Preferences

## CRITICAL - ALWAYS CONFIRM BEFORE CHANGES
**STOP AND ASK before implementing ANY changes.** Jason often gives voice commands while busy (driving, etc.) and needs to review the plan before work begins. Never start coding until explicit approval is given. This applies to ALL tasks - no exceptions.

**Workflow:**
1. Summarize what you understood from the request
2. Confirm which project (GarageBot vs DarkWave Studios vs other)
3. Ask "Should I proceed with this?" and WAIT for response
4. Only begin work after receiving explicit "yes" or approval

## NEVER USE QUESTION BOXES
**Do NOT use the question box/choice UI.** Jason cannot easily respond to those. Always ask questions directly in the chat as plain text. No exceptions.

Preferred communication style: Simple, everyday language.

## Authentication Model (SSO Clarification)
- Each DarkWave app (GarageBot, Trust Layer, ORBIT, etc.) has its **own login form** — NOT redirect-based SSO.
- Trust Layer syncs credentials behind the scenes so users can use the same password across all DarkWave apps.
- GarageBot's WelcomeGate signup/login form is the correct approach. Do NOT redirect users to dwtl.io for login.
- Password policy (ecosystem-wide): 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: shadcn/ui on Radix UI, Tailwind CSS, "Deep Space / Future Forward" theme with electric cyan accents, custom fonts (Rajdhani, Inter, JetBrains Mono), dark palette, glow effects, 3D buttons, neon text.
- **State Management**: TanStack Query for server state, React Context for cart, custom `useAuth` hook.
- **Routing**: Wouter for client-side navigation.
- **Animation**: Framer Motion for UI animations, including Buddy AI mascot.

## Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with authentication middleware.
- **Session Management**: Express-session with PostgreSQL session store.
- **Authentication**: Custom PIN-based login (Name, Email, 8+ char PIN).

## AI Features (Buddy AI)
- **Core Service**: Unified AI assistant powered by OpenAI.
- **Capabilities**: Conversational AI with memory, intelligent part recommendations, AI-generated DIY repair guides, mechanic estimates, proactive vehicle alerts, part definitions, and AI symptom diagnosis engine.
- **Symptom Diagnosis**: Route `/diagnose` provides ranked diagnoses, required parts with vendor links, DIY difficulty, urgency, and estimated savings.

## Data Storage
- **Database**: PostgreSQL via Neon serverless driver.
- **ORM**: Drizzle ORM.
- **Core Tables**: Users, vehicles, vendors, deals, hallmarks, carts, orders, sessions, and affiliate tracking.

## Payment Processing
- **Provider**: Stripe, integrated with Elements React components and backend SDK.
- **Ad-Free Subscription**: $5/month tier.

## Ad Monetization
- **Google AdSense**: Ads for free users on Dashboard, Results, DIY Guides, Blog, Break Room; hidden for Pro/ad-free subscribers.
- **SEO Prerender for AdSense**: Server-side bot detection serves pre-rendered HTML with AdSense slots to crawlers.

## Search Functionality
- **Part Search Modal**: First-visit modal on Explore page (`/`) asking "What Are You Working On?" with vehicle/part fields, stored in localStorage to show once.
- **Part Search Banner**: Persistent compact search banner always visible on Explore page for return visitors.
- **Complete Assembly**: AI-powered "Complete This Assembly" section on Results page (`/results`). Uses GPT-4o-mini via `/api/ai/assembly-parts` to identify companion parts for any searched part (e.g., search "brake pads" and see rotors, hardware kit, brake cleaner). Collapsible card with selectable parts, importance badges (required/recommended/optional), estimated prices, and one-click search for each companion part.

## Build & Deployment
- **Development**: Client (Vite) and backend (tsx) development servers with HMR.
- **Production**: Vite for client, esbuild for server.
- **Deployment**: Replit Autoscale.

## DIY Repair Guides System
- **Content**: Comprehensive vehicle taxonomy, YouTube search queries, per-step video links, cross-industry terminology translation.

## Break Room Hub
- **Functionality**: A central hub (`/break-room`) with motorsports/automotive news, tools (Receipt/Document Scanner, Mileage Tracker, NHTSA Recall Checker, Maintenance Scheduler), community features (Speed Trap Alerts, Fuel Price Finder, Directories), and opportunities (CDL Schools & Trucking Programs).

## Parts Marketplace (Sell Your Parts)
- **Route**: `/parts-marketplace` for peer-to-peer selling.
- **Fee Structure**: Marketplace fee charged to buyer (10% for basic, 6% for Pro sellers), plus standard Stripe processing fees.
- **Checkout**: Stripe Checkout Sessions with line items for part, shipping, and marketplace fee.
- **Seller Requirements**: Basic or Pro subscription needed to list parts.

## Affiliate Strategy
- **Current**: Vehicle-aware search links to over 50 retailers, with 17 active affiliate integrations (Amazon Associates, eBay Partner Network, CJ Affiliate, ShareASale, Awin).

## Blockchain Verification
- **Purpose**: Tamper-proof verification of Genesis Hallmarks and Vehicle Passports on Solana blockchain.
- **Technology**: Solana network via Helius RPC and `@solana/web3.js` using SHA-256 hashing.

## Trust Layer Hallmark System
- **Genesis**: `GB-00000001` auto-seeded on boot with Trust Layer metadata (ecosystem, chain, SIG, Shells, parentGenesis TH-00000001, launchDate 2026-08-23).
- **Service**: `server/services/hallmarkService.ts` — `generateHallmark()`, `createTrustStamp()`, `seedGenesisHallmark()`, `verifyHallmark()`.
- **ID Format**: `GB-XXXXXXXX` (8-digit zero-padded), atomic counter in `hallmark_counter` table.
- **Trust Stamps**: Logged on auth-login, auth-register, purchase, affiliate events. Stored in `trust_stamps` table with SHA-256 hashing.
- **Multi-App Support**: Service supports multiple app identities (GarageBot=GB, TORQUE=TQ) with independent counters.
- **API**: `GET /api/hallmark/genesis` (public, `?app=torque` for TORQUE), `GET /api/hallmark/genesis/torque` (TORQUE-specific), `GET /api/hallmark/:id/verify` (public, works for any app prefix).
- **Frontend**: `GenesisHallmarkBadge` in Footer — clickable badge opens modal with app info, blockchain record, ecosystem details.

## Ecosystem Affiliate System (SIG-based)
- **Separate from inbound affiliate program** (GB-XXXXXX PayPal system remains intact).
- **Referral Links**: `https://garagebot.io/ref/[uniqueHash]` — uniqueHash generated on registration, stored in `users.unique_hash`.
- **Tiers**: Base 10% (0 refs), Silver 12.5% (5), Gold 15% (15), Platinum 17.5% (30), Diamond 20% (50) — all in SIG.
- **Min Payout**: 10 SIG.
- **API**: `GET /api/ecosystem-affiliate/dashboard`, `GET /api/ecosystem-affiliate/link`, `POST /api/ecosystem-affiliate/track` (public), `POST /api/ecosystem-affiliate/request-payout`.
- **Frontend**: `ShareAndEarnCard` on Dashboard, `/ref/:hash` route in App.tsx tracks + redirects.
- **Tables**: `ecosystem_affiliate_referrals`, `ecosystem_affiliate_commissions`.

## Member Referral Program
- **System**: Points-based system rewarding signups and Pro conversions, redeemable for Pro membership tiers.

## TORQUE - Shop Management OS
- **Routes**: `/torque` (landing), `/torque/onboard` (5-step setup), `/torque/app` (shop dashboard).
- **Branding**: "TORQUE — Shop Management OS powered by Trust Layer" with blockchain-verified shop identities.
- **Blockchain Identity**: Separate genesis hallmark `TQ-00000001`, own counter (`tq-master`), own verification endpoint. TORQUE is a distinct app in the Trust Layer ecosystem (prefix TQ, #23 in registry).
- **PWA**: Standalone PWA with custom manifest, icons, and splash screen.
- **Landing Page**: Premium UI with bento grid, testimonial carousel, FAQ, animated counters, parallax, PWA install prompt.
- **Onboarding**: 5-step setup flow.

## Partner API System
- **Purpose**: B2B API access for TORQUE shops with API Key + Secret authentication, granular scopes, and rate limiting.

## Ecosystem API v1
- **Route prefix**: `/api/ecosystem/v1/`.
- **Purpose**: Trust Layer JWT-authenticated API for cross-ecosystem app integration.
- **Auth**: Bearer token using shared Trust Layer SSO JWT.
- **Endpoints**: `GET /equipment`, `GET /equipment/:id`, `GET /maintenance-alerts`, `POST /equipment`, `PATCH /equipment/:id`.
- **Rate Limits**: 120/min per Trust Layer ID, 10,000/day.

## Weather Radar System
- **Integration**: Leaflet map and RainViewer radar tiles with NOAA Weather Alerts API.

## CDL & Trucking Company Directory
- **Functionality**: Portable directory (`/cdl-directory`) with search, filter, and interest forms.

## Signal Chat (Community Messaging)
- **Route**: `/chat` — Full-featured community chat with WebSocket layer, REST API, and `CommunityHubService`.
- **Trust Layer SSO**: Cross-app identity via JWT tokens.
- **Frontend**: SignalChat page with real-time messaging, Deep Space themed UI.
- **Buddy AI Bot**: Auto-responds in `#garagebot-support` channel using OpenAI GPT-4o-mini.

## Shade Tree Mechanics (DIY Community)
- **Purpose**: Community hub (`/shade-tree`) for DIY enthusiasts with categorized repair guides, tips, and estimated savings.

## Marketing Hub & Social Media Integration
- **GarageBot Marketing Hub** (`/marketing-hub`): Auto-posting to Facebook (GarageBot.io page) every 3 hours via Meta Graph API.
- **Meta Ads Campaigns**: Manages paid ad campaigns via Meta Marketing API with configurable targeting.
- **Analytics**: Tracks top-performing content and provides insights from Meta Graph API.

## OEM Parts
- **Route**: `/oem-parts` — Full OEM genuine parts directory page with 12+ manufacturer brands.
- **Layout**: Premium bento grid header, 3-column partner cards, parts category carousel, OEM vs aftermarket comparison, warranty section, FAQ, bottom CTA.

## Rental Cars
- **Route**: `/rentals` — Full rental car comparison page with partners like Carla Car Rental, Expedia, and Hotels.com.

# External Dependencies

## Third-Party Services
- **Authentication**: Replit OIDC service.
- **Database**: Neon PostgreSQL.
- **Payments**: Stripe.
- **AI**: OpenAI GPT-4.
- **Blockchain**: Solana (via Helius API).
- **Weather Radar**: RainViewer API, NOAA Weather Alerts API.
- **ORBIT Staffing OS**: `https://orbitstaffing.io` for payroll, staffing, and bookkeeping integration, handling revenue reporting.
- **Meta Graph API**: For Facebook auto-posting and ad campaign management.

## Unified Business Integrations Hub
- **Purpose**: Allows TORQUE shops to connect existing business software via OAuth.
- **Supported Integrations**:
    - **Accounting**: QuickBooks Online, FreshBooks, Xero, Sage Business Cloud, Wave Accounting.
    - **Payroll/HR**: UKG Pro, ADP Workforce Now, Gusto, Paychex Flex.
    - **Scheduling/Communication**: Google Calendar, Twilio, Mailchimp.
    - **Parts/Inventory**: PartsTech, Nexpart.

## Inbound Affiliate Program (GB-XXXXXX)
- **Route**: `/affiliates` — Full affiliate program page with enrollment, dashboard, and Trust Layer handoff.
- **Commission Rules**: 10% of GarageBot's affiliate commission, $5 one-time Pro conversion bonus, $2/month recurring per active Pro referral.
- **Thresholds**: $100 total referred purchase, $20 minimum payout.
- **Payouts**: PayPal, admin-approved.
- **Trust Layer**: Handoff endpoint at `/api/affiliate-program/trustlayer/:code`.