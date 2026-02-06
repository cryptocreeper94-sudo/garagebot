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
  - **AvantLink** - Needed for AMain Hobbies, RC Planet
  - **ShareASale** - Needed for Tower Hobbies, GetFPV, Redcat Racing
  - **Direct Programs** - HobbyKing, BETAFPV (apply on their sites)
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
- **ORBIT Ecosystem**: ORBIT Staffing Ecosystem Hub (orbitstaffing.io).

## QuickBooks Integration
- **Purpose**: Facilitates OAuth flow for connecting shops to QuickBooks Online.
- **Capabilities**: Synchronizes repair orders to invoices and manages customer data.

## PartsTech Integration
- **Purpose**: Enables real-time parts ordering from a vast network of retailers.
- **Capabilities**: Offers parts search, inventory checks, VIN decoding, and order placement functionalities.