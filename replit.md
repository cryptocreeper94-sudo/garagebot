# Overview

GarageBot is a comprehensive parts aggregator platform designed to unify inventory from 68+ retailers into a single searchable interface. Its primary purpose is to ensure users find the "Right Part. First Time. Every Engine." for ALL motorized vehicles and equipment, including a dedicated Motorized Hobby section. The platform aims to revolutionize the parts market by offering advanced search capabilities, AI-powered recommendations, vehicle fleet management with VIN decoding, and integrated DIY repair guides. It also features a robust e-commerce system with Stripe payments, a Genesis Hallmark NFT system for early adopters, and a Pro "Founders Circle" subscription for enhanced functionalities. The business vision is to become the go-to platform for both casual users, professional mechanics, and hobby enthusiasts.

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
- **UI/UX**: shadcn/ui on Radix UI primitives, styled with Tailwind CSS, featuring a "Deep Space / Future Forward" theme with electric cyan accents, custom fonts (Rajdhani, Inter, JetBrains Mono), and a dark color palette. Custom CSS provides glow effects, 3D buttons, and neon text.
- **State Management**: TanStack Query for server state, React Context for cart management, and a custom `useAuth` hook.
- **Routing**: Wouter for client-side navigation.
- **Animation**: Framer Motion for UI animations, including the Buddy AI mascot.

## Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with authentication middleware.
- **Session Management**: Express-session with PostgreSQL session store.
- **Authentication**: Custom PIN-based login system requiring Name, Email, and a secure 8+ character PIN.

## AI Features (Buddy AI)
- **Core Service**: Unified AI assistant powered by OpenAI.
- **Capabilities**: Conversational AI with memory, intelligent part recommendations, AI-generated DIY repair guides, mechanic estimates, proactive vehicle alerts, and part definitions.

## Data Storage
- **Database**: PostgreSQL, accessed via Neon serverless driver.
- **ORM**: Drizzle ORM for type-safe database interactions.
- **Core Tables**: Users, vehicles, vendors, deals, hallmarks, carts, orders, sessions, and affiliate tracking tables.

## Payment Processing
- **Provider**: Stripe, integrated using Stripe Elements React components and Stripe's backend SDK.
- **Ad-Free Subscription**: $5/month tier removes all ads; Pro users automatically ad-free.

## Ad Monetization
- **Google AdSense**: Ads are shown to free users on Dashboard, Results, DIY Guides, Blog, Break Room, but never on login/signup/checkout flows. Ads are hidden for Pro and ad-free subscribers.

## Build & Deployment
- **Development Environment**: Client (Vite) and backend (tsx) development servers with Hot Module Replacement (HMR).
- **Production Build**: Vite for client-side, esbuild for server-side.
- **Deployment**: Replit Autoscale.

## DIY Repair Guides System
- **Content**: Comprehensive vehicle taxonomy, including YouTube search queries and per-step video links, with cross-industry terminology translation.

## Break Room Hub
- **Functionality**: A central hub (`/break-room`) with tabs for motorsports/automotive news, tools (Receipt/Document Scanner, Mileage Tracker, NHTSA Recall Checker, Maintenance Scheduler), community features (Speed Trap Alerts, Fuel Price Finder, Directories), and opportunities (CDL Schools & Trucking Programs).

## Affiliate Strategy
- **Current**: Vehicle-aware search links to over 50 retailers, with active integrations for Amazon Associates, eBay Partner Network, and CJ Affiliate.

## Blockchain Verification
- **Purpose**: Tamper-proof verification of Genesis Hallmarks and Vehicle Passports on the Solana blockchain.
- **Technology**: Solana network via Helius RPC and `@solana/web3.js`, featuring SHA-256 hashing and on-chain transaction submission.

## Member Referral Program
- **System**: Points-based system rewarding user signups and Pro membership conversions, redeemable for Pro membership tiers.

## TORQUE - Shop Management OS
- **Route**: `/torque` (landing), `/torque/onboard` (5-step setup), `/torque/app` (shop dashboard)
- **Branding**: "TORQUE — Shop Management OS powered by Trust Layer" — blockchain-verified shop identities
- **PWA**: Standalone PWA with custom manifest (`/torque-manifest.json`), app icons (192x192, 512x512), splash screen with animated logo
- **Landing Page**: Premium UI with 3-column bento grid, testimonial carousel, FAQ accordion, animated counters, parallax effects, PWA install prompt
- **Onboarding**: 5-step ultra-professional setup flow (Shop Info → Team → Services → Integrations → Verify)
- **Legacy**: `/mechanics-garage` redirects to `/torque/app` for backward compatibility
- **Formerly**: "Mechanics Garage" — rebranded to TORQUE across all major UI references

