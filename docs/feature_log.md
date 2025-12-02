# GarageBot Feature Log & Variable Tracker

**Last Updated: December 2, 2024 @ 6:45 PM EST**

## Brand Identity
- **Name:** GarageBot
- **Tagline:** "Right Part. First Time. Every Engine."
- **Domain:** garagebot.io (primary), garagebot.net (redirect)
- **AI Mascot:** Buddy - gauge-eyed junkyard robot, conversational parts-finding assistant

## Active Features (Completed)
*   **Universal Search Engine:** Aggregates results from 40+ retailers based on Year/Make/Model.
*   **"My Garage" Fleet Management:** Saves vehicle specs for all vehicle types with VIN decoding.
*   **AI Assistant "Buddy":** Conversational search with memory, smart recommendations, and animated mascot.
*   **Glossary System:** Interactive definitions with Buddy mascot popups.
*   **Developer Dashboard:** "Mission Control" for system monitoring and affiliate tracking.
*   **Shopping Cart:** Multi-vendor cart with Stripe checkout.
*   **Vehicle Type Selector:** Support for 18+ vehicle categories including cars, trucks, motorcycles, ATVs, boats, RVs, diesel, small engines, Chinese imports.
*   **Genesis Hallmark ($2/vehicle):** On-chain vehicle identity with Solana blockchain verification.
*   **Vehicle Passport:** VIN-decoded vehicle info with NHTSA recalls integration.
*   **Pro Subscription ($2.99/month):** Founders Circle pricing with Stripe integration.
*   **DIY Repair Guides:** AI-generated step-by-step maintenance instructions with YouTube links.
*   **Insurance Comparison:** Multi-carrier quotes page with lead generation.
*   **Mechanics Garage:** Shop management portal for professional mechanics.
*   **Member Referral Program:** Points-based referral system with signup tracking and Pro conversion bonuses.
*   **Weather Widget:** Live weather with radar integration and storm alerts.
*   **Bento Grid Layout:** Consistent max-w-6xl containers across all pages.

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
