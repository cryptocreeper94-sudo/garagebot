# GarageBot Feature Log & Variable Tracker

## Brand Identity
- **Name:** GarageBot
- **Tagline:** "Right Part. First Time. Every Engine."
- **Domain:** garagebot.io (primary), garagebot.net (redirect)
- **AI Mascot:** Buddy - gauge-eyed junkyard robot, conversational parts-finding assistant

## Active Features
*   **Universal Search Engine:** Aggregates results from 20+ retailers based on Year/Make/Model.
*   **"My Garage" Fleet Management:** Saves vehicle specs for all vehicle types.
*   **AI Assistant "Buddy":** Conversational search with image identification.
*   **Glossary System:** Interactive definitions with Buddy mascot popups.
*   **Developer Dashboard:** "Mission Control" for system monitoring and analytics.
*   **Shopping Cart:** Multi-vendor cart with Stripe checkout.
*   **Vehicle Type Selector:** Support for cars, trucks, motorcycles, ATVs, boats, RVs, diesel, small engines.

## Planned Features (Backlog)
*   **Local Pickup Integration:**
    *   [ ] Geolocation to find nearest stores.
    *   [ ] Real-time store hours and inventory status.
*   **Genesis Hallmark ($2/vehicle):**
    *   [ ] On-chain vehicle identity.
    *   [ ] VIN-decoded vehicle passport.
    *   [ ] Service history tracking.
*   **Pro Subscription ($2.99/month):**
    *   [ ] Price Drop Alerts.
    *   [ ] Priority AI support.
    *   [ ] Advanced wishlist features.
*   **Price Drop Alerts:**
    *   [ ] User sets target price.
    *   [ ] System monitors and notifies via Email/Push.
*   **Wishlist & Projects:**
    *   [ ] Group parts by project (e.g., "Suspension Overhaul").
    *   [ ] Shareable lists.
*   **Payment Integration:**
    *   [ ] Stripe Connect for direct checkout.
    *   [ ] Coinbase Commerce for crypto payments.
*   **Mechanic Reviews:** Community-driven reliability ratings.
*   **Build Guides:** Content integration with parts lists.
*   **Insurance Comparison:** Quote aggregation from multiple carriers.

## Key Variables & Configuration
*   **Affiliate Rates:** 5-8% average.
*   **Genesis Hallmark Price:** $2 per vehicle.
*   **Pro Subscription Cost:** $2.99/month.
*   **Stripe Fees:** 2.9% + $0.30 per transaction.
*   **Tech Stack:**
    *   Web: React 18, Vite, Tailwind CSS, shadcn/ui.
    *   Backend: Node.js/Express, PostgreSQL, Drizzle ORM.
    *   AI: OpenAI GPT-4 for Buddy assistant.
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