## Partner API System
- **Purpose**: Provides B2B API access for TORQUE shops with API Key + Secret authentication, granular scopes, and rate limiting.

## Weather Radar System
- **Integration**: Utilizes Leaflet map and RainViewer radar tiles with NOAA Weather Alerts API for severe weather warnings.

## CDL & Trucking Company Directory
- **Functionality**: A portable directory (`/cdl-directory`) of trucking companies and CDL programs with search, filter, and interest/referral forms.

## Signal Chat (Community Messaging)
- **Route**: `/chat` — Full-featured community chat integrated into GarageBot with a WebSocket layer.
- **Backend**: Extensive database tables (e.g., communities, channels, messages), CommunityHubService, REST API endpoints, and WebSocket support.
- **Trust Layer SSO**: Cross-app identity via JWT tokens and Trust Layer IDs, matching DarkWave Studios API format.
- **Frontend**: SignalChat page with real-time messaging via `useSignalChat` hook, Deep Space themed UI.
- **Buddy AI Bot**: Auto-responds in `#garagebot-support` channel using OpenAI GPT-4o-mini.
- **Auth Gating**: Unauthenticated users see a login prompt; authenticated users auto-join the GarageBot community.

## Shade Tree Mechanics (DIY Community)
- **Purpose**: A community hub (`/shade-tree`) for DIY enthusiasts, providing categorized repair guides, community tips, and estimated savings.

## Marketing Hub & Social Media Integration
- **Add-on**: Premium add-on for TORQUE shops supporting various social media platforms.
- **GarageBot Marketing Hub** (`/marketing-hub`): Auto-posting to Facebook (GarageBot.io page) every 3 hours via Meta Graph API with 60+ unique posts.
- **Meta Ads Campaigns**: Manages paid ad campaigns via Meta Marketing API with configurable targeting.
- **Analytics**: Tracks top-performing content and provides performance insights from Meta Graph API.

## OEM Parts
- **Route**: `/oem-parts` — Full OEM genuine parts directory page with 12+ manufacturer brands.
- **Layout**: Premium bento grid header, 3-column partner cards with photorealistic images, parts category carousel, OEM vs aftermarket comparison table, warranty section, FAQ accordion, bottom CTA bento.
- **Brands**: Toyota, Ford/Motorcraft, GM/ACDelco, Mopar, Honda, BMW, Nissan, Mercedes-Benz, Hyundai, Subaru, Volkswagen/Audi, Kia.
- **Images**: Unique photorealistic images per brand in `client/src/assets/images/oem/`.
- **Explore/CC**: Card added to "Parts & Shopping" in Explore page and "Vehicle & Parts" in Command Center.
- **Affiliate**: URLs placeholder-ready for affiliate link integration.

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
- **ORBIT Staffing OS**: `https://orbitstaffing.replit.app` for payroll and staffing platform integration, including worker management, timesheets, and payroll processing.
- **Meta Graph API**: For Facebook auto-posting and ad campaign management.

## Unified Business Integrations Hub
- **Purpose**: Allows TORQUE shops to connect their existing business software via OAuth.
- **Supported Integrations**:
    - **Accounting**: QuickBooks Online, FreshBooks, Xero, Sage Business Cloud, Wave Accounting
    - **Payroll/HR**: UKG Pro, ADP Workforce Now, Gusto, Paychex Flex
    - **Scheduling/Communication**: Google Calendar, Twilio, Mailchimp
    - **Parts/Inventory**: PartsTech, Nexpart

## Inbound Affiliate Program (GB-XXXXXX)
- **Route**: `/affiliates` — Full affiliate program page with enrollment, dashboard, and Trust Layer handoff.
- **Code Format**: `GB-XXXXXX` (6 alphanumeric uppercase, no ambiguous chars like 0/O/1/I).
- **Commission Rules**: 10% of GarageBot's affiliate commission on referred user purchases, $5 one-time Pro conversion bonus, $2/month recurring per active Pro referral.
- **Thresholds**: $100 total referred purchase amount before affiliate starts earning. $20 minimum payout balance before payout request.
- **Payouts**: PayPal, admin-approved. Admin gets alerts when affiliates reach $20 threshold.
- **Trust Layer**: Handoff endpoint at `/api/affiliate-program/trustlayer/:code` returns full JSON payload for cross-ecosystem tracking.
- **Database Tables**: `affiliate_accounts`, `affiliate_referrals`, `affiliate_earnings`, `affiliate_payouts_inbound`.
- **API**: All routes prefixed with `/api/affiliate-program/`.