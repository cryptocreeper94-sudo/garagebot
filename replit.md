# Overview

GarageBot is a comprehensive parts aggregator platform designed to unify inventory from over 50 retailers into a single searchable interface. Its primary purpose is to ensure users find the "Right Part. First Time. Every Engine." for ALL motorized vehicles and equipment including cars, trucks, RVs, boats, ATVs, motorcycles, aviation, heavy equipment, and a dedicated **Motorized Hobby** section covering RC cars, drones/FPV, model aircraft, and slot cars. The platform aims to revolutionize the parts market by offering advanced search capabilities, AI-powered recommendations, vehicle fleet management with VIN decoding, and integrated DIY repair guides. It also features a robust e-commerce system with Stripe payments, a Genesis Hallmark NFT system for early adopters, and a Pro "Founders Circle" subscription for enhanced functionalities. The business vision is to become the go-to platform for both casual users, professional mechanics, and hobby enthusiasts, providing unparalleled access to parts and repair knowledge across every motorized category.

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
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: shadcn/ui on Radix UI primitives, styled with Tailwind CSS. The theme is "Deep Space / Future Forward" utilizing electric cyan accents, custom fonts (Rajdhani, Inter, JetBrains Mono), and a dark color palette. Custom CSS enhances UI with glow effects, 3D buttons, and neon text.
- **State Management**: TanStack Query for server state, React Context for cart management, and a custom `useAuth` hook.
- **Routing**: Wouter for client-side navigation.
- **Animation**: Framer Motion for UI animations, including the Buddy AI mascot.

## Backend
- **Runtime**: Node.js with Express.js.
- **API Design**: RESTful API with authentication middleware.
- **Session Management**: Express-session with PostgreSQL session store.
- **Authentication**: Custom PIN-based login system requiring Name, Email, and a secure 8+ character PIN (uppercase, lowercase, special character). The authentication page is located at `/auth`.

## AI Features (Buddy AI)
- **Core Service**: Unified AI assistant powered by OpenAI.
- **Capabilities**: Provides conversational AI with memory, intelligent part recommendations, AI-generated DIY repair guides, mechanic estimates, proactive vehicle alerts, and part definitions.

## Data Storage
- **Database**: PostgreSQL, accessed via Neon serverless driver.
- **ORM**: Drizzle ORM for type-safe database interactions.
- **Core Tables**: Users, vehicles, vendors, deals, hallmarks, carts, orders, and sessions.
- **Affiliate Tracking**: Dedicated tables for affiliate networks, partners, clicks, commissions, and payouts.

## Payment Processing
- **Provider**: Stripe, integrated using Stripe Elements React components for the frontend and Stripe's backend SDK.

## Build & Deployment
- **Development Environment**: Client (Vite) and backend (tsx) development servers with Hot Module Replacement (HMR).
- **Production Build**: Vite handles the client-side build, while esbuild is used for the server-side.
- **Deployment**: Utilizes Replit Autoscale for deployment.

## DIY Repair Guides System
- **Taxonomy**: Comprehensive vehicle taxonomy spanning 18 categories.
- **Content**: Guides include YouTube search queries and per-step video links.
- **Translation**: Cross-industry terminology translation for part names to ensure clarity.

## Break Room Hub
- **Functionality**: A central hub (`/break-room`) with four main tabs:
    - **News**: Curated motorsports and automotive news.
    - **Tools**: Includes Receipt/Document Scanner (OpenAI Vision OCR), Mileage Tracker, NHTSA Recall Checker, and Maintenance Scheduler.
    - **Community**: Features Speed Trap Alerts, Fuel Price Finder, Specialty Shops & Salvage Yards Directory, and Car Shows & Events Finder.
    - **Opportunities**: CDL Schools & Trucking Programs directory with referral forms.

## Affiliate Strategy
- **Current**: Vehicle-aware search links to over 50 retailers across automotive, marine, powersports, and motorized hobby categories.
- **Active Affiliate Accounts (CONNECTED)**:
  - **Amazon Associates** - CONNECTED and operational
  - **eBay Partner Network** - CONNECTED and operational
  - **CJ Affiliate** - CONNECTED and operational (covers Horizon Hobby and other CJ merchants)
- **Pending Affiliate Accounts (NOT YET CONNECTED)**:
  - **AvantLink** - Needed for AMain Hobbies, RC Planet | Sign up: https://www.avantlink.com/
  - **ShareASale** - Needed for Tower Hobbies, GetFPV, Redcat Racing | Sign up: https://www.shareasale.com/
  - **Direct Programs** - HobbyKing, BETAFPV (apply on their sites)
