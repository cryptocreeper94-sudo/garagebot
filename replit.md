# Overview

**GarageBot** (formerly AutoLedger/PartScout) is a modern auto parts aggregator platform that unifies inventory from multiple retailers into a single searchable interface. The application enables users to search for automotive, motorcycle, ATV, boat, and powersports parts across vendors like AutoZone, O'Reilly, RockAuto, Amazon, and specialty suppliers. It prioritizes both price optimization and fulfillment speed, offering local pickup and shipping options.

**Brand Identity:**
- Domain: garagebot.io (primary), garagebot.net (redirect)
- Tagline: "Right Part. First Time. Every Engine."
- AI Mascot: "Buddy" - the conversational parts-finding assistant
- Target: All vehicles with engines - cars, trucks, motorcycles, ATVs, boats, RVs, small engines, Chinese imports

The platform features vehicle fleet management ("My Garage"), real-time deal tracking, shopping cart functionality with Stripe payments, and a developer dashboard for system monitoring. The business model includes affiliate commissions, premium subscriptions, and planned direct sales with crypto payment support.

# User Preferences

Preferred communication style: Simple, everyday language.

# Session Reminders

- **DOMAIN REDIRECT TODO**: Help user set up redirect from darkwavestudios.net → darkwavestudios.io (at end of session)

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite as the build tool and development server.

**UI Component System**: shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS. The design system uses a "Deep Space / Future Forward" theme with electric cyan accents, custom fonts (Rajdhani for headers, Inter for body, JetBrains Mono for code), and a dark color palette.

**State Management**: TanStack Query (React Query) handles server state with custom query client configuration. Cart state is managed through a React Context provider. Authentication state is queried via a custom `useAuth` hook.

**Routing**: Wouter provides client-side routing with key routes: Home (`/`), Results (`/results`), Garage (`/garage`), Dashboard (`/dashboard`), Account Setup (`/account`), and Checkout flow (`/checkout`, `/checkout/success`, `/checkout/cancel`).

**Animation**: Framer Motion powers transitions and UI animations throughout the application.

## Backend Architecture

**Runtime**: Node.js with Express framework serving both API endpoints and static frontend assets.

**API Design**: RESTful API with route handlers in `server/routes.ts`. Protected routes use authentication middleware (`isAuthenticated`). Key endpoints include:
- `/api/auth/user` - User session management
- `/api/vehicles` - Vehicle CRUD operations
- `/api/deals` - Deal/promotion management
- `/api/cart/*` - Shopping cart operations
- `/api/checkout/*` - Payment processing
- `/api/stripe/webhook` - Stripe webhook handler

**Session Management**: Express-session with PostgreSQL session store (`connect-pg-simple`). Sessions persist for 7 days with secure, httpOnly cookies.

**Authentication**: OpenID Connect (OIDC) integration with Replit's authentication service using Passport.js strategy. User claims are stored in session with access/refresh token rotation.

## AI Features (Buddy AI)

**Service**: Unified AI assistant service in `server/services/aiAssistant.ts` powered by OpenAI.

**Core Capabilities**:
- **Chat with Memory**: Persistent conversation history with vehicle context awareness (`/api/ai/buddy/chat-with-memory`)
- **Smart Recommendations**: Predictive part suggestions based on mileage, age, and common failures (`/api/ai/recommendations`, `/api/ai/buddy/smart-recommendations`)
- **DIY Repair Guides**: AI-generated step-by-step instructions for specific vehicles (`/api/ai/diy-guide`, `/api/ai/buddy/diy-guide`)
- **Mechanic Estimates**: Labor and parts cost estimates for repairs (`/api/ai/mechanic-estimate`, `/api/ai/buddy/mechanic-estimate`)
- **Proactive Alerts**: Maintenance reminders and seasonal suggestions (`/api/ai/buddy/alerts`)

**Frontend Components**:
- `SmartRecommendations.tsx`: Displays AI recommendations with DIY guides and mechanic estimates
- `ProactiveAlerts.tsx`: Shows maintenance alerts and reminders
- `BuddyChat.tsx`: Conversational interface with Buddy AI

