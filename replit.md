# Overview

**GarageBot** is a comprehensive auto parts aggregator platform that unifies inventory from 40+ retailers into a single searchable interface. The application enables users to search for parts across ALL vehicle types - cars, trucks, diesel/commercial, RVs, boats, ATVs, UTVs, motorcycles, small engines, generators, Chinese imports, classics, kit cars, and exotics.

**Live URL**: https://GarageBot.replit.app  
**Custom Domain**: garagebot.io (pending DNS verification)

**Brand Identity:**
- Domain: garagebot.io (primary)
- Tagline: "Right Part. First Time. Every Engine."
- AI Mascot: "Buddy" - conversational parts-finding assistant with run-in/run-out animation
- Business Entity: DarkWave Studios, LLC

**Key Features:**
- Vehicle fleet management ("My Garage") with VIN decoding
- AI-powered part recommendations and DIY repair guides
- **DIY Repair Guides** with YouTube video integration (18 vehicle categories)
- Vehicle-aware affiliate search links with guaranteed fitment
- Shopping cart with Stripe payments
- Developer dashboard with partner outreach info (PIN: 0424)
- Genesis Hallmark NFT system with tiered pricing
- Pro "Founders Circle" subscription ($4.99/month Launch Edition)

# Pricing Structure (Launch Edition)

**Editions:**
- **Launch Edition** (current): Lower prices locked in for early adopters
- **Standard Edition** (post-V2 launch): Higher prices for new subscribers

**Pro Subscription - Founders Circle:**
- Monthly: $4.99/month (Standard: $9.99)
- Annual: $39.99/year (Standard: $79.99)
- Founders get grandfathered rate forever

**Genesis Hallmark Pricing:**
- Free users: $9.99/vehicle (Standard: $14.99)
- Pro members: $1.99/vehicle (Standard: $2.99)
- 80% savings for Pro members

**Free Tier (generous core value):**
- Full parts search across 40+ retailers
- Price comparison
- All deals
- 1 vehicle in garage
- VIN decoding
- All DIY guides with YouTube
- Basic Buddy chat
- Full checkout

**Pro Tier (power features):**
- Everything in Free
- Unlimited vehicles
- Genesis Hallmark at 80% off ($1.99 vs $9.99)
- Saved DIY progress
- Price drop alerts
- Advanced Buddy AI
- Extended recall monitoring
- Family sharing (10 people)
- Exclusive deals

**Mechanics Garage (coming soon):**
- Monthly: $29.99 (Standard: $49.99)
- Annual: $249.99 (Standard: $399.99)

# DIY Repair Guides System

**Comprehensive vehicle taxonomy** covering 18 vehicle categories:
- Cars & Sedans, Trucks & Pickups, SUVs & Crossovers
- Motorcycles, ATVs & Quads, UTVs & Side-by-Sides
- Boats & Marine, Jet Skis & PWC
- RVs & Motorhomes, Diesel & Commercial
- Small Engines (lawn mowers, generators, chainsaws)
- Classics & Vintage, Hot Rods & Customs, Exotics & Supercars
- Chinese Imports, Scooters & Mopeds, Snowmobiles, Golf Carts & LSVs

**YouTube Integration:**
- Each guide has a YouTube search query for video alternatives
- "Watch Videos" button opens YouTube search for the repair topic
- Per-step YouTube search links for specific step instructions
- Alternative to slideshows for users who prefer video tutorials

**Cross-Industry Terminology:**
- Terminology translation table maps part names across industries
- Example: "lower unit oil" (marine) = "differential fluid" (automotive)
- Supports: automotive, marine, motorcycle, small engine, ATV, diesel, RV terms

**Database Tables:**
- `vehicle_categories` - 18 seeded categories with systems, year ranges
- `repair_guides` - Guides with YouTube links, difficulty, time estimates
- `guide_steps` - Step-by-step instructions with tips, warnings, images
- `guide_fitment` - Cross-vehicle compatibility mappings
- `part_terminology` - Industry-specific term translations
- `guide_ratings` - User feedback and helpful votes
- `guide_progress` - Track user progress through guides

# User Preferences

## CRITICAL - ALWAYS CONFIRM BEFORE CHANGES
**STOP AND ASK before implementing ANY changes.** Jason often gives voice commands while busy (driving, etc.) and needs to review the plan before work begins. Never start coding until explicit approval is given. This applies to ALL tasks - no exceptions.

**Workflow:**
1. Summarize what you understood from the request
2. Confirm which project (GarageBot vs DarkWave Studios vs other)
3. Ask "Should I proceed with this?" and WAIT for response
4. Only begin work after receiving explicit "yes" or approval

Preferred communication style: Simple, everyday language.

# Developer Access

