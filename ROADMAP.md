# GarageBot Master Roadmap

*Last Updated: February 26, 2026*

## AI-Powered Features (Priority Order)

### 1. AI Symptom Diagnosis Engine ✅ BUILDING NOW
- **What**: User describes a vehicle problem in plain English ("my truck shakes at 60mph"), AI diagnoses likely causes, explains each one, and links directly to the parts needed from our 94 vendors
- **Why First**: Highest user value — turns GarageBot from a search tool into a diagnostic tool. No competitor does this. Drives part searches and affiliate revenue
- **Route**: Integrated into Buddy AI + standalone `/diagnose` page
- **Status**: In progress

### 2. AI Compatibility Checker
- **What**: Before clicking "buy," AI cross-references parts against the user's saved vehicles to confirm fitment. Shows green "Fits your 2019 F-150" or red "Does not fit" warnings
- **Why**: Prevents returns, builds trust, increases conversion. Makes saved vehicles more valuable
- **Route**: Overlay on search results and vendor links
- **Status**: Planned

### 3. AI Repair Cost Estimator
- **What**: User describes the repair needed, AI estimates parts cost (with vendor links) vs shop labor cost. "Water pump replacement: $45 DIY from RockAuto vs $380 at a shop — save $335"
- **Why**: Compelling reason to use GarageBot over going straight to a shop. Drives DIY guide views and part purchases
- **Route**: `/estimate` page + Buddy AI integration
- **Status**: Planned

### 4. AI Price Predictor & Deal Alerts
- **What**: Tracks price history and uses AI to predict price trends. "This part typically drops 15% in March" or "Lowest price in 90 days — buy now"
- **Why**: Creates urgency, brings users back, differentiates from static price comparison
- **Route**: Enhanced price alerts + Results page badges
- **Status**: Planned

### 5. AI Fleet Health Score
- **What**: For users with multiple saved vehicles, generates a health dashboard with proactive maintenance alerts, cost projections, and prioritized action items
- **Why**: Retention feature — gives users a reason to log in regularly. Drives recurring part purchases
- **Route**: `/garage` dashboard enhancement
- **Status**: Planned

### 6. AI Photo Part Identifier (Enhancement)
- **What**: Already built as PhotoSearch component. Enhance with better model accuracy, multi-angle support, and direct "Buy from X" buttons linked to vendor search results
- **Why**: Already partially built — quick win to polish
- **Route**: Existing PhotoSearch component
- **Status**: Partially built, needs enhancement

---

## Affiliate Growth (See FUTURE_AFFILIATES.md for details)

### Active: 93 vendors, 54 earning affiliate commissions across 9 networks
### Target: 100+ vendors by end of Q1 2026
### Priority Applications:
- AutoZone (CJ Affiliate)
- RockAuto (Direct)
- NAPA (Direct/CJ)
- RevZilla (CJ Affiliate)
- Tire Rack (Direct)

---

## Platform Enhancements

### SEO & Content
- Server-side rendering / pre-rendering for Googlebot
- Expand blog content for AdSense approval
- Structured data markup (Product, HowTo, FAQ schemas)

### Revenue
- Google AdSense activation (publisher ID set, awaiting approval)
- Google Ads campaigns (search + remarketing)
- Sponsored vendor listings in search results

### TORQUE Shop Management
- Subdomain routing live (torque.lid.io → /torque)
- PWA enhancements
- Shop analytics dashboard

---

*This is the single source of truth for GarageBot development priorities. All other roadmap/future files have been consolidated here.*
