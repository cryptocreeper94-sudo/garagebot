# Overview

GarageBot is a comprehensive auto parts aggregator platform unifying inventory from over 40 retailers into a single searchable interface. It enables users to search for parts across all vehicle types, including cars, trucks, RVs, boats, ATVs, motorcycles, and more. The platform aims to provide the "Right Part. First Time. Every Engine."

Key capabilities include:
- Unifying parts search from 40+ retailers.
- Vehicle fleet management with VIN decoding.
- AI-powered part recommendations and DIY repair guides.
- Vehicle-aware affiliate search links for guaranteed fitment.
- Shopping cart with Stripe payments.
- Genesis Hallmark NFT system for early adopters.
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
- **UI Components**: shadcn/ui on Radix UI primitives, styled with Tailwind CSS. "Deep Space / Future Forward" theme with electric cyan accents, custom fonts (Rajdhani, Inter, JetBrains Mono), and dark palette.
- **UI Effects**: Custom CSS classes for hover glows, 3D buttons, card lifts, neon text, and animated pulsing glows.
- **State Management**: TanStack Query for server state, React Context for cart, custom `useAuth` hook for authentication.
- **Routing**: Wouter for client-side routing.
- **Animation**: Framer Motion for transitions and UI animations, including the Buddy AI mascot.

## Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with route handlers, protected by authentication middleware.
- **Session Management**: Express-session with PostgreSQL session store.
- **Authentication**: OpenID Connect (OIDC) with Replit's authentication service via Passport.js.

## AI Features (Buddy AI)
- **Service**: Unified AI assistant powered by OpenAI.
- **Animation**: Buddy mascot animates in/out using Framer Motion.
- **Capabilities**: Chat with memory, smart part recommendations, AI-generated DIY repair guides, mechanic estimates, proactive alerts, and part definitions.

## Data Storage
- **Database**: PostgreSQL via Neon serverless driver.
- **ORM**: Drizzle ORM for type-safe queries.
- **Core Tables**: Users, vehicles, vendors, deals, hallmarks, carts, orders, and sessions.
- **Affiliate Tracking**: Tables for affiliate networks, partners, clicks, commissions, and payouts.

## Payment Processing
- **Provider**: Stripe for credit card payments using Stripe Elements React components and backend SDK.
- **Architecture**: Frontend for card collection, backend for Stripe API management, and webhook handling.

## Build & Deployment
- **Development**: Client (Vite) and backend (tsx) dev servers with HMR.
- **Production Build**: Vite for client, esbuild for server.
- **Deployment**: Replit Autoscale deployment.

## DIY Repair Guides System
- **Taxonomy**: Comprehensive vehicle taxonomy across 18 categories.
- **YouTube Integration**: Each guide includes YouTube search queries for video alternatives and per-step video links.
- **Cross-Industry Terminology**: Translation table for part names across industries (e.g., marine to automotive).

## Affiliate Strategy
- **Tier 1 (Current)**: Vehicle-aware search links to 40+ retailers.
- **Tier 2 (Future)**: Product data feeds from affiliate networks for prices and images.
- **Tier 3 (Future)**: Direct APIs with retailers for real-time inventory and pricing.

## Blockchain Verification
- **Purpose**: Tamper-proof verification of Genesis Hallmarks and Vehicle Passports on the Solana blockchain.
- **Technology**: Solana network via Helius RPC, `@solana/web3.js`.
- **Features**: SHA-256 hashing, on-chain transaction submission, transaction signature storage, Solscan links.

## Member Referral Program
- **Route**: `/invite` for Invite Friends page
- **Points Structure**: 100 pts per signup, 500 pts when referral goes Pro
- **Redemption Tiers**: 500 pts = 1 month Pro, 1000 pts = 1 year Pro, 2500 pts = Lifetime Pro
- **Database Tables**: `referral_invites`, `referral_point_transactions`, `referral_redemptions`
- **User Fields**: `referralCode`, `referredByUserId`, `referralPointsBalance`
- **API Endpoints**: `/api/referrals/summary`, `/api/referrals/validate/:code`, `/api/referrals/redeem`

