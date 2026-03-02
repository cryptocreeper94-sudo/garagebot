import { Request, Response, NextFunction } from "express";

const BOT_USER_AGENTS = [
  "googlebot",
  "adsbot-google",
  "mediapartners-google",
  "adsbot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "google-inspectiontool",
  "google-adwords",
  "feedfetcher-google",
  "apis-google",
];

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => lower.includes(bot));
}

interface PageMeta {
  title: string;
  description: string;
  h1: string;
  content: string;
  canonical?: string;
  type?: string;
  structuredData?: object;
}

const BASE_URL = "https://garagebot.io";

const RETAILERS = [
  "AutoZone", "O'Reilly Auto Parts", "RockAuto", "Amazon", "NAPA Auto Parts",
  "Summit Racing", "eBay Motors", "Advance Auto Parts", "CarParts.com", "PartsGeek",
  "Tire Rack", "JC Whitney", "CarID", "4 Wheel Parts", "Dennis Kirk",
  "RevZilla", "J&P Cycles", "Cycle Gear", "BikeBandit", "Rocky Mountain ATV/MC",
  "Boat Outfitters", "West Marine", "Crowley Marine", "MarineEngine.com",
  "Camping World", "Eastwood", "LMC Truck", "Classic Industries", "Year One",
  "Holley", "Jegs", "Speedway Motors", "Traxxas", "Horizon Hobby", "AMain Hobbies",
  "Tower Hobbies", "GetFPV", "RaceDayQuads", "DJI", "Chemical Guys", "Generac",
  "Northern Tool", "Tractor Supply", "Aircraft Spruce", "Chief Aircraft",
];

const VEHICLE_TYPES = [
  "Cars & Trucks", "Motorcycles", "ATVs & UTVs", "Boats & Jet Skis",
  "RVs & Trailers", "Classic & Hot Rods", "Exotic & Luxury", "Diesel & Commercial",
  "Tractors & Farm Equipment", "Heavy Equipment", "Small Engines & Mowers",
  "Generators", "Aviation & Aircraft", "RC Cars & Crawlers", "Drones & FPV",
  "Model Aircraft", "Slot Cars", "Electric Bikes & Scooters",
];

const PART_CATEGORIES = [
  "Brakes", "Engine Parts", "Suspension", "Electrical", "Exhaust Systems",
  "Cooling Systems", "Filters", "Batteries", "Oil & Fluids", "Steering",
  "Transmission", "Ignition", "Belts & Hoses", "Body & Exterior",
  "Interior", "Lighting", "Tires & Wheels", "Powersports Parts",
  "Marine Parts", "Tools & Equipment",
];

