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