## Release Version Control System
- **Route**: `/dev` → "Releases" tab in Dev Portal
- **Database Table**: `releases` with version, versionType, changelog, timestamps
- **Version Types**: beta, stable, hotfix, major
- **Features**: Draft → Publish workflow, timestamped releases, categorized changelogs
- **API Endpoints**: `/api/releases`, `/api/releases/latest`, `/api/releases/:id/publish`
- **Optional**: Blockchain verification via existing hallmark system (entityType: 'release')
- **Implementation Guide**: `docs/release-version-control-guide.md` (copy-pasteable for other projects)

## Latest Publish: December 2, 2024 @ 7:15 PM EST

## Recent Updates (December 2024)
- **Release Version Control (Dec 2)**: Full release tracking system with versions, changelogs, footer badge. Agent instructions at `docs/RELEASE_SYSTEM_AGENT_COPY.txt`.
- **Hero Buddy Local Popup (Dec 2)**: Clicking Buddy on the "G" now shows a compact local comic bubble with tips instead of opening full-screen chat. No blur/overlay.
- **BuddyHideSeek Animation Fix (Dec 2)**: Random Buddy popup now properly sweeps in from 8 directions with spring physics. Removed blur overlay, compact fitted speech bubble.
- **Bento Grid Layout (Dec 2)**: Applied max-w-6xl centered containers and bento grid headers across all major pages for consistent, compact desktop layouts.
- **Weather Radar Integration**: Live weather radar with RainViewer tiles, NOAA storm alerts, animated playback controls, and layer toggles. Accessible via radar button in the weather widget.
- **React 18 Compatibility Fix**: Downgraded from React 19.2.0 to React 18.3.1 and framer-motion 12.x to 11.15.0 to fix "Objects are not valid as a React child" error. @tanstack/react-query 5.x has experimental React 19 support that caused CJS/ESM bundling issues.
- **Member Referral Program**: Full points-based referral system with signup tracking, Pro conversion bonuses, and reward redemption.
- **Dev Redirect**: Development mode auto-redirects to `/dev` page on first load for faster development workflow.

## Weather Radar System
- **Component**: `WeatherRadar.tsx` with Leaflet map and RainViewer radar tiles
- **Radar Data**: RainViewer API (free) for precipitation radar tiles with animated playback
- **Storm Alerts**: NOAA Weather Alerts API (`/api/weather/alerts`) for real-time severe weather warnings
- **Features**: Animated radar playback, layer controls (precipitation toggle, opacity slider), fullscreen mode, mobile-responsive design
- **ZIP Persistence**: localStorage for guests, database for authenticated users via `/api/user/preferences`
- **Dependencies**: `react-leaflet@^4.2.1` (React 18 compatible), `leaflet`

## Version Constraints
- **React**: ^18.3.1 (NOT React 19 - causes compatibility issues with @tanstack/react-query and framer-motion)
- **framer-motion**: ^11.15.0 (NOT 12.x - designed for React 19)
- **@tanstack/react-query**: ^5.60.5 (experimental React 19 support, stable with React 18)

## Recent Updates (November 2024)
- **Terms of Service Page**: Added `/terms` route with comprehensive legal content.
- **Investor Roadmap**: Comprehensive 4-phase roadmap (Foundation → Growth → Expansion → Scale) with 2027 vision.
- **Modal Fix**: PWA install prompt now waits for onboarding modal to close, preventing button click issues.
- **CSS Polish**: Added `glow-primary` and `glow-secondary` effects for premium CTA buttons.
- **Footer Links**: All links now properly connected (Terms, Privacy, social media, Dev Portal).

# External Dependencies

## Third-Party Services
- **Authentication**: Replit OIDC service
- **Database**: Neon PostgreSQL
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Blockchain**: Solana via Helius API

## Key NPM Packages
- **UI/Frontend**: `@radix-ui/*`, `tailwindcss`, `framer-motion`, `wouter`, `@tanstack/react-query`, `@stripe/react-stripe-js`
- **Backend**: `express`, `drizzle-orm`, `@neondatabase/serverless`, `stripe`, `openai`, `express-session`, `passport`, `connect-pg-simple`
- **Build Tools**: `vite`, `esbuild`, `tsx`