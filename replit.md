# Overview

GarageBot is a comprehensive parts aggregator platform designed to unify inventory from over 50 retailers into a single searchable interface. Its primary purpose is to ensure users find the "Right Part. First Time. Every Engine." for ALL motorized vehicles and equipment, including a dedicated **Motorized Hobby** section. The platform aims to revolutionize the parts market by offering advanced search capabilities, AI-powered recommendations, vehicle fleet management with VIN decoding, and integrated DIY repair guides. It also features a robust e-commerce system with Stripe payments, a Genesis Hallmark NFT system for early adopters, and a Pro "Founders Circle" subscription for enhanced functionalities. The business vision is to become the go-to platform for both casual users, professional mechanics, and hobby enthusiasts.

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
- **Ad-Free Subscription**: $5/month tier removes all ads; Pro users automatically ad-free. Checkout at `POST /api/subscription/ad-free/checkout`. Webhook lifecycle handles active/trialing (enable), past_due/unpaid/paused/incomplete (disable), deleted (cancel). Schema fields: `adFreeSubscription`, `adFreeExpiresAt`, `adFreeStripeSubscriptionId`.

## Ad Monetization
- **Google AdSense**: Publisher ID `ca-pub-7386731030203849` via `VITE_ADSENSE_PUBLISHER_ID`. Ad components (`AdSense.tsx`, `AdSenseSlot.tsx`) check user subscription status; ads hidden for Pro and ad-free subscribers. Placements on Dashboard, Results, DIY Guides, Blog, Break Room — never on login/signup/checkout flows. Upgrade prompt shown to free users near ad placements.

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

## Partner API System
- **Purpose**: Provides B2B API access for Mechanics Garage shops with API Key + Secret authentication, granular scopes, and rate limiting.

## Weather Radar System
- **Integration**: `WeatherRadar.tsx` component utilizing Leaflet map and RainViewer radar tiles with NOAA Weather Alerts API for severe weather warnings.

## CDL & Trucking Company Directory
- **Functionality**: A portable directory (`/cdl-directory`) of trucking companies and CDL programs with search, filter, and interest/referral forms.

## Signal Chat (Community Messaging)
- **Route**: `/chat` — Full-featured community chat integrated into GarageBot.
- **Backend**: 17+ database tables (communities, channels, members, messages, bots, reactions, attachments, DMs, polls, roles, threads, pins, etc.), CommunityHubService with 36 CRUD methods, 24+ REST API endpoints, WebSocket layer at `/ws/chat` with dual auth (session-based + JWT cross-app SSO).
- **Trust Layer SSO**: Cross-app identity via `chat_users`, `chat_channels`, `chat_messages` tables matching DarkWave Studios format. JWT tokens (HS256, 7-day expiry, `iss: "trust-layer-sso"`), Trust Layer IDs (`tl-{base36}-{random}`), bcryptjs password hashing (12 salt rounds).
- **SSO Auth Endpoints**: `POST /api/chat/auth/register`, `POST /api/chat/auth/login`, `GET /api/chat/auth/me` — all matching DarkWave Studios API format exactly.
- **WebSocket JWT Auth**: Supports `{ type: "join", token: "<jwt>", channelId: "<id>" }` for cross-app SSO alongside session cookie auth. Also supports `switch_channel` and `message` types matching DarkWave protocol.
- **Frontend**: SignalChat page with real-time messaging via `useSignalChat` hook, Deep Space themed UI with glassmorphism and cyan accents.
- **Buddy AI Bot**: Auto-responds in `#garagebot-support` channel using OpenAI GPT-4o-mini, flags messages for human escalation when needed (billing, refund, security, etc.).
- **Auto-Seeding**: GarageBot community seeded on startup. Trust Layer SSO channels (general, announcements, darkwavestudios-support, garagebot-support, tlid-marketing, guardian-ai) seeded via `server/seedChat.ts`.
- **Auth Gating**: Unauthenticated users see a login prompt; authenticated users auto-join the GarageBot community.
- **Key Files**: `server/trustlayer-sso.ts`, `server/seedChat.ts`, `server/services/community-hub-service.ts`, `server/services/chat-websocket.ts`, `server/services/buddy-chat-bot.ts`, `server/chat-routes.ts`, `client/src/pages/SignalChat.tsx`, `client/src/hooks/useSignalChat.ts`, `shared/chat-types.ts`.
- **Handoff Doc**: `attached_assets/GARAGEBOT-SSO-HANDOFF.txt` — full handoff document for dwtl.io agent with schema, endpoints, WebSocket protocol, and cross-app SSO flow.

