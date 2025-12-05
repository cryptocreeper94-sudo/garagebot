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

## Latest Publish: December 5, 2024 @ 8:05 PM EST

## v1.0.5 - PUBLISHED & BLOCKCHAIN VERIFIED
Solana TX: `3XP2wnb6VMZBf7Zu5TuvuYtbpdsE4JfZQXcZfgzydcfJLNR9TREMjvVoFYstCbWdiEEmo8it8oXkNjX1o7pShp4A`

## All Versions Blockchain Verified
- v1.0.5: `3XP2wnb6VMZBf7Zu5TuvuYtbpdsE4JfZQXcZfgzydcfJLNR9TREMjvVoFYstCbWdiEEmo8it8oXkNjX1o7pShp4A`
- v1.0.4: `5AUTquMgE1iZMxCM1bGpv9Fz2oSGtYYV6PL6DJDv65cTipKdG8fehkLxsKjuhVbhoekzDpg738AWTDkLC3nMfz43`
- v1.0.3: `DvXsAW8AhxtasuHTv7e7FTJrvWCBF7Lt8VTyNESeWvfS5FHVt1cKKDi6fNS4NtthrF1zkvcuQhU4383L5YsWT4m`
- v1.0.2: `5gHRuwY3oWGnmVDAPvTWxfRdXUMSJ1r9tA2ze2hzAA3W5HMsJWN6BDQfdRfFFgfab7zdooveS3WSmdfjw7MMZSB5`
- v1.0.1: `5cPLvQQHV1uHfxUB7gpbBhUd3c6gQaGtAhGzrDZgikgBeFF99mxZM45kR2CHHVvdenh5gZ7Z8nd6PTvkwGdDDGTn`
- v1.0.0: `4NJFuwVx43J65D8e7SrryuVqwmt5SAAGsxqsenJiNAmckVDLEwFfUY1o2MdR8przoYzLa1pbbyfCp9VySoYTmjwA`

## Recent Updates (December 2024)

### v1.0.5 (Dec 5) - Mobile Modal Optimization
- All modals now mobile-friendly with proper margins and close buttons
- Drawer component: Added X close button, max-height 90vh with scroll
- AlertDialog: Mobile margins w-[calc(100%-2rem)], max-height 85vh
- Verified badge popup: Now visible on mobile, full-width positioning
- All popups scroll if content overflows

### v1.0.4 (Dec 5) - Documentation & Blockchain
- Updated all documentation to reflect latest changes
- All past versions (1.0.0-1.0.3) now blockchain verified on Solana mainnet
- Fixed Investors page retailer count (20+ → 40+)

### v1.0.3 (Dec 5) - UI Polish & Layout
- Clickable app hallmark badge (GB-000001) in header linking to Genesis Hallmark page
- Weather widget moved to bottom left corner, aligned with Buddy on same baseline
- Buddy AI mascot increased to 1.5x size (80px mobile → 144px desktop)
- All popups now 100% opacity with z-100 (no transparency issues)
- Mobile optimized responsive sizing for weather and Buddy
- Two-column hamburger menu layout on desktop

### v1.0.2 (Dec 5) - Image Carousels & Hallmark Badges
- AI-generated images for all 12 vehicle type carousel cards
- AI-generated images for all 20 category carousel cards
- Converted desktop accordions to horizontal image carousels with arrow navigation
- Genesis Hallmark visual badge with dynamic asset number overlay
- Generated numbered hallmark images (000000000-01 for app, 000000000-02 for founder)
- Purple holographic glow effect on hallmark badges

### v1.0.1 (Dec 4) - Bug Fixes
- Minor UI fixes and polish

### v1.0.0 "Genesis Launch" (Dec 3)
- Official v1.0 release with full feature set
- Footer component on all major pages
- Container width standardization (max-w-6xl)
- Release Version Control system
- Bento grid layouts across all pages

### Earlier Updates
- **Weather Radar Integration**: Live weather radar with RainViewer tiles, NOAA storm alerts, animated playback.
- **React 18 Compatibility**: Downgraded to React 18.3.1 and framer-motion 11.15.0 for stability.
- **Member Referral Program**: Points-based referral system with Pro conversion bonuses.
- **Dev Portal**: Full release management, affiliate network guides, blockchain verification.

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