**Integration Points**:
- Garage page "AI Insights" tab for vehicle-specific recommendations
- Home page Buddy chat for natural language parts search
- Vehicle context automatically included in all AI requests

## Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support.

**ORM**: Drizzle ORM provides type-safe database queries with schema-first design. Schema is defined in `shared/schema.ts` and migrations stored in `/migrations`.

**Core Tables**:
- `users` - User profiles with optional wallet addresses and genesis badges
- `vehicles` - User's saved vehicles with specifications (year, make, model, VIN, oil type, tire size)
- `deals` - Time-limited promotions with pricing and vendor info
- `hallmarks` - Genesis NFT/blockchain credentials for early users
- `carts` & `cart_items` - Shopping cart state (supports both authenticated and guest sessions)
- `orders` & `order_items` - Purchase history
- `sessions` - Express session storage
- Stripe tables (managed by `stripe-replit-sync`)

**Data Layer**: Storage abstraction interface (`IStorage`) implemented by `DatabaseStorage` class in `server/storage.ts`, providing clean separation between business logic and data access.

## Payment Processing

**Provider**: Stripe integration for credit card payments via Stripe Elements React components and backend SDK.

**Architecture**: 
- Frontend uses `@stripe/react-stripe-js` for card collection
- Backend manages Stripe clients via `server/stripeClient.ts` with credential fetching from Replit Connectors
- Webhook handling via managed webhook setup with `stripe-replit-sync` library
- Environment-aware keys (development vs production) based on `REPLIT_DEPLOYMENT` flag

**Future**: Planned Coinbase Commerce integration for cryptocurrency payments.

## Build & Deployment

**Development**: 
- Client dev server on port 5000 (Vite)
- Backend dev server uses tsx for TypeScript execution
- Hot module replacement and error overlays via Replit plugins

**Production Build**:
- Client: Vite builds to `dist/public`
- Server: esbuild bundles server to `dist/index.cjs` with selective dependency bundling (allowlist includes common deps like Drizzle, Stripe, Express to reduce cold start times)
- Build script in `script/build.ts` coordinates both builds

**Static Assets**: Served from `dist/public` in production, with fallback to index.html for SPA routing.

# External Dependencies

## Third-Party Services

**Authentication**: Replit OIDC service for user login and session management.

**Database**: Neon PostgreSQL (serverless) with connection pooling via WebSocket driver.

**Payment Processing**: 
- Stripe for card payments and subscription billing
- Stripe webhook managed by `stripe-replit-sync` package
- Stripe Connector on Replit provides API keys per environment

**Planned Integrations** (documented but not yet implemented):
- AutoZone, O'Reilly, NAPA, RockAuto APIs for inventory
- Amazon Automotive API
- VMC Chinese Parts, eBay Motors
- Coinbase Commerce for crypto payments
- Geolocation service for local store inventory

## Key NPM Packages

**UI/Frontend**:
- `@radix-ui/*` - Headless UI component primitives
- `tailwindcss`, `@tailwindcss/vite` - Styling
- `framer-motion` - Animations
- `wouter` - Routing
- `@tanstack/react-query` - Server state
- `embla-carousel-react` - Carousels
- `recharts` - Data visualization

**Backend**:
- `express` - Web server
- `drizzle-orm`, `drizzle-kit` - Database ORM
- `@neondatabase/serverless` - PostgreSQL driver
- `stripe` - Payment processing
- `stripe-replit-sync` - Stripe schema migrations
- `passport`, `passport-local`, `openid-client` - Authentication
- `express-session`, `connect-pg-simple` - Session management

**Build Tools**:
- `vite` - Frontend bundler
- `esbuild` - Server bundler
- `tsx` - TypeScript execution
- `@vitejs/plugin-react` - React fast refresh

**Replit-Specific**:
- `@replit/vite-plugin-runtime-error-modal` - Dev error overlay
- `@replit/vite-plugin-cartographer` - Dev tools
- `@replit/vite-plugin-dev-banner` - Dev environment indicator