## Shade Tree Mechanics (DIY Community)
- **Purpose**: A community hub (`/shade-tree`) for DIY enthusiasts, providing categorized repair guides, community tips, and estimated savings.

## Marketing Hub & Social Media Integration
- **Add-on**: Premium add-on for Mechanics Garage shops supporting various social media platforms with features like Digital Asset Management, content scheduling, analytics, and AI content generation via OpenAI GPT-4o.
- **GarageBot Marketing Hub** (`/marketing-hub`): Auto-posting to Facebook (GarageBot.io page) every 3 hours via Meta Graph API. 60+ unique posts covering all vehicle categories (cars, trucks, motorcycles, ATVs, boats, RVs, tractors, heavy equipment, generators, small engines, aviation, RC, drones, model aircraft, slot cars, go-karts, golf carts, snowmobiles, jet skis, exotics, classics, diesel, kit cars). Content types: educational, gamified challenges, evergreen, seasonal, promotional. No repeats for at least a week.
- **Meta Integration**: App ID `1444186517216202`, Page ID `900725646468208` (GarageBot.io), Ad Account `751302398036834` (DarkWave Studios), Instagram `@garagebot.io` (ID `17841480455608384`). Credentials stored as secrets: META_APP_ID, META_APP_SECRET, META_PAGE_ID, META_PAGE_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_INSTAGRAM_ACCOUNT_ID, META_INSTAGRAM_USERNAME. Auto-connected via `ensureMetaIntegration()` on scheduler startup (FB + IG).
- **Analytics**: Tracks top-performing messages, images, and image+message combinations. Pulls real engagement data from Meta Graph API every 30 minutes. Performance by time slot analysis. API endpoints: `/api/marketing/analytics/top-content`, `/api/marketing/analytics/top-images`, `/api/marketing/analytics/top-bundles`, `/api/marketing/analytics/time-slots`.
- **Key Files**: `server/marketing-scheduler.ts`, `server/social-connectors.ts`, `client/src/pages/MarketingHub.tsx`.

# External Dependencies

## Third-Party Services
- **Authentication**: Replit OIDC service.
- **Database**: Neon PostgreSQL.
- **Payments**: Stripe.
- **AI**: OpenAI GPT-4.
- **Blockchain**: Solana (via Helius API).
- **Weather Radar**: RainViewer API, NOAA Weather Alerts API.
- **ORBIT Staffing OS**: `https://orbitstaffing.replit.app` for payroll and staffing platform integration.
    - **App ID**: `dw_app_garagebot`
    - **Ecosystem Endpoints**: Status, sync for workers, contractors, timesheets, certifications, 1099/W2 data, shop workers, payroll, activity logs, code snippets.
    - **Payroll Engine Endpoints**: Status, overtime rules (all 50 states), overtime calculation.
    - **Financial Hub**: `POST /api/financial-hub/ingest`.
    - **Webhooks**: Endpoint at `/webhooks/orbit` for `payroll.completed`, `worker.created`, etc.
    - **Payroll Capabilities**: Federal/state/local tax calculations, FICA, garnishments, direct deposit via Stripe Connect ACH, W-2/1099-NEC generation.

## Unified Business Integrations Hub
- **Purpose**: Allows Mechanics Garage shops to connect their existing business software via OAuth.
- **Supported Integrations**:
    - **Accounting**: QuickBooks Online, FreshBooks, Xero, Sage Business Cloud, Wave Accounting
    - **Payroll/HR**: UKG Pro, ADP Workforce Now, Gusto, Paychex Flex
    - **Scheduling/Communication**: Google Calendar, Twilio, Mailchimp
    - **Parts/Inventory**: PartsTech, Nexpart