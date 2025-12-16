# GarageBot Feature Log & Variable Tracker

**Last Updated: December 16, 2024**
**Current Version: v1.0.10 (Blockchain Verified)**
**Solana TX:** `3j9uyTLN2E9HXMoNEu4FssLifNt1KtqcwyqWHGQmGYAf2kRHMCL43AVHMxNRyABkHy9f1Si52Lr2QzxyEMqhvcyZ`

## Brand Identity
- **Name:** GarageBot
- **Tagline:** "Right Part. First Time. Every Engine."
- **Domain:** garagebot.io (primary), garagebot.net (redirect)
- **AI Mascot:** Buddy - cube-shaped AI assistant with conversational memory

## Version History
- **v1.0.10 (Dec 7):** Partner API system, DarkWave ecosystem integration, enhanced Mechanics Garage
- **v1.0.9 (Dec 6):** Release version control with blockchain verification
- **v1.0.8 (Dec 6):** Member referral program, points-based rewards
- **v1.0.7 (Dec 6):** Weather radar system with NOAA alerts
- **v1.0.6 (Dec 5):** Dev Portal with analytics dashboard
- **v1.0.5 (Dec 5):** Mechanics Garage shop management portal
- **v1.0.4 (Dec 5):** Buddy AI compacted to cube design
- **v1.0.3 (Dec 5):** UI polish, layout improvements, app hallmark badge
- **v1.0.2 (Dec 5):** AI-generated carousel images, Genesis Hallmark visual badges
- **v1.0.1 (Dec 4):** Bug fixes and polish
- **v1.0.0 (Dec 3):** Genesis Launch - full feature release

## Active Features (Completed)
*   **Universal Search Engine:** Aggregates results from 40+ retailers based on Year/Make/Model.
*   **"My Garage" Fleet Management:** Saves vehicle specs for all vehicle types with VIN decoding.
*   **AI Assistant "Buddy":** Compact cube design (64px/80px) with conversational memory, smart recommendations, and welcome popup.
*   **Glossary System:** Interactive definitions with Buddy mascot popups.
*   **Developer Portal (PIN: 0424):** Mission Control for system monitoring, affiliate tracking, and release management.
*   **Shopping Cart:** Multi-vendor cart with Stripe checkout.
*   **Vehicle Type Selector:** Support for 18+ vehicle categories including cars, trucks, motorcycles, ATVs, boats, RVs, diesel, small engines, Chinese imports.
*   **Genesis Hallmark:** On-chain vehicle identity with Solana mainnet verification, numbered badges with purple holographic styling ($9.99 free / $1.99 Pro).
*   **App Hallmark Badge:** Clickable GB-000001 badge in header linking to Genesis Hallmark page.
*   **Vehicle Passport:** VIN-decoded vehicle info with NHTSA recalls integration.
*   **Pro Subscription (Founders Circle):** $4.99/month or $39.99/year with Stripe integration. Price locks for early adopters.
*   **DIY Repair Guides:** AI-generated step-by-step maintenance instructions with YouTube links.
*   **Insurance Comparison:** Multi-carrier quotes page with lead generation.
*   **Mechanics Garage ($29.99/mo):** Full shop management portal for professional mechanics with CRM, orders, appointments, and staff management.
*   **Partner API System:** B2B RESTful API for Mechanics Garage shops with scoped authentication, rate limiting, and usage analytics.
*   **Member Referral Program:** Points-based referral system (100 pts/signup, 500 pts/Pro conversion) with tier redemption.
*   **Weather Radar:** Live weather with RainViewer radar and NOAA storm alerts.
*   **Release Version Control:** Draft → Publish workflow with automatic Solana blockchain verification.
*   **DarkWave Developer Hub Integration:** ORBIT Ecosystem connection for staff/contractor sync.
*   **Bento Grid Layout:** Consistent max-w-6xl containers across all pages.
*   **Image Carousels:** AI-generated images for vehicle types and categories.

## Planned Features (Backlog)
*   **Local Pickup Integration:**
    *   [x] ZIP-based location detection.
    *   [ ] Real-time store hours and inventory status.
*   **Affiliate Tier 2:**
    *   [ ] Product data feeds with real pricing & images.
    *   [ ] Direct retailer API integrations.
*   **SMS Service Reminders:**
    *   [ ] Twilio-powered maintenance notifications.
*   **Community Features:**
    *   [ ] User reviews for parts, shops, and vendors.
    *   [ ] Group parts by project (e.g., "Suspension Overhaul").
    *   [ ] Shareable wishlists.
*   **Payment Expansion:**
    *   [x] Stripe Connect for direct checkout.
    *   [ ] Coinbase Commerce for crypto payments.
*   **Mobile App (PWA):** Native-like experience on iOS and Android.

## Key Variables & Configuration
*   **Affiliate Rates:** 5-8% average.
*   **Genesis Hallmark Price:** $9.99 (free users) / $1.99 (Pro members).
*   **Pro Subscription (Founders Circle):** $4.99/month or $39.99/year (increases to $9.99/mo post-V2).
*   **Mechanics Garage:** $29.99/month or $249.99/year (increases to $49.99/mo post-V2).
*   **Stripe Fees:** 2.9% + $0.30 per transaction.
*   **Tech Stack:**
    *   Web: React 18, Vite, Tailwind CSS, shadcn/ui.
    *   Backend: Node.js/Express, PostgreSQL, Drizzle ORM.
    *   AI: OpenAI GPT-4 for Buddy assistant.
    *   Blockchain: Solana via Helius RPC.
    *   Mobile: React Native (Planned).

## Supported Vehicle Types
1. Automobiles (cars, trucks, SUVs)
2. Motorcycles
3. ATVs/UTVs
4. Boats/PWC
5. RVs/Motorhomes
6. Diesel/Commercial
7. Small Engines
8. Chinese Imports (VMC, etc.)