- **Pending Business Integration OAuth Accounts (NOT YET CONNECTED)**:
  - **QuickBooks Online** - Accounting sync | Sign up: https://developer.intuit.com/ | Env: `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`
  - **FreshBooks** - Invoicing/time tracking | Sign up: https://www.freshbooks.com/api | Env: `FRESHBOOKS_CLIENT_ID`, `FRESHBOOKS_CLIENT_SECRET`
  - **Xero** - Cloud accounting | Sign up: https://developer.xero.com/ | Env: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`
  - **Sage Business Cloud** - Business management | Sign up: https://developer.sage.com/ | Env: `SAGE_CLIENT_ID`, `SAGE_CLIENT_SECRET`
  - **Wave Accounting** - Free small biz accounting | Sign up: https://developer.waveapps.com/ | Env: `WAVE_CLIENT_ID`, `WAVE_CLIENT_SECRET`
  - **UKG Pro** - HR/payroll/talent | Sign up: https://developer.ukg.com/ | Env: `UKG_CLIENT_ID`, `UKG_CLIENT_SECRET`
  - **ADP Workforce Now** - Payroll/HR | Sign up: https://developers.adp.com/ | Env: `ADP_CLIENT_ID`, `ADP_CLIENT_SECRET`
  - **Gusto** - Modern payroll | Sign up: https://dev.gusto.com/ | Env: `GUSTO_CLIENT_ID`, `GUSTO_CLIENT_SECRET`
  - **Paychex Flex** - Payroll/benefits | Sign up: https://developer.paychex.com/ | Env: `PAYCHEX_CLIENT_ID`, `PAYCHEX_CLIENT_SECRET`
  - **Google Calendar** - Scheduling | Sign up: https://console.cloud.google.com/ | Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - **Twilio** - SMS/communication | Sign up: https://www.twilio.com/console | Env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
  - **Mailchimp** - Email marketing | Sign up: https://admin.mailchimp.com/account/api/ | Env: `MAILCHIMP_CLIENT_ID`, `MAILCHIMP_CLIENT_SECRET`
  - **PartsTech** - Parts ordering | Sign up: https://www.partstech.com/integrations | Env: `PARTSTECH_API_KEY`, `PARTSTECH_API_SECRET`
  - **Nexpart** - Electronic parts catalog | Sign up: https://www.nexpart.com/ | Env: `NEXPART_API_KEY`, `NEXPART_API_SECRET`
- **Future Direction**: Integration of product data feeds from affiliate networks and direct APIs with retailers for real-time inventory updates.

## Blockchain Verification
- **Purpose**: Tamper-proof verification of Genesis Hallmarks and Vehicle Passports on the Solana blockchain.
- **Technology**: Solana network via Helius RPC and `@solana/web3.js`.
- **Features**: SHA-256 hashing, on-chain transaction submission, and Solscan links. Opt-in customer data hashing for privacy.

## Member Referral Program
- **System**: Points-based system rewarding user signups and Pro membership conversions. Points are redeemable for Pro membership tiers.

## Partner API System
- **Purpose**: Provides B2B API access for Mechanics Garage shops.
- **Security**: API Key + Secret authentication with SHA-256 hashing, granular scopes, and rate limiting.
- **Key Endpoints**: `/shop`, `/orders`, `/appointments`, `/customers`, `/estimates`, `/analytics`, `/locations`, `/usage`.

## Weather Radar System
- **Integration**: `WeatherRadar.tsx` component utilizes Leaflet map and RainViewer radar tiles for precipitation visualization.
- **Alerts**: NOAA Weather Alerts API for severe weather warnings.
- **Features**: Animated radar, layer controls, fullscreen mode, mobile responsiveness, and ZIP code persistence.

## CDL & Trucking Company Directory
- **Functionality**: A self-contained, portable directory (`/cdl-directory`) of trucking companies and CDL programs.
- **Features**: Search and filter options by company type, experience level, home time, freight type, state, and CDL class. Includes company detail modals and interest/referral forms.

## Shade Tree Mechanics (DIY Community)
- **Purpose**: A community hub (`/shade-tree`) for DIY enthusiasts.
- **Features**: Provides DIY repair guides categorized by difficulty, vehicle type, and repair category. Includes community tips, estimated time/money savings, and search functionality.

## Marketing Hub & Social Media Integration
- **Add-on**: Premium add-on for Mechanics Garage shops.
- **Platforms**: Supports X/Twitter, Facebook, Instagram, LinkedIn, Google Business, and Nextdoor.
- **Features**: Digital Asset Management (DAM), content bundles, calendar scheduling, analytics dashboard, paid ads management, and AI content generation via OpenAI GPT-4o.

# External Dependencies