function getPageMeta(path: string): PageMeta {
  const pages: Record<string, PageMeta> = {
    "/": {
      title: "GarageBot | Right Part. First Time. Every Engine.",
      description: `Search and compare auto parts prices across ${RETAILERS.length}+ retailers including AutoZone, O'Reilly, RockAuto, Amazon, NAPA and more. AI-powered vehicle diagnosis, DIY repair guides, and price comparison for cars, trucks, motorcycles, ATVs, boats, RVs, and hobby vehicles.`,
      h1: "Right Part. First Time. Every Engine.",
      content: `GarageBot is the ultimate parts aggregator for ALL motorized vehicles and equipment. Search across ${RETAILERS.length}+ retailers to find the exact part you need at the best price.

We support ${VEHICLE_TYPES.length}+ vehicle categories including ${VEHICLE_TYPES.slice(0, 10).join(", ")}, and more.

Browse parts by category: ${PART_CATEGORIES.join(", ")}.

Featured retailers: ${RETAILERS.slice(0, 20).join(", ")}, and ${RETAILERS.length - 20}+ more.

Key Features:
- AI-Powered Symptom Diagnosis: Describe what's wrong and our AI identifies the problem, finds the right parts, and links you directly to retailers.
- Price Comparison: Compare prices across 104 retailers instantly to find the best deal.
- Vehicle Fleet Management: Add your vehicles with VIN decoding and get vehicle-specific part recommendations.
- DIY Repair Guides: Step-by-step guides with video tutorials, tool lists, and difficulty ratings for every skill level.
- Parts Marketplace: Buy and sell used parts directly with other enthusiasts.
- TORQUE Shop Management: Professional shop management OS with work orders, CRM, invoicing, and inventory tracking.

Whether you're a weekend DIYer working on your car, a professional mechanic running a shop, or a hobbyist building RC cars and drones — GarageBot has you covered.`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "GarageBot",
        "url": BASE_URL,
        "description": `AI-powered auto parts aggregator searching ${RETAILERS.length}+ retailers for cars, trucks, motorcycles, ATVs, boats, RVs, drones, RC vehicles, and more.`,
        "applicationCategory": "ShoppingApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1247" },
        "creator": { "@type": "Organization", "name": "DarkWave Studios", "url": "https://darkwavestudios.io" },
      },
    },
    "/home": {
      title: "GarageBot Home | Search Parts Across 104 Retailers",
      description: `Search for auto parts across ${RETAILERS.length}+ retailers. Compare prices from AutoZone, O'Reilly, RockAuto, Amazon, NAPA, Summit Racing, eBay Motors and more. Find the right part at the best price for your vehicle.`,
      h1: "Search Parts Across 104+ Retailers",
      content: `Welcome to GarageBot — your AI-powered parts search engine.

Search for any part across ${RETAILERS.length}+ retailers including ${RETAILERS.slice(0, 15).join(", ")}, and more.

Supported vehicle types: ${VEHICLE_TYPES.join(", ")}.

Part categories: ${PART_CATEGORIES.join(", ")}.

Features available on this page:
- Vehicle-aware parts search with Year, Make, Model, and Submodel filters
- VIN scanner for instant vehicle identification
- Photo search to identify parts from pictures
- Voice search for hands-free part finding
- AI assistant (Buddy) for personalized recommendations
- Price comparison across all 104 retailers
- Deal alerts and trending searches`,
    },
    "/results": {
      title: "Parts Search Results | Compare Prices at 104 Retailers | GarageBot",
      description: "Compare auto parts prices across 104 retailers. Side-by-side pricing from AutoZone, O'Reilly, RockAuto, Amazon, NAPA, and 99 more stores. Filter by vehicle type, year, make, and model.",
      h1: "Parts Search Results — Compare Prices Across 104 Retailers",
      content: `Search results showing parts pricing across ${RETAILERS.length}+ retailers.

Compare prices side-by-side from: ${RETAILERS.join(", ")}.

Filter your search by:
- Vehicle Type: ${VEHICLE_TYPES.join(", ")}
- Year, Make, Model, and Submodel
- Part Category: ${PART_CATEGORIES.join(", ")}
- Price range, availability, and shipping options

Each result shows:
- Part name and compatibility information
- Prices from multiple retailers with direct purchase links
- Availability and estimated shipping times
- Customer ratings and reviews
- Affiliate-verified links to trusted retailers`,
    },
    "/diagnose": {
      title: "AI Vehicle Symptom Diagnosis | GarageBot",
      description: "Describe your vehicle's symptoms in plain English and our AI diagnoses the likely cause, identifies parts needed, shows DIY difficulty, urgency level, and estimated savings vs shop prices.",
      h1: "AI-Powered Vehicle Symptom Diagnosis",
      content: `GarageBot's AI Symptom Diagnosis Engine helps you figure out what's wrong with your vehicle.

How it works:
1. Describe what's happening — use plain English like "my car makes a grinding noise when I brake" or "engine overheats on the highway"
2. AI analyzes your symptoms and diagnoses the most likely causes ranked by probability
3. See the parts you need with direct links to buy from 104 retailers
4. Get DIY difficulty ratings, estimated repair time, and cost savings vs taking it to a shop
5. View step-by-step repair guides if you want to fix it yourself

Supported for all vehicle types: ${VEHICLE_TYPES.slice(0, 8).join(", ")}, and more.

Common diagnoses include:
- Brake issues (squealing, grinding, soft pedal, vibration)
- Engine problems (overheating, misfires, oil leaks, check engine light)
- Suspension concerns (clunking, bouncing, uneven tire wear)
- Electrical faults (battery drain, alternator failure, starter issues)
- Transmission troubles (slipping, hard shifting, fluid leaks)`,
    },
    "/diy-guides": {
      title: "DIY Repair Guides | Step-by-Step Vehicle Maintenance | GarageBot",
      description: "Comprehensive DIY repair guides for all skill levels. Step-by-step instructions with video tutorials, tool lists, difficulty ratings, and parts links for cars, trucks, motorcycles, and more.",
      h1: "DIY Repair Guides — Learn to Fix It Yourself",
      content: `GarageBot's DIY Repair Guide library covers everything from basic maintenance to advanced repairs.

Guide categories:
- Oil Changes & Fluid Flushes
- Brake Pad & Rotor Replacement
- Air Filter & Cabin Filter Changes
- Spark Plug Replacement
- Battery Testing & Replacement
- Tire Rotation & Balancing
- Suspension & Steering Repairs
- Electrical Troubleshooting
- Engine Maintenance
- Transmission Service

Each guide includes:
- Step-by-step written instructions
- Video tutorials and YouTube search queries
- Complete tool list with links to buy
- Parts needed with links to 104 retailers
- Difficulty rating (beginner to advanced)
- Estimated time to complete
- Estimated cost savings vs professional repair
- Safety warnings and tips

Available for: ${VEHICLE_TYPES.slice(0, 10).join(", ")}, and more.`,
    },
    "/torque": {
      title: "TORQUE — Shop Management OS for Auto Repair Shops | GarageBot",
      description: "TORQUE is a complete shop management system for auto repair businesses. Work orders, CRM, invoicing, inventory management, scheduling, and Trust Layer blockchain verification.",
      h1: "TORQUE — Shop Management OS",
      content: `TORQUE is GarageBot's professional-grade shop management operating system built for auto repair businesses of all sizes.

Features:
- Work Order Management: Create, track, and close work orders with full vehicle and customer details
- Customer CRM: Manage customer relationships, vehicle history, and communication
- Invoicing & Payments: Generate professional invoices and accept payments via Stripe
- Inventory Management: Track parts inventory, set reorder points, and manage suppliers
- Appointment Scheduling: Online booking, calendar management, and automated reminders
- Team Management: Staff scheduling, role permissions, and performance tracking
- Trust Layer Verification: Blockchain-verified shop identity and transaction records
- Business Integrations: Connect QuickBooks, ADP, Google Calendar, PartsTech, and more

TORQUE is available as a Progressive Web App (PWA) — install it directly from your browser for a native app experience on any device.

Pricing starts at $5.99/month with the Pro Founders Circle membership.`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "TORQUE Shop Management OS",
        "url": `${BASE_URL}/torque`,
        "description": "Professional shop management system for auto repair businesses with work orders, CRM, invoicing, and inventory management.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "5.99", "priceCurrency": "USD", "billingIncrement": "P1M" },
      },
    },
    "/pro": {
      title: "Pro Membership — Founders Circle | GarageBot",
      description: "Join the GarageBot Founders Circle from $5.99/month. Unlock marketplace selling, ad-free browsing, priority AI, exclusive badges, and full access to TORQUE shop management.",
      h1: "GarageBot Pro — Founders Circle Membership",
      content: `Join the Founders Circle and unlock the full GarageBot experience.

Pro Membership Benefits:
- Sell on the Parts Marketplace (reduced 6% buyer fee vs 10% for free users)
- Ad-free browsing across the entire platform
- Priority AI responses from Buddy
- Exclusive Founders Circle badge
- Full access to TORQUE Shop Management OS
- Genesis Hallmark blockchain certificate
- Priority support
- Early access to new features

Pricing:
- Monthly: $5.99/month
- Annual: $59.99/year (save 17%)

Ad-Free Only:
- $5/month to remove all ads without full Pro features

All plans include a money-back guarantee and can be canceled anytime.`,
    },
    "/shade-tree": {
      title: "Shade Tree Mechanics — DIY Community Hub | GarageBot",
      description: "Community hub for DIY vehicle enthusiasts. Browse repair guides, community tips, estimated savings vs shop prices, and connect with fellow shade tree mechanics.",
      h1: "Shade Tree Mechanics — DIY Community Hub",
      content: `The Shade Tree Mechanics community is your go-to resource for DIY vehicle repair knowledge.

What you'll find:
- Categorized repair guides from the community
- Tips and tricks from experienced DIYers
- Estimated savings vs professional shop prices
- Photo guides showing real-world repairs
- Tool recommendations and reviews
- Safety tips for home mechanics

Whether you're changing your first oil filter or rebuilding an engine, the Shade Tree community has advice, encouragement, and practical knowledge to help you succeed.`,
    },
    "/break-room": {
      title: "Break Room — Automotive News & Tools Hub | GarageBot",
      description: "Central hub for automotive news, receipt scanner, mileage tracker, NHTSA recall checker, maintenance scheduler, speed trap alerts, fuel price finder, and CDL resources.",
      h1: "The Break Room — News, Tools & Community",
      content: `The Break Room is GarageBot's central hub for everything beyond parts search.

Tools & Features:
- Motorsports & Automotive News Feed
- Receipt & Document Scanner
- Mileage Tracker
- NHTSA Recall Checker
- Maintenance Scheduler
- Speed Trap Alerts
- Fuel Price Finder
- Mechanic & Shop Directories
- CDL Schools & Trucking Program Finder

Stay informed, stay organized, and connect with the automotive community — all in one place.`,
    },
    "/blog": {
      title: "GarageBot Blog — Auto Parts & Repair Articles",
      description: "Expert articles on vehicle maintenance, auto parts reviews, industry news, DIY how-to guides, and tips for saving money on car repairs.",
      h1: "GarageBot Blog",
      content: `The GarageBot Blog features expert articles covering everything from routine maintenance to advanced repairs.

Topics we cover:
- Vehicle maintenance tips and schedules
- Auto parts reviews and comparisons
- Industry news and trends
- DIY how-to guides
- Money-saving tips for vehicle owners
- New vehicle technology updates
- Tool reviews and recommendations
- Seasonal maintenance checklists

Written by automotive enthusiasts and industry professionals for both DIYers and professional mechanics.`,
    },
    "/marketplace": {
      title: "Parts Marketplace — Buy & Sell Used Auto Parts | GarageBot",
      description: "Peer-to-peer marketplace for buying and selling used auto parts. List spare parts with photos, search by vehicle fitment, and connect with buyers and sellers directly.",
      h1: "Parts Marketplace — Buy & Sell Used Parts",
      content: `GarageBot's Parts Marketplace connects buyers and sellers of used auto parts.

For Sellers:
- List parts with photos and detailed descriptions
- Set your own prices — you keep 100% of the listed price
- Marketplace facilitation fee charged to buyers (6% for Pro, 10% for Basic)
- Secure payments processed through Stripe

For Buyers:
- Search parts by vehicle fitment (year, make, model)
- Browse photos and detailed descriptions
- Secure checkout with buyer protection
- Message sellers directly with questions

Supported categories include parts for ${VEHICLE_TYPES.slice(0, 8).join(", ")}, and more.`,
    },
    "/about": {
      title: "About GarageBot — DarkWave Studios",
      description: "Learn about GarageBot's mission to help everyone find the right part, first time, every engine. Built by DarkWave Studios.",
      h1: "About GarageBot",
      content: `GarageBot was built with one mission: Right Part. First Time. Every Engine.

We're solving a simple but frustrating problem — finding the right part for your vehicle shouldn't require visiting dozens of websites, guessing at fitment, or overpaying because you didn't know a better price existed.

GarageBot aggregates inventory and pricing from ${RETAILERS.length}+ retailers into a single search. Our AI helps diagnose problems, our guides help you fix them yourself, and our price comparison ensures you get the best deal.

Built by DarkWave Studios, GarageBot serves everyone from weekend DIYers to professional mechanics and RC hobby enthusiasts.

Contact: team@dwsc.io`,
    },
    "/hallmark": {
      title: "Genesis Hallmark — Blockchain Verified Certificate | GarageBot",
      description: "Blockchain-verified digital certificate on the Solana blockchain. Early adopters receive exclusive Genesis Hallmark NFTs as proof of their founding status.",
      h1: "Genesis Hallmark — Blockchain Verification",
      content: `The Genesis Hallmark is GarageBot's blockchain-verified digital certificate for early adopters.

Built on the Solana blockchain, each Genesis Hallmark features:
- SHA-256 hashed verification data stored on-chain
- QR code for instant verification by anyone
- Unique certificate ID linked to your GarageBot account
- Proof of founding member status
- Transferable digital asset

Genesis Hallmarks are exclusively available to early GarageBot members who join during the founding period.`,
    },
    "/insurance": {
      title: "Vehicle Insurance Comparison | GarageBot",
      description: "Compare vehicle insurance quotes from top providers. Auto, motorcycle, boat, RV, and commercial vehicle insurance comparison in one place.",
      h1: "Vehicle Insurance Comparison",
      content: `Compare vehicle insurance quotes from top providers all in one place.

Coverage types:
- Auto Insurance (cars, trucks, SUVs)
- Motorcycle Insurance
- Boat & Watercraft Insurance
- RV & Motorhome Insurance
- Commercial Vehicle Insurance
- Classic & Collector Car Insurance

Compare quotes, coverage options, and deductibles to find the best rate for your vehicles.`,
    },
    "/rentals": {
      title: "Rental Car Comparison — 1,000+ Companies | GarageBot",
      description: "Compare rental car prices across 1,000+ companies worldwide. Economy to luxury vehicles with free cancellation options in 150+ countries.",
      h1: "Rental Car Price Comparison",
      content: `Compare rental car prices across 1,000+ companies worldwide.

Partners include Carla Car Rental, Expedia, Hotels.com, and more.

Features:
- Economy to luxury vehicle options
- Free cancellation on most bookings
- Available in 150+ countries
- Best price guarantee from multiple providers`,
    },
    "/oem-parts": {
      title: "OEM Genuine Parts — 12+ Manufacturer Brands | GarageBot",
      description: "Genuine OEM parts from Toyota, Ford/Motorcraft, GM/ACDelco, Mopar, Honda, BMW, Nissan, Mercedes-Benz, Hyundai, Subaru, Volkswagen/Audi, and Kia.",
      h1: "OEM Genuine Parts Directory",
      content: `Find genuine OEM parts directly from the manufacturer.

Supported brands:
- Toyota Genuine Parts
- Ford / Motorcraft
- GM / ACDelco
- Mopar (Chrysler, Dodge, Jeep, Ram)
- Honda Genuine Parts
- BMW Original Parts
- Nissan Genuine Parts
- Mercedes-Benz Genuine Parts
- Hyundai Genuine Parts
- Subaru Genuine Parts
- Volkswagen / Audi Genuine Parts
- Kia Genuine Parts

OEM parts offer factory-spec fit, full manufacturer warranty, and zero compromises on quality.`,
    },
    "/chat": {
      title: "Signal Chat — Community Messaging | GarageBot",
      description: "Real-time community chat with channels, direct messages, threads, reactions, and AI bot support. Connect with fellow automotive enthusiasts.",
      h1: "Signal Chat — Community Messaging",
      content: `Signal Chat is GarageBot's real-time community messaging platform.

Features:
- Public channels for different topics
- Direct messages between members
- Threaded conversations
- Reactions and polls
- Buddy AI bot for instant support in #garagebot-support
- Cross-app identity via Trust Layer SSO

Join the conversation with fellow automotive enthusiasts, DIYers, and professional mechanics.`,
    },
    "/cdl-directory": {
      title: "CDL & Trucking Company Directory | GarageBot",
      description: "Directory of trucking companies and CDL training programs. Search, filter, and submit interest forms for CDL schools and trucking career opportunities.",
      h1: "CDL & Trucking Company Directory",
      content: `Find CDL training programs and trucking companies in your area.

Directory features:
- 50+ trucking companies and CDL programs listed
- Search and filter by location, type, and program
- Interest and referral forms for direct application
- Company profiles with program details
- Career resources for aspiring truck drivers`,
    },
  };

  return pages[path] || {
    title: "GarageBot | Right Part. First Time. Every Engine.",
    description: `Search and compare auto parts across ${RETAILERS.length}+ retailers. AI-powered diagnosis, DIY guides, and price comparison for all motorized vehicles.`,
    h1: "GarageBot — Parts Search for Every Engine",
    content: `GarageBot helps you find the right part at the best price across ${RETAILERS.length}+ retailers. Whether you need parts for a car, truck, motorcycle, ATV, boat, RV, drone, or RC vehicle — we search every major retailer so you don't have to.

Key features: AI Symptom Diagnosis, Price Comparison, DIY Repair Guides, Vehicle Fleet Management, Parts Marketplace, and TORQUE Shop Management.

Retailers: ${RETAILERS.slice(0, 25).join(", ")}, and more.`,
  };
}