**Dashboard PIN**: 0424 (Jason's quick access)
**Dev Task List Location**: Dashboard page → scroll down to Dev Task List section

# Vendor Network (40+ Retailers)

## Automotive - Major Retailers
- AutoZone (Impact affiliate)
- O'Reilly Auto Parts (contact for partnership)
- Advance Auto Parts (CJ Affiliate)
- RockAuto (no affiliate - direct outreach needed)
- Amazon Automotive (Amazon Associates - 4.5%)
- NAPA Auto Parts
- CarParts.com (CJ Affiliate)
- eBay Motors (eBay Partner Network)
- Car-Part.com (salvage network)

## Powersports - ATV/UTV/Motorcycle
- Rocky Mountain ATV/MC (AvantLink)
- Dennis Kirk (AvantLink)
- Partzilla (ShareASale)
- RevZilla (AvantLink)
- MotoSport (AvantLink)
- Cycle Gear (CJ Affiliate)
- BikeBandit (CJ Affiliate)
- VMC Chinese Parts
- Chaparral Motorsports

## Marine / Boat
- West Marine (CJ Affiliate)
- Defender Marine (AvantLink)
- Wholesale Marine (ShareASale)
- iBoats (CJ Affiliate)
- Boats.net (ShareASale)
- MarineEngine.com

## Diesel / Commercial / Heavy Duty
- TruckPro
- FleetPride
- Diesel Parts Direct
- FinditParts
- 4 State Trucks
- Vander Haags

## RV / Motorhome
- RV Parts Country (ShareASale)
- PPL Motorhomes
- Camping World (CJ Affiliate)
- etrailer (ShareASale)

## Small Engine / Outdoor Power
- Jack's Small Engines (ShareASale)
- Tractor Supply (CJ Affiliate)
- Mower Parts Group
- Electric Generators Direct (ShareASale)

## Off-Road / 4x4
- 4 Wheel Parts (CJ Affiliate)
- ExtremeTerrain (CJ Affiliate)
- AmericanTrucks (CJ Affiliate)

## Performance / Racing
- Summit Racing (CJ Affiliate)
- JEGS (CJ Affiliate)
- CARiD (CJ Affiliate)

## Classic / Vintage
- Classic Industries (ShareASale)
- Year One
- NPD (National Parts Depot)
- LMC Truck

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite as the build tool and development server.

**UI Component System**: shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS. The design system uses a "Deep Space / Future Forward" theme with electric cyan accents, custom fonts (Rajdhani for headers, Inter for body, JetBrains Mono for code), and a dark color palette.

**UI Effects**: Custom CSS classes for professional polish:
- `.btn-glow` - Hover glow effect for buttons
- `.btn-3d` - 3D button with depth shadow
- `.card-hover` - Card lift effect on hover
- `.text-glow` - Neon text glow
- `.neon-border` - Glowing border effect
- `.animate-pulse-glow` - Animated pulsing glow

**State Management**: TanStack Query (React Query) handles server state with custom query client configuration. Cart state is managed through a React Context provider. Authentication state is queried via a custom `useAuth` hook.

**Routing**: Wouter provides client-side routing with key routes: Home (`/`), Results (`/results`), Garage (`/garage`), Dashboard (`/dashboard`), Account Setup (`/account`), and Checkout flow (`/checkout`, `/checkout/success`, `/checkout/cancel`).

**Animation**: Framer Motion powers transitions and UI animations, including Buddy's run-in/run-out animation effect.

## Backend Architecture

**Runtime**: Node.js with Express framework serving both API endpoints and static frontend assets.

**API Design**: RESTful API with route handlers in `server/routes.ts`. Protected routes use authentication middleware (`isAuthenticated`). Key endpoints include:
- `/api/auth/user` - User session management
- `/api/vehicles` - Vehicle CRUD operations
- `/api/deals` - Deal/promotion management
- `/api/cart/*` - Shopping cart operations
- `/api/checkout/*` - Payment processing
- `/api/stripe/webhook` - Stripe webhook handler
- `/api/admin/seed-vendors` - Seed all 40+ vendors

**Session Management**: Express-session with PostgreSQL session store (`connect-pg-simple`). Sessions persist for 7 days with secure, httpOnly cookies.

**Authentication**: OpenID Connect (OIDC) integration with Replit's authentication service using Passport.js strategy. User claims are stored in session with access/refresh token rotation.

## AI Features (Buddy AI)

**Service**: Unified AI assistant service in `server/services/aiAssistant.ts` powered by OpenAI.

**Animation**: Buddy runs in from the left side of the screen when activated and runs out to the right when dismissed, using spring-based Framer Motion animations.

**Core Capabilities**:
- **Chat with Memory**: Persistent conversation history with vehicle context awareness
- **Smart Recommendations**: Predictive part suggestions based on mileage, age, and common failures
- **DIY Repair Guides**: AI-generated step-by-step instructions for specific vehicles
- **Mechanic Estimates**: Labor and parts cost estimates for repairs
- **Proactive Alerts**: Maintenance reminders and seasonal suggestions
- **Part Definitions**: Detailed explanations of what parts do and why they're needed

**Frontend Components**:
- `AIMascot.tsx`: Main Buddy chat component with run-in/run-out animation
- `SmartRecommendations.tsx`: Displays AI recommendations with DIY guides
- `ProactiveAlerts.tsx`: Shows maintenance alerts and reminders

## Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support.

**ORM**: Drizzle ORM provides type-safe database queries with schema-first design. Schema is defined in `shared/schema.ts` and migrations stored in `/migrations`.

**Core Tables**:
- `users` - User profiles with optional wallet addresses and genesis badges
- `vehicles` - User's saved vehicles with specifications (year, make, model, VIN, oil type, tire size)
- `vendors` - 40+ retail partners with affiliate info, contact emails, API status
- `deals` - Time-limited promotions with pricing and vendor info
- `hallmarks` - Genesis NFT/blockchain credentials for early users
- `carts` & `cart_items` - Shopping cart state
- `orders` & `order_items` - Purchase history
- `sessions` - Express session storage

**Affiliate Tracking Tables**:
- `affiliate_networks` - Affiliate networks (Amazon Associates, CJ, ShareASale, AvantLink, Impact)
- `affiliate_partners` - Individual retailers with commission rates, tracking templates
- `affiliate_clicks` - Click tracking with user, device, search context
- `affiliate_commissions` - Conversion tracking with order amounts
- `affiliate_payouts` - Monthly payout summaries by network

## Payment Processing

**Provider**: Stripe integration for credit card payments via Stripe Elements React components and backend SDK.

**Architecture**: 
- Frontend uses `@stripe/react-stripe-js` for card collection
- Backend manages Stripe clients via `server/stripeClient.ts`
- Webhook handling via `stripe-replit-sync` library
- Environment-aware keys based on `REPLIT_DEPLOYMENT` flag

**Future**: Planned Coinbase Commerce integration for cryptocurrency payments.

## Build & Deployment

**Development**: 
- Client dev server on port 5000 (Vite)
- Backend dev server uses tsx for TypeScript execution
- Hot module replacement and error overlays via Replit plugins

**Production Build**:
- Client: Vite builds to `dist/public`
- Server: esbuild bundles server to `dist/index.cjs`
- Build script in `script/build.ts` coordinates both builds

**Deployment**: Published via Replit Autoscale deployment at https://GarageBot.replit.app

# Affiliate Strategy (3 Tiers)

## Tier 1: Search Links (Current)
- Vehicle-aware search URLs include year/make/model for guaranteed fitment
- All 40+ retailers accessible via generated search links
- No API integration required - works immediately

## Tier 2: Data Feeds (Requires Partnership)
- Product data feeds from affiliate networks
- Requires CJ Affiliate, ShareASale, AvantLink, Impact accounts
- Enables showing actual prices and product images

## Tier 3: Direct APIs (Requires Business Partnership)
- Real-time inventory and pricing
- Requires direct partnerships with retailers
- PartsTech aggregator API for multi-supplier access

# Partner Outreach Guide

## Affiliate Networks to Join
1. **CJ Affiliate** (cj.com/join) - Advance Auto, Summit, JEGS, 4 Wheel Parts
2. **ShareASale** (shareasale.com) - Partzilla, Jack's Small Engines, Classic Industries
3. **AvantLink** (avantlink.com) - Rocky Mountain, Dennis Kirk, RevZilla
4. **Impact** (impact.com) - AutoZone, Camping World
5. **eBay Partner Network** (ebaypartnernetwork.com) - eBay Motors
6. **Amazon Associates** - Amazon Automotive (4.5% commission)

## Direct Outreach Needed
- RockAuto: info@rockauto.com
- O'Reilly: partnerships@oreillyauto.com
- NAPA: customerservice@napaonline.com
- VMC Chinese Parts: sales@vmcchineseparts.com
- Car-Part.com: info@car-part.com

## API Integration Contacts
- PartsTech: partstech.com/partners (multi-supplier API)
- WHI Nexpart: nexpart.com (catalog data feeds)
- ACES/PIES: aftermarket.org (industry standard data)

# External Dependencies

## Third-Party Services
- **Authentication**: Replit OIDC service
- **Database**: Neon PostgreSQL (serverless)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4

## Key NPM Packages
**UI/Frontend**: @radix-ui/*, tailwindcss, framer-motion, wouter, @tanstack/react-query
**Backend**: express, drizzle-orm, @neondatabase/serverless, stripe, openai
**Build Tools**: vite, esbuild, tsx

# Session Notes

- Custom domain garagebot.io configured in Namecheap, TXT record added for Replit verification
- Dev portal includes comprehensive partner outreach contacts and email templates
- Buddy AI has run-in/run-out animation effect
- UI includes professional hover/glow effects for buttons and cards
- Mobile-optimized with responsive vehicle type selector