## Third-Party Services
- **Authentication**: Replit OIDC service.
- **Database**: Neon PostgreSQL.
- **Payments**: Stripe.
- **AI**: OpenAI GPT-4.
- **Blockchain**: Solana (via Helius API).
- **Weather Radar**: RainViewer API, NOAA Weather Alerts API.
- **ORBIT Staffing OS**: Full payroll and staffing platform at `https://orbitstaffing.replit.app`.
  - **Hub URL env var**: `ORBIT_HUB_URL` = `https://orbitstaffing.replit.app`
  - **Auth**: `X-API-Key` + `X-API-Secret` + `X-App-Name: GarageBot` headers on all ecosystem endpoints.
  - **App ID**: `dw_app_garagebot` | API Key stored in `ORBIT_ECOSYSTEM_API_KEY` env secret
  - **Ecosystem Endpoints** (13 total, all authenticated):
    - `GET /api/ecosystem/status` - Connection health check
    - `POST /api/ecosystem/sync/workers` - Push mechanic/worker records
    - `POST /api/ecosystem/sync/contractors` - Push contractor records
    - `POST /api/ecosystem/sync/timesheets` - Push daily hours
    - `POST /api/ecosystem/sync/certifications` - Push ASE/trade certs
    - `POST /api/ecosystem/sync/1099` - Push 1099 contractor payment data
    - `POST /api/ecosystem/sync/w2` - Sync W-2 employee data for year-end
    - `GET /api/ecosystem/shops/:shopId/workers` - Get shop workers
    - `GET /api/ecosystem/shops/:shopId/payroll` - Get shop payroll records
    - `GET/POST /api/ecosystem/logs` - Activity logging
    - `GET/POST /api/ecosystem/snippets` - Code snippet sharing
  - **Payroll Engine Endpoints** (4 total, PUBLIC - no auth):
    - `GET /api/payroll/engine/status` - Payroll engine health
    - `GET /api/payroll/overtime/rules` - All 50 state overtime rules
    - `GET /api/payroll/overtime/rules/:state` - State-specific rules
    - `POST /api/payroll/overtime/calculate` - Calculate overtime (CA daily OT/DT, AK, NV, CO, MN, KS special rules)
  - **Financial Hub**: `POST /api/financial-hub/ingest` with `X-Orbit-Api-Key` + `X-Orbit-Signature` (HMAC-SHA256)
  - **Webhooks** (ORBIT -> GarageBot): Endpoint at `/webhooks/orbit`, verified via `x-orbit-signature` HMAC-SHA256.
    - Events: `payroll.completed`, `payroll.payment.sent`, `payroll.payment.failed`, `worker.created`, `worker.updated`, `document.generated`, `tax.form.ready`
  - **Payroll Capabilities**: Federal/state/local tax calculations (all 50 states + DC), FICA, garnishments (CCPA-compliant), direct deposit via Stripe Connect ACH, W-2/1099-NEC generation, Form 941/W-3/1096, pay stubs with ORBIT hallmark.
  - **Client Files**: `server/services/orbitEcosystem.ts` (OrbitEcosystemClient), `server/ecosystemHub.ts` (EcosystemClient for Dev Hub).

## Unified Business Integrations Hub
- **Purpose**: Allows Mechanics Garage shops to connect their existing business software via OAuth.
- **Service**: `server/services/businessIntegrations.ts` - Unified service handling all OAuth flows.
- **Database**: `business_integrations` table tracks per-shop connections with encrypted token storage.
- **API Routes**: `/api/integrations/available`, `/api/shops/:shopId/integrations/:service/connect|disconnect|status`
- **Frontend**: `BusinessIntegrationsTab` component in MechanicsGarage.tsx with dynamic connect/disconnect.
- **Supported Integrations** (14 total, OAuth credentials needed for activation):
  - **Accounting**: QuickBooks Online, FreshBooks, Xero, Sage Business Cloud, Wave Accounting
  - **Payroll/HR**: UKG Pro, ADP Workforce Now, Gusto, Paychex Flex
  - **Scheduling/Communication**: Google Calendar, Twilio, Mailchimp
  - **Parts/Inventory**: PartsTech, Nexpart
- **OAuth Credential Env Vars** (add when ready):
  - QuickBooks: `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`
  - UKG: `UKG_CLIENT_ID`, `UKG_CLIENT_SECRET`
  - ADP: `ADP_CLIENT_ID`, `ADP_CLIENT_SECRET`
  - Gusto: `GUSTO_CLIENT_ID`, `GUSTO_CLIENT_SECRET`
  - Paychex: `PAYCHEX_CLIENT_ID`, `PAYCHEX_CLIENT_SECRET`
  - FreshBooks: `FRESHBOOKS_CLIENT_ID`, `FRESHBOOKS_CLIENT_SECRET`
  - Xero: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`
  - Sage: `SAGE_CLIENT_ID`, `SAGE_CLIENT_SECRET`
  - Wave: `WAVE_CLIENT_ID`, `WAVE_CLIENT_SECRET`
  - Google Calendar: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
  - Mailchimp: `MAILCHIMP_CLIENT_ID`, `MAILCHIMP_CLIENT_SECRET`
  - PartsTech: `PARTSTECH_API_KEY`, `PARTSTECH_API_SECRET`
  - Nexpart: `NEXPART_API_KEY`, `NEXPART_API_SECRET`