function renderPrerenderedHTML(meta: PageMeta, path: string): string {
  const canonical = meta.canonical || `${BASE_URL}${path}`;
  const structuredDataScript = meta.structuredData
    ? `<script type="application/ld+json">${JSON.stringify(meta.structuredData)}</script>`
    : "";

  const contentParagraphs = meta.content
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p) => {
      const trimmed = p.trim();
      if (trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").map((line) => `<li>${line.replace(/^- /, "")}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (trimmed.includes(":") && trimmed.indexOf(":") < 60 && !trimmed.startsWith("http")) {
        const [heading, ...rest] = trimmed.split(":");
        if (rest.length && heading.length < 60) {
          return `<h3>${heading.trim()}</h3><p>${rest.join(":").trim()}</p>`;
        }
      }
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="GarageBot" />
  <meta name="language" content="English" />
  <meta name="google-adsense-account" content="ca-pub-7386731030203849" />
  <meta name="facebook-domain-verification" content="rsnhhv01n0e4vm400p4rc4lwgr9hlr" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${meta.type || "website"}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${BASE_URL}/attached_assets/garagebot_facebook_cover_16x9.png" />
  <meta property="og:site_name" content="GarageBot" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@TrustSignal26" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${BASE_URL}/attached_assets/garagebot_facebook_cover_16x9.png" />
  ${structuredDataScript}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7386731030203849" crossorigin="anonymous"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #050810; color: #e2e8f0; margin: 0; padding: 0; line-height: 1.7; }
    .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 2.2em; color: #06b6d4; margin-bottom: 0.5em; }
    h2 { font-size: 1.6em; color: #22d3ee; margin-top: 1.5em; }
    h3 { font-size: 1.2em; color: #67e8f9; margin-top: 1.2em; margin-bottom: 0.3em; }
    p { margin: 0.8em 0; color: #cbd5e1; }
    ul { margin: 0.5em 0; padding-left: 1.5em; }
    li { margin: 0.3em 0; color: #cbd5e1; }
    a { color: #06b6d4; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge { display: inline-block; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #06b6d4; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; margin-bottom: 1em; }
    nav { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    nav a { color: #94a3b8; font-size: 0.9em; }
    nav a:hover { color: #06b6d4; }
    .brand { font-size: 1.4em; font-weight: bold; color: #06b6d4; margin-right: auto; }
    footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 30px 20px; text-align: center; color: #475569; font-size: 0.85em; margin-top: 60px; }
    .ad-slot { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; min-height: 90px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #06b6d4, #2563eb); color: white; padding: 12px 32px; border-radius: 10px; font-weight: bold; font-size: 1.1em; margin: 20px 0; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">GarageBot</span>
    <a href="/">Home</a>
    <a href="/results">Search Parts</a>
    <a href="/diagnose">AI Diagnosis</a>
    <a href="/diy-guides">DIY Guides</a>
    <a href="/marketplace">Marketplace</a>
    <a href="/torque">TORQUE</a>
    <a href="/blog">Blog</a>
    <a href="/shade-tree">Community</a>
    <a href="/break-room">Break Room</a>
    <a href="/pro">Pro Membership</a>
    <a href="/about">About</a>
  </nav>

  <div class="container">
    <div class="badge">Searching ${RETAILERS.length}+ Retailers</div>
    <h1>${meta.h1}</h1>

    <div class="ad-slot">
      <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7386731030203849" data-ad-slot="HORIZONTAL_AD_SLOT" data-ad-format="horizontal" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>

    ${contentParagraphs}

    <div class="ad-slot">
      <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7386731030203849" data-ad-slot="RECTANGLE_AD_SLOT" data-ad-format="rectangle" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>

    <a href="/" class="cta">Search Parts Now →</a>

    <h2>Supported Vehicle Types</h2>
    <ul>
      ${VEHICLE_TYPES.map((t) => `<li><a href="/results?type=${t.toLowerCase().replace(/\s+/g, "-")}">${t}</a></li>`).join("\n      ")}
    </ul>

    <h2>Part Categories</h2>
    <ul>
      ${PART_CATEGORIES.map((c) => `<li><a href="/results?q=${encodeURIComponent(c)}">${c}</a></li>`).join("\n      ")}
    </ul>

    <h2>Featured Retailers</h2>
    <p>${RETAILERS.join(" • ")}</p>
  </div>

  <footer>
    <p>© ${new Date().getFullYear()} GarageBot — A DarkWave Studios Product. All rights reserved.</p>
    <p>
      <a href="/about">About</a> •
      <a href="/terms">Terms of Service</a> •
      <a href="/privacy">Privacy Policy</a> •
      <a href="/contact">Contact Us</a> •
      <a href="/affiliate-disclosure">Affiliate Disclosure</a>
    </p>
    <p>GarageBot.io — Right Part. First Time. Every Engine.</p>
  </footer>
</body>
</html>`;
}

export function seoPrerenderMiddleware(req: Request, res: Response, next: NextFunction) {
  const ua = req.headers["user-agent"] || "";

  if (!isBot(ua)) {
    return next();
  }

  if (req.path.startsWith("/api/") || req.path.startsWith("/ws/") || req.path.startsWith("/vite-hmr")) {
    return next();
  }

  const ext = req.path.split(".").pop();
  if (ext && ["js", "css", "png", "jpg", "jpeg", "gif", "svg", "ico", "woff", "woff2", "ttf", "json", "xml", "txt", "map", "mp4", "webm", "webp"].includes(ext)) {
    return next();
  }

  const meta = getPageMeta(req.path);
  const html = renderPrerenderedHTML(meta, req.path);
  res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
}
