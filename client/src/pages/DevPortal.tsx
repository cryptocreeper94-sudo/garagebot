import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lock, CheckCircle2, Circle, Plus, ExternalLink, Trash2, 
  DollarSign, Link2, Settings, Zap, Users, Shield, Clock,
  ChevronDown, ChevronRight, Edit2, Save, X, AlertTriangle,
  BookOpen, ArrowRight, CheckCheck, Timer, Globe, CreditCard,
  Copy, Mail, Phone, User, Tag, Rocket, Archive, GitBranch, Blocks, Car,
  MessageCircle, Send, Bot, Loader2, Megaphone, Search, Filter,
  LayoutDashboard, Activity
} from "lucide-react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const AFFILIATE_NETWORKS = [
  {
    id: "amazon",
    name: "Amazon Associates",
    logo: "🛒",
    url: "https://affiliate-program.amazon.com",
    commission: "1-10% (4.5% avg for auto)",
    approval: "24-48 hours",
    difficulty: "Easy",
    status: "connected" as const,
    retailers: ["Amazon Automotive", "Amazon Tools", "Amazon RC & Hobby", "Amazon Drones", "Amazon Model Kits"],
    requirements: [
      "Active website or social media",
      "Describe your promotional methods",
      "Must make 3 qualifying sales in 180 days or account closes"
    ],
    steps: [
      "Go to affiliate-program.amazon.com and click 'Sign Up'",
      "Enter your website URL (use garagebot.io or garagebot.replit.app)",
      "Describe your site: 'Auto parts search aggregator helping users find parts across retailers'",
      "Choose 'Automotive' as primary category",
      "Enter your payment/tax info",
      "Get your Associate ID (looks like: garagebot-20)"
    ],
    integration: "Update vendor records with your Associate tag. Links become: amazon.com/dp/ASIN?tag=YOUR-TAG",
    hobbyRetailers: ["Hosim RC (via Amazon)", "Bezgar (via Amazon)"]
  },
  {
    id: "cj",
    name: "CJ Affiliate (Commission Junction)",
    logo: "🔗",
    url: "https://www.cj.com/join",
    commission: "Varies by retailer (2-8%)",
    approval: "1-3 business days for CJ, then apply to each retailer",
    difficulty: "Medium",
    status: "connected" as const,
    retailers: ["Advance Auto Parts", "Summit Racing", "JEGS", "4 Wheel Parts", "Camping World", "CarParts.com"],
    requirements: [
      "Active website with content",
      "Apply to CJ network first, then each advertiser separately",
      "Some advertisers require minimum traffic"
    ],
    steps: [
      "Sign up at cj.com/join as a Publisher",
      "Complete your profile with website details",
      "Once approved, search 'Advertisers' for automotive retailers",
      "Apply to each retailer individually (Advance Auto, Summit, etc.)",
      "Wait for each retailer to approve your application",
      "Once approved, generate tracking links in the CJ dashboard"
    ],
    integration: "CJ provides unique tracking links for each retailer. Use their link generator or Deep Link Automation.",
    hobbyRetailers: ["Horizon Hobby"],
    hobbyAction: "Log into CJ dashboard → Search Advertisers → 'Horizon Hobby' → Apply to program → Once approved, generate tracking links for hobby products"
  },
  {
    id: "shareasale",
    name: "ShareASale",
    logo: "💰",
    url: "https://www.shareasale.com/info/affiliates/",
    commission: "Varies by retailer (3-10%)",
    approval: "24-72 hours for network, varies by retailer",
    difficulty: "Easy",
    status: "connected" as const,
    retailers: ["Partzilla", "PartsGeek", "1A Auto", "Jack's Small Engines", "Classic Industries", "RV Parts Country", "etrailer", "Rocky Mountain ATV/MC", "BikeBandit", "Year One"],
    requirements: [
      "Active website",
      "U.S. address for payments (or Payoneer)",
      "Apply to network, then individual merchants"
    ],
    steps: [
      "Go to shareasale.com and click 'Affiliate Sign Up'",
      "Enter your website and traffic details",
      "Describe your site: 'Automotive parts comparison and search platform'",
      "Once approved, browse Merchants → Automotive category",
      "Apply to relevant merchants (Partzilla, Jack's, etc.)",
      "Generate affiliate links from merchant dashboard"
    ],
    integration: "ShareASale provides tracking links. Use their bookmarklet or API for deep linking.",
    hobbyRetailers: ["Tower Hobbies", "GetFPV", "Redcat Racing"],
    hobbyAction: "Sign up for ShareASale network → Once approved → Search Merchants: 'Tower Hobbies', 'GetFPV', 'Redcat Racing' → Apply to each → Generate tracking links"
  },
  {
    id: "avantlink",
    name: "AvantLink",
    logo: "⚡",
    url: "https://www.avantlink.com/affiliates/",
    commission: "3-15% depending on retailer",
    approval: "1-5 business days",
    difficulty: "Medium",
    status: "pending" as const,
    retailers: ["Rocky Mountain ATV/MC", "Dennis Kirk", "RevZilla", "MotoSport", "Defender Marine"],
    requirements: [
      "Quality website with established content",
      "More selective than other networks",
      "Good for powersports/outdoor niches"
    ],
    steps: [
      "Apply at avantlink.com/affiliates",
      "Provide detailed website info and traffic estimates",
      "AvantLink manually reviews applications (takes longer)",
      "Once approved, search for merchants in Powersports/Automotive",
      "Apply to each merchant program",
      "Use their link builder or API for tracking"
    ],
    integration: "AvantLink has a good API for automated linking. Deep linking supported.",
    hobbyRetailers: ["AMain Hobbies", "RC Planet"],
    hobbyAction: "Sign up for AvantLink network → Once approved → Search Merchants: 'AMain Hobbies', 'RC Planet' → Apply to each → Generate tracking links"
  },
  {
    id: "impact",
    name: "Impact (formerly Impact Radius)",
    logo: "🎯",
    url: "https://impact.com/partners/",
    commission: "Varies (2-8%)",
    approval: "2-5 business days",
    difficulty: "Medium",
    status: "pending" as const,
    retailers: ["AutoZone", "Camping World", "Bass Pro Shops"],
    requirements: [
      "Established website with traffic",
      "Apply to network, then individual brands",
      "Some brands are invite-only"
    ],
    steps: [
      "Sign up at impact.com as a Partner",
      "Complete your media property profile",
      "Search Marketplace for automotive brands",
      "Apply to AutoZone and other relevant programs",
      "Generate tracking links once approved"
    ],
    integration: "Impact provides Universal Tracking Tags and deep linking tools."
  },
  {
    id: "awin",
    name: "Awin",
    logo: "🌐",
    url: "https://www.awin.com/us",
    commission: "Varies by retailer (3-10%)",
    approval: "1-5 business days for network, then apply per retailer",
    difficulty: "Medium",
    status: "connected" as const,
    retailers: ["OEDRO (truck accessories)", "Auto Parts Toys", "Dunford Inc", "Ottocast", "Guta Auto Parts"],
    requirements: [
      "Active website with content",
      "Apply to Awin network first, then each advertiser",
      "Some advertisers require minimum traffic"
    ],
    steps: [
      "Sign up at awin.com/us as a Publisher",
      "Complete your profile with website details",
      "Once approved, search for automotive advertisers",
      "Apply to each retailer individually",
      "Wait for retailer approval",
      "Generate tracking links in the Awin dashboard"
    ],
    integration: "Awin provides tracking links. Format: awin1.com/cread.php?awinmid=MERCHANT&awinaffid=YOUR_ID&p=DESTINATION_URL. Owns ShareASale."
  },
  {
    id: "ebay",
    name: "eBay Partner Network",
    logo: "🏷️",
    url: "https://partnernetwork.ebay.com",
    commission: "1-4% depending on category",
    approval: "Instant to 24 hours",
    difficulty: "Easy",
    status: "connected" as const,
    retailers: ["eBay Motors", "eBay Auto Parts", "eBay RC & Hobby", "eBay Drones"],
    requirements: [
      "Active website or social presence",
      "Agree to eBay Partner Network terms",
      "Easy approval process"
    ],
    steps: [
      "Go to partnernetwork.ebay.com",
      "Sign in with eBay account or create one",
      "Complete the application form",
      "Get approved (usually instant or same day)",
      "Use link generator for any eBay listing or search"
    ],
    integration: "eBay provides campaign IDs. Append to any eBay URL: &campid=YOUR_ID&toolid=10001"
  }
];

const DIRECT_RETAILERS = [
  {
    name: "RockAuto",
    contact: "Contact Form",
    contactUrl: "https://www.rockauto.com/help/",
    notes: "No formal affiliate program. They partner directly with automotive forums using discount codes. Approach as a content partnership.",
    status: "Forum Partnership",
    letterType: "forum_partnership"
  },
  {
    name: "O'Reilly Auto Parts",
    contact: "sponsorships@oreillyauto.com",
    contactAlt: "CoOps@oreillyauto.com",
    phone: "1-888-876-6759",
    notes: "No online affiliate program, but has sponsorship and cooperative programs for business partnerships.",
    status: "Sponsorship/B2B",
    letterType: "sponsorship"
  },
  {
    name: "NAPA Auto Parts",
    contact: "FlexOffers.com",
    contactUrl: "https://www.flexoffers.com/affiliate-programs/napa-auto-affiliate-program/",
    notes: "Has affiliate program through FlexOffers! 2% commission, 30-day cookie. Sign up at FlexOffers first.",
    status: "✓ Affiliate Available",
    letterType: null
  },
  {
    name: "VMC Chinese Parts",
    contact: "support@vmcchineseparts.com",
    phone: "(618) 529-2593",
    keyContact: "Bryan Black (Managing Partner)",
    notes: "Specializes in Chinese ATV/UTV/motorcycle/scooter parts. No current affiliate program - propose referral partnership.",
    status: "Direct Outreach",
    letterType: "referral_partnership"
  },
  {
    name: "Car-Part.com",
    contact: "info@car-part.com",
    ceoContact: "jschroder@car-part.com",
    keyContact: "Jeff Schroder (Founder & CEO)",
    phone: "(859) 344-1925",
    apiUrl: "https://products.car-part.com/webservices/",
    notes: "World's largest recycled auto parts marketplace. Has web services/API for data access. $80B in searches annually.",
    status: "API Partnership",
    letterType: "api_partnership"
  },
  {
    name: "HobbyKing",
    contact: "affiliates@hobbyking.com",
    contactUrl: "https://www.hobbyking.com/en_us/affiliate-program",
    notes: "Massive RC/drone parts retailer with direct affiliate program. 5-8% commission, 30-day cookie. One of the largest hobby retailers globally.",
    status: "Direct Program",
    letterType: "hobbyking_affiliate"
  },
  {
    name: "BETAFPV",
    contact: "marketing@betafpv.com",
    contactUrl: "https://betafpv.com/pages/affiliate-program",
    notes: "Leading FPV drone manufacturer and parts supplier. Direct affiliate/ambassador program. 5-10% commission on drone kits, frames, motors, and accessories.",
    status: "Direct Program",
    letterType: "betafpv_affiliate"
  }
];

const OUTREACH_LETTERS = {
  forum_partnership: {
    subject: "GarageBot.io Partnership Inquiry - Auto Parts Search Platform",
    body: `Dear RockAuto Team,

I'm Jason, the founder of GarageBot.io, a comprehensive auto parts search aggregator that helps vehicle owners find the right parts across 68+ retailers.

I understand RockAuto works with automotive communities through discount code partnerships rather than traditional affiliate programs. I'd love to explore a similar arrangement.

**About GarageBot:**
• Unified search across 68+ auto parts retailers
• Covers all vehicle types: cars, trucks, boats, ATVs, motorcycles, RVs, and more
• AI-powered part recommendations and DIY repair guides
• Growing community of DIY enthusiasts and professional mechanics

**Partnership Proposal:**
• Feature RockAuto prominently as a trusted retailer
• Provide exclusive discount codes to our user base
• Drive qualified traffic from users actively searching for parts
• Include RockAuto in our "Trusted Retailers" section

I believe our platforms complement each other well - you have the inventory and pricing, we have the search technology and engaged audience.

Would you be open to a brief call to discuss partnership opportunities?

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io`
  },
  sponsorship: {
    subject: "GarageBot.io - Auto Parts Platform Partnership Opportunity",
    body: `Dear O'Reilly Business Development Team,

I'm reaching out regarding potential partnership opportunities between O'Reilly Auto Parts and GarageBot.io.

**About GarageBot:**
GarageBot.io is a comprehensive auto parts search aggregator that unifies inventory from 68+ retailers into a single searchable interface. We serve DIY enthusiasts, professional mechanics, and fleet managers.

**Key Features:**
• VIN-based vehicle identification and part matching
• AI-powered repair guides and part recommendations
• "TORQUE" portal for professional shops
• Coverage across cars, trucks, boats, ATVs, motorcycles, RVs, and more

**Partnership Interests:**
1. **Affiliate/Referral Program** - Drive qualified buyers to O'Reilly locations and online store
2. **Local Pickup Integration** - Highlight O'Reilly stores for same-day pickup options
3. **Commercial Account** - Access to B2B pricing for our TORQUE portal users
4. **Sponsorship** - Featured placement in our trusted retailers section

Our users are actively searching for parts with purchase intent - making them highly valuable traffic for O'Reilly.

I'd welcome the opportunity to discuss how we can work together.

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io
`
  },
  referral_partnership: {
    subject: "Partnership Inquiry - GarageBot.io Auto Parts Aggregator",
    body: `Dear VMC Chinese Parts Team,

I'm Jason, founder of GarageBot.io, and I'm reaching out about a potential referral partnership.

**Why VMC Chinese Parts?**
Your specialization in Chinese-built ATV, UTV, scooter, go-kart, and dirt bike parts fills an important niche that major retailers don't serve well. Our users often struggle to find parts for these vehicles.

**About GarageBot:**
• Auto parts search aggregator covering 68+ retailers
• Strong focus on ALL vehicle types including ATVs, UTVs, scooters, and motorcycles
• AI-powered part identification and recommendations
• Growing user base of powersports enthusiasts

**Proposed Partnership:**
• Referral commission arrangement (we send buyers, you track and pay commission)
• Featured placement in our "Powersports Parts" category
• Integration of your catalog into our search results
• Mutual promotion to our respective audiences

Even a simple referral tracking link would allow us to drive qualified traffic your way while earning a small commission for successful sales.

Would you be interested in exploring this opportunity?

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io`
  },
  api_partnership: {
    subject: "API/Data Partnership Inquiry - GarageBot.io Parts Aggregator",
    body: `Dear Mr. Schroder,

I'm Jason, founder of GarageBot.io, a comprehensive auto parts search aggregator. I'm reaching out regarding potential API or data partnership opportunities with Car-Part.com.

**Why Car-Part.com?**
Your marketplace represents the gold standard for recycled/used auto parts - a category our users frequently request but we currently can't serve well. With $80 billion in annual part searches, your data would add tremendous value to our platform.

**About GarageBot:**
• Unified search across 68+ auto parts retailers (new parts focus currently)
• VIN decoding and vehicle-specific part matching
• AI-powered recommendations and DIY repair guides
• "TORQUE" portal for professional shops
• Covers all vehicle types: cars, trucks, classics, exotics, and more

**Partnership Interests:**
1. **API Access** - Integrate your used parts inventory into our search results
2. **Data Licensing** - Access to availability, pricing, and recycler network
3. **Referral Partnership** - Drive qualified buyers to your marketplace
4. **Interchange Data** - Leverage your Car-Part Interchange for better part matching

I understand you offer web services at products.car-part.com. We'd be very interested in discussing integration possibilities and licensing terms.

Would you have time for a brief call to explore this opportunity?

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io

P.S. I'm particularly impressed by your CIECA API Standards work - proper data exchange is crucial for our industry.`
  },
  hobbyking_affiliate: {
    subject: "GarageBot.io Affiliate Partnership - RC & Hobby Parts Platform",
    body: `Dear HobbyKing Affiliate Team,

I'm Jason, founder of GarageBot.io, a comprehensive parts search aggregator that recently expanded to cover the RC hobby, drone, and model aircraft markets.

**About GarageBot:**
• Parts search aggregator covering 68+ retailers across automotive AND hobby categories
• Dedicated sections for RC Cars, Drones/FPV, Model Aircraft, and Slot Cars
• AI-powered part recommendations and DIY build/upgrade guides
• Growing community of enthusiasts across all motorized categories

**Why HobbyKing?**
Your massive selection of RC, drone, and model aircraft parts makes you the go-to retailer for our hobby users. We want to feature HobbyKing prominently in our RC & Hobby, Drones & FPV, and Model Aircraft search results.

**Partnership Proposal:**
• Feature HobbyKing as a top-tier hobby retailer in all relevant search results
• Drive qualified traffic from users actively searching for hobby parts
• Promote HobbyKing in our DIY build guides and upgrade tutorials
• Include in our "Specialty Retailers" section for hobby categories

I'd love to join your affiliate program and start driving sales your way.

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io`
  },
  oem_partnership: {
    subject: "GarageBot.io — OEM Parts Distribution Partnership Inquiry",
    body: `Dear Partnership/Business Development Team,

I'm Jason, founder of GarageBot.io, a comprehensive auto parts search aggregator that unifies inventory from 68+ retailers into a single searchable interface for ALL motorized vehicles.

**About GarageBot:**
• Search aggregator covering 68+ retailers — auto, powersports, marine, diesel, RV, small engine, and hobby
• AI-powered Buddy assistant for part recommendations and DIY repair guides
• VIN decoding and vehicle-specific part matching
• "TORQUE" portal for professional shops with repair orders, estimates, scheduling
• Growing user base actively searching for parts with purchase intent

**Why OEM Parts Matter:**
Our users frequently search for genuine OEM parts, especially for newer vehicles and warranty-compliant repairs. Adding your OEM inventory to our platform ensures we can fulfill the "Right Part. First Time." promise.

**Partnership Proposal:**
1. **Affiliate/Referral Program** — Drive qualified buyers to your store and earn commission on sales
2. **Search Integration** — Feature your OEM catalog in our vehicle-specific search results
3. **TORQUE B2B** — Connect professional shops to your ordering platform
4. **Content Partnership** — Include your parts in our AI-generated DIY repair guides

Our platform drives high-intent traffic — users are actively searching for specific parts for specific vehicles. This makes our referrals highly valuable.

Would you be open to discussing partnership opportunities?

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io`
  },
  betafpv_affiliate: {
    subject: "GarageBot.io Affiliate/Ambassador Program - FPV Drone Parts Platform",
    body: `Dear BETAFPV Marketing Team,

I'm Jason, founder of GarageBot.io, a comprehensive parts search aggregator with a dedicated Drones & FPV section.

**About GarageBot:**
• Parts search aggregator covering 68+ retailers including a dedicated FPV/drone category
• AI-powered part recommendations for drone builds
• DIY build guides including "Build Your First FPV Drone" tutorials
• Growing community of FPV enthusiasts

**Why BETAFPV?**
Your products are essential for the FPV community - from ready-to-fly kits to individual components. Our drone users specifically search for BETAFPV products, and we want to make sure they can find you easily.

**Partnership Proposal:**
• Feature BETAFPV as a top drone parts retailer in our FPV search results
• Promote BETAFPV kits in our beginner FPV build guides
• Drive qualified traffic from users actively searching for drone parts
• Create dedicated content highlighting BETAFPV products

I'd love to join your affiliate or ambassador program and help more pilots discover your products.

Best regards,
Jason
Founder, GarageBot.io
https://garagebot.io`
  }
};

const AFFILIATE_OUTREACH_VENDORS = [
  {
    name: "SkyGeek",
    category: "Aviation",
    website: "https://skygeek.com",
    hasProgram: false,
    network: "None found",
    contact: "support@skygeek.com",
    phone: "",
    notes: "Aviation parts & pilot supplies. No public affiliate program. Contact directly or promote via Amazon Associates.",
    action: "Email to inquire about partnership",
    priority: "medium" as const,
  },
  {
    name: "Aircraft Spruce",
    category: "Aviation",
    website: "https://www.aircraftspruce.com",
    hasProgram: false,
    network: "None found",
    contact: "info@aircraftspruce.com",
    phone: "(877) 477-7823",
    notes: "Largest aviation parts supplier since 1965. No affiliate program but has wholesale/dealer program and international affiliates program.",
    action: "Contact for dealer/partner program",
    priority: "high" as const,
  },
  {
    name: "Wicks Aircraft Supply",
    category: "Aviation",
    website: "https://www.wicksaircraft.com",
    hasProgram: false,
    network: "Amazon Associates (indirect)",
    contact: "info@wicksaircraft.com",
    phone: "(800) 221-9425",
    notes: "Aircraft parts for wood, aluminum, tube & fabric, composites. Sells on Amazon - can promote via Amazon Associates. No direct affiliate program.",
    action: "Promote via Amazon Associates or contact directly",
    priority: "low" as const,
  },
  {
    name: "Chief Aircraft",
    category: "Aviation",
    website: "https://www.chiefaircraft.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "(800) 447-3408",
    notes: "General aviation parts, pilot supplies, avionics, RC models. FAA-approved repair station. No public affiliate program.",
    action: "Call to inquire about partner program",
    priority: "low" as const,
  },
  {
    name: "Preferred Airparts",
    category: "Aviation",
    website: "https://www.preferredairparts.com",
    hasProgram: false,
    network: "eBay (indirect)",
    contact: "Via website",
    phone: "(800) 433-0814",
    notes: "New surplus & used aircraft parts. Cessna/Piper specialist. 35-85% off list. Sells on eBay - promote via eBay Partner Network.",
    action: "Promote via eBay Partner Network or contact directly",
    priority: "low" as const,
  },
  {
    name: "MarineEngine.com",
    category: "Marine",
    website: "https://www.marineengine.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "(231) 627-0300",
    notes: "Boat parts & marine engine retailer. Outboard motors, inboard engines, sterndrives, repair manuals. No affiliate program found.",
    action: "Contact to propose referral partnership",
    priority: "medium" as const,
  },
  {
    name: "Wholesale Marine",
    category: "Marine",
    website: "https://www.wholesalemarine.com",
    hasProgram: true,
    network: "AvantLink",
    contact: "https://www.wholesalemarine.com/affiliate-program/",
    phone: "",
    notes: "Has active affiliate program via AvantLink! 2-5% commission, 14-day cookie, $200+ avg order. Similar inventory to MarineEngine.com.",
    action: "Sign up via AvantLink network",
    priority: "high" as const,
  },
  {
    name: "Car-Part.com",
    category: "Auto Parts (Used/Recycled)",
    website: "https://www.car-part.com",
    hasProgram: false,
    network: "None (B2B marketplace)",
    contact: "info@car-part.com",
    phone: "(859) 344-1925",
    keyContact: "Jeff Schroder (Founder & CEO)",
    notes: "World's largest recycled auto parts marketplace. 200M+ used parts, 3,100+ recyclers. B2B focused. Has web services API.",
    action: "Contact CEO for API/data partnership",
    priority: "high" as const,
  },
  {
    name: "VMC Chinese Parts",
    category: "Powersports (Chinese ATV/UTV)",
    website: "https://www.vmcchineseparts.com",
    hasProgram: false,
    network: "None found",
    contact: "support@vmcchineseparts.com",
    phone: "(618) 529-2593",
    notes: "Specializes in Chinese-built ATV, UTV, scooter, go-kart, dirt bike parts. 5,000+ SKUs. Based in Carbondale, IL. No affiliate program.",
    action: "Email to propose referral commission arrangement",
    priority: "medium" as const,
  },
  {
    name: "PPL Motorhomes",
    category: "RV",
    website: "https://www.pplmotorhomes.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "(800) 755-4775",
    notes: "RV consignment sales + RV Parts Superstore. Locations in TX, FL, OK. No affiliate program found. Focus on consignment model.",
    action: "Call to inquire about referral partnership",
    priority: "low" as const,
  },
  {
    name: "RV Parts Country",
    category: "RV",
    website: "https://www.rvpartscountry.com",
    hasProgram: false,
    network: "Possibly ShareASale",
    contact: "Via website contact form",
    phone: "",
    notes: "RV parts and accessories retailer. Has an 'Affiliate Partner Links' page but no formal signup. May be on ShareASale - check when account is approved.",
    action: "Check ShareASale for listing; contact directly if not found",
    priority: "medium" as const,
  },
  {
    name: "Steiner Tractor Parts",
    category: "Classic/Restoration (Tractors)",
    website: "https://www.steinertractor.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "",
    notes: "Vintage/antique tractor restoration parts since 1977. 760+ page catalog, 7,000+ parts. Brands: John Deere, Ford, Case, IH, etc. No affiliate program.",
    action: "Contact to propose content partnership",
    priority: "low" as const,
  },
  {
    name: "Mower Parts Group",
    category: "Lawn/Outdoor",
    website: "https://mowerpartsgroup.com",
    hasProgram: false,
    network: "Amazon (indirect)",
    contact: "Via website contact form",
    phone: "",
    notes: "Online lawn mower parts retailer. Sells on Amazon - can promote via Amazon Associates. No direct affiliate program found.",
    action: "Promote via Amazon Associates",
    priority: "low" as const,
  },
  {
    name: "Power Mower Sales",
    category: "Lawn/Outdoor",
    website: "https://powermowersales.com",
    hasProgram: true,
    network: "Direct",
    contact: "https://powermowersales.com",
    phone: "",
    notes: "Has 5% commission affiliate program! In business since 1966. Lawn mower parts, outdoor power equipment. Also runs Generac-parts.com and Snapper.parts.",
    action: "Sign up on their website for 5% commission program",
    priority: "high" as const,
  },
  {
    name: "TruckPro",
    category: "Heavy Duty",
    website: "https://www.truckpro.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website",
    phone: "",
    notes: "Largest independent heavy-duty truck/trailer parts distributor. 150+ locations, 33 states. 4M+ parts online. Owned by Platinum Equity.",
    action: "Contact corporate for B2B partnership",
    priority: "medium" as const,
  },
  {
    name: "FinditParts",
    category: "Heavy Duty",
    website: "https://www.finditparts.com",
    hasProgram: true,
    network: "CJ Affiliate / FlexOffers / VigLink",
    contact: "https://www.flexoffers.com/affiliate-programs/finditparts-affiliate-program/",
    phone: "",
    notes: "Has active affiliate program on multiple networks! Largest online heavy-duty truck parts marketplace. 7M+ parts, 800+ manufacturers. Apply via FlexOffers or CJ.",
    action: "Sign up via FlexOffers or CJ Affiliate",
    priority: "high" as const,
  },
  {
    name: "Vander Haag's",
    category: "Heavy Duty (Salvage)",
    website: "https://www.vanderhaags.com",
    hasProgram: false,
    network: "eBay (indirect)",
    contact: "Via website contact form",
    phone: "",
    notes: "Family-owned truck parts salvage since 1939. 11 Midwest locations, 360+ employees. New, used, rebuilt truck parts. Sells on eBay. 2024 Distributor of Year.",
    action: "Promote via eBay Partner Network or contact directly",
    priority: "low" as const,
  },
  {
    name: "Messick's Farm Equipment",
    category: "Farm/Tractor",
    website: "https://www.messicks.com",
    hasProgram: false,
    network: "eBay (indirect)",
    contact: "Via website",
    phone: "(800) 222-3373",
    notes: "PA-based farm equipment dealer. 1.3M+ parts, 250+ brands (Kubota, New Holland, Case IH). Sells on eBay (13K+ items sold). No affiliate program.",
    action: "Promote via eBay Partner Network or contact directly",
    priority: "low" as const,
  },
  {
    name: "Diesel Parts Direct",
    category: "Heavy Duty (Diesel)",
    website: "https://www.dieselpartsdirect.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "",
    notes: "40+ years diesel engine parts experience. A+ BBB rating. Cat, Cummins, Detroit Diesel, John Deere. No affiliate program found.",
    action: "Contact to propose referral partnership",
    priority: "low" as const,
  },
  {
    name: "AllPartsStore",
    category: "Farm/Tractor",
    website: "https://www.allpartsstore.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website",
    phone: "",
    notes: "Agricultural/industrial equipment parts (tractors, combines, turf/lawn care). Appears to be John Deere affiliated. No public affiliate program.",
    action: "Contact for dealer/partner program",
    priority: "low" as const,
  },
  {
    name: "RockAuto",
    category: "Auto Parts",
    website: "https://www.rockauto.com",
    hasProgram: false,
    network: "Forum discount codes only",
    contact: "https://www.rockauto.com/help/",
    phone: "",
    notes: "No formal affiliate program. Partners with automotive forums via discount codes. Approach as content/forum partnership.",
    action: "Submit partnership request via Help page",
    priority: "high" as const,
  },
  {
    name: "O'Reilly Auto Parts",
    category: "Auto Parts",
    website: "https://www.oreillyauto.com",
    hasProgram: false,
    network: "None (Sponsorship/B2B only)",
    contact: "sponsorships@oreillyauto.com",
    contactAlt: "CoOps@oreillyauto.com",
    phone: "(888) 876-6759",
    notes: "No online affiliate program. Has sponsorship and cooperative programs for business partnerships.",
    action: "Email sponsorship team for B2B partnership",
    priority: "high" as const,
  },
  {
    name: "AutoZone",
    category: "Auto Parts",
    website: "https://www.autozone.com",
    hasProgram: false,
    network: "Impact ($30/mo minimum — SKIP for now)",
    contact: "https://impact.com/partners/",
    phone: "",
    notes: "Affiliate program exists on Impact network but requires $30/month minimum subscription. Ruled out until traffic justifies cost. Bass Pro & Camping World also on Impact.",
    action: "Revisit when traffic volume justifies Impact subscription cost",
    priority: "low" as const,
  },
  {
    name: "Snowmobile.com",
    category: "Outdoor/Powersports",
    website: "https://www.snowmobile.com",
    hasProgram: false,
    network: "Amazon Associates (indirect)",
    contact: "Via website contact form",
    phone: "",
    notes: "Content/media site, not a retailer. They use Amazon Associates themselves. For snowmobile parts, consider Aurora Off Road (5% commission, 30-day cookie) instead.",
    action: "Skip - use Aurora Off Road or Amazon instead",
    priority: "low" as const,
  },
  {
    name: "Aurora Off Road",
    category: "Outdoor/Powersports (Snowmobile)",
    website: "https://www.auroraoffroad.com",
    hasProgram: true,
    network: "Direct (In-house)",
    contact: "https://www.auroraoffroad.com/main/affiliate-program/",
    phone: "",
    notes: "Snowmobile parts & accessories. 5% commission + 2.5% sub-affiliate, 30-day cookie, monthly payout ($25 min). Great replacement for Snowmobile.com.",
    action: "Sign up directly on their affiliate program page",
    priority: "high" as const,
  },
  {
    name: "Dennis Kirk",
    category: "Powersports",
    website: "https://www.denniskirk.com",
    hasProgram: false,
    network: "AvantLink (check when approved)",
    contact: "Via website contact form",
    phone: "",
    notes: "185,000+ snowmobile, motorcycle, ATV parts & accessories. Listed in AvantLink network - check when AvantLink account is approved.",
    action: "Apply via AvantLink once network account is approved",
    priority: "medium" as const,
  },
  {
    name: "Sixity Powersports",
    category: "Multi-category (Powersports)",
    website: "https://www.sixity.com",
    hasProgram: true,
    network: "FlexOffers / Pepperjam",
    contact: "https://www.sixity.com/affiliate-program",
    phone: "",
    notes: "100,000+ motorcycle, ATV, snowmobile, auto parts. Active affiliate program via FlexOffers. Good multi-vehicle coverage.",
    action: "Sign up via FlexOffers network",
    priority: "high" as const,
  },
  {
    name: "Sky Supply USA",
    category: "Aviation",
    website: "https://skysupplyusa.com",
    hasProgram: true,
    network: "Direct",
    contact: "https://skysupplyusa.com/pages/Affiliate-Program.html",
    phone: "",
    notes: "Aviation parts supplier with active affiliate program. Good alternative to SkyGeek for aviation coverage.",
    action: "Sign up on their affiliate program page",
    priority: "medium" as const,
  },
  {
    name: "Diesel Laptops",
    category: "Heavy Duty (Diagnostics)",
    website: "https://www.diesellaptops.com",
    hasProgram: true,
    network: "Direct",
    contact: "https://www.diesellaptops.com/pages/affiliate-program-referral",
    phone: "",
    notes: "Up to 15% commission on diesel diagnostic tools and software. Great complement to heavy-duty parts coverage.",
    action: "Sign up on their affiliate program page",
    priority: "medium" as const,
  },
  {
    name: "BuyAutoParts.com",
    category: "Auto Parts",
    website: "https://www.buyautoparts.com",
    hasProgram: true,
    network: "AvantLink / CJ Affiliate",
    contact: "https://www.buyautoparts.com/affiliate-program.html",
    phone: "",
    notes: "200,000+ replacement parts. 5-8% commission, 7-day cookie. 95% convert within 3 days. Good for used/recycled parts gap.",
    action: "Sign up via AvantLink or CJ Affiliate",
    priority: "high" as const,
  },
  {
    name: "Lawnmower Pros",
    category: "Lawn/Outdoor",
    website: "https://www.lawnmowerpros.com",
    hasProgram: true,
    network: "Direct",
    contact: "https://www.lawnmowerpros.com/information/affiliate-program.asp",
    phone: "",
    notes: "Lawn mower parts with direct affiliate program. Good addition to lawn/outdoor equipment coverage.",
    action: "Sign up on their affiliate program page",
    priority: "medium" as const,
  },
  {
    name: "Marine Products Pro Shop",
    category: "Marine",
    website: "https://www.marineproductsshop.com",
    hasProgram: true,
    network: "AvantLink",
    contact: "https://www.avantlink.com/programs/marine-products-pro-shop/",
    phone: "",
    notes: "Up to 13% commission, 120-day cookie, $250 avg order. Apply through AvantLink network. Excellent marine coverage addition.",
    action: "Apply via AvantLink once network account is approved",
    priority: "high" as const,
  },
  {
    name: "AutoNation Parts",
    category: "OEM (Auto)",
    website: "https://www.autonationparts.com",
    hasProgram: true,
    network: "CJ Affiliate",
    contact: "https://www.autonationparts.com/join-the-autonation-parts-affiliate-program",
    phone: "",
    notes: "Nation's largest auto retailer. Genuine OEM from all brands + aftermarket (Bosch, Denso). Also via CJ: signup.cj.com/member/signup/publisher/?cid=7394161",
    action: "Apply via CJ Affiliate or direct on their site",
    priority: "high" as const,
  },
  {
    name: "Parts Geek",
    category: "OEM (Auto)",
    website: "https://www.partsgeek.com",
    hasProgram: true,
    network: "FlexOffers",
    contact: "https://www.partsgeek.com/affliates.html",
    phone: "",
    notes: "10M+ OEM & aftermarket parts, 600+ brands. $0.32/purchase or 5-10% commission, 7-day cookie. Also on Shopper.com (instant approval) and VigLink.",
    action: "Apply via FlexOffers network",
    priority: "high" as const,
  },
  {
    name: "OEM Parts Online",
    category: "OEM (Auto)",
    website: "https://oempartsonline.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "",
    notes: "Multi-brand OEM catalogs, up to 35% off MSRP. Free shipping US, 2-3 day delivery. No public affiliate program — contact directly.",
    action: "Email to propose referral/affiliate partnership",
    priority: "medium" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Genuine OEM Auto Parts",
    category: "OEM (Diesel/Truck)",
    website: "https://genuineoemautoparts.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website contact form",
    phone: "",
    notes: "Mopar, Motorcraft, AcDelco, Caterpillar, Fleetguard. Diesel/truck focus. Global wholesale.",
    action: "Contact via website for referral partnership inquiry",
    priority: "medium" as const,
    letterType: "oem_partnership",
  },
  {
    name: "OEM Surplus Depot",
    category: "OEM (Auto — Japanese)",
    website: "https://oemsurplus.parts",
    hasProgram: false,
    network: "None found",
    contact: "Via website",
    phone: "",
    notes: "Nissan, Toyota, Lexus, Infiniti, Kia, Hyundai, Mazda, Honda surplus. 40 years in business. Nationwide via UPS.",
    action: "Contact for referral/affiliate partnership",
    priority: "medium" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Keystone Automotive",
    category: "OEM (Wholesale Distributor)",
    website: "https://www.keystoneautomotive.com",
    hasProgram: false,
    network: "None (wholesale only)",
    contact: "customercare@ekeystone.com",
    phone: "1-800-521-9999",
    notes: "Major national distributor (LKQ Corp). 185K+ SKUs, 800+ suppliers, 8 warehouses. Next-day delivery 48 states. Exports to 70+ countries.",
    action: "Apply at keystoneautomotive.com/newcustomers for dealer account, or call for partnership inquiry",
    priority: "high" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Factory Motor Parts (FMP)",
    category: "OEM (Wholesale Distributor)",
    website: "https://www.factorymotorparts.com",
    hasProgram: false,
    network: "None (wholesale only)",
    contact: "https://www.factorymotorparts.com/contact-us",
    phone: "800-278-6394",
    notes: "Family-owned since 1945. 300+ locations. OEM + aftermarket, import parts, virtual inventory, GPS tracking. Select 'New Customer' on contact form.",
    action: "Call 800-278-6394 or submit New Customer form on website",
    priority: "high" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Western Power Sports (WPS)",
    category: "OEM (Powersports)",
    website: "https://www.wps.com",
    hasProgram: false,
    network: "None (dealer only)",
    contact: "Via website",
    phone: "",
    notes: "Honda, Kawasaki, Yamaha, Suzuki, KTM, Polaris, Can-Am, Arctic Cat, Sea-Doo. 120K+ parts. 5 regional warehouses. HardDrive Parts = V-Twin division.",
    action: "Contact for dealer/partner program inquiry",
    priority: "high" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Parts Unlimited",
    category: "OEM (Powersports)",
    website: "https://www.partsunlimited.com",
    hasProgram: false,
    network: "None (dealer only)",
    contact: "Via website",
    phone: "",
    notes: "World's largest powersports aftermarket distributor. 75K+ parts, all major brands.",
    action: "Contact for dealer/partner program inquiry",
    priority: "high" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Dealer Cost Parts",
    category: "OEM (Powersports)",
    website: "https://www.dealercostparts.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website",
    phone: "",
    notes: "OEM parts at dealer cost: Arctic Cat, Can-Am, Honda, Indian, Kawasaki, KTM, Polaris, Sea-Doo, Ski-Doo, Suzuki, Yamaha.",
    action: "Contact for partnership/affiliate inquiry",
    priority: "medium" as const,
    letterType: "oem_partnership",
  },
  {
    name: "The OEM Parts Store",
    category: "OEM (Small Engine)",
    website: "https://www.theoempartsstore.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website",
    phone: "",
    notes: "Briggs & Stratton, Kohler, Tecumseh, Honda, Kawasaki. 1M+ parts. Wholesale/dealer pricing available for shops.",
    action: "Contact for wholesale/affiliate partnership",
    priority: "medium" as const,
    letterType: "oem_partnership",
  },
  {
    name: "Medart Engine",
    category: "OEM (Small Engine/Industrial)",
    website: "https://www.medartengine.com",
    hasProgram: false,
    network: "None found",
    contact: "Via website",
    phone: "",
    notes: "80+ manufacturers, 50K+ part numbers. 5 distribution locations. Outdoor power, rental, industrial equipment.",
    action: "Contact for dealer/wholesale program",
    priority: "medium" as const,
    letterType: "oem_partnership",
  },
];


const DEV_PIN = "0424";

interface DevTask {
  id: string;
  category: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  dueDate: string | null;
  completedAt: string | null;
  link: string | null;
  notes: string | null;
  sortOrder: number | null;
}

const CATEGORIES = [
  { id: "affiliates", name: "Affiliate Programs", icon: DollarSign, color: "text-green-400" },
  { id: "apis", name: "API Integrations", icon: Link2, color: "text-blue-400" },
  { id: "shop_integrations", name: "Shop Software OAuth", icon: Link2, color: "text-orange-400" },
  { id: "parts_ordering", name: "Parts & Tool Ordering", icon: Settings, color: "text-amber-400" },
  { id: "features", name: "Feature Development", icon: Zap, color: "text-yellow-400" },
  { id: "marketing", name: "Marketing & Monetization", icon: DollarSign, color: "text-pink-400" },
  { id: "oem_distributors", name: "OEM Parts Distributors", icon: Car, color: "text-emerald-400" },
  { id: "partnerships", name: "Partnerships", icon: Users, color: "text-purple-400" },
  { id: "infrastructure", name: "Infrastructure", icon: Settings, color: "text-cyan-400" },
];

const DEFAULT_TASKS: Omit<DevTask, 'id' | 'completedAt'>[] = [
  { category: "affiliates", title: "AutoZone Affiliate Program", description: "Sign up for AutoZone affiliate program through CJ Affiliate", priority: "high", status: "pending", dueDate: null, link: "https://www.cj.com", notes: null, sortOrder: 1 },
  { category: "affiliates", title: "O'Reilly Auto Parts Affiliate", description: "Apply for O'Reilly affiliate partnership", priority: "high", status: "pending", dueDate: null, link: "https://www.oreillyauto.com", notes: null, sortOrder: 2 },
  { category: "affiliates", title: "RockAuto Affiliate Program", description: "Join RockAuto affiliate network", priority: "high", status: "pending", dueDate: null, link: "https://www.rockauto.com", notes: null, sortOrder: 3 },
  { category: "affiliates", title: "Advance Auto Parts Affiliate", description: "Apply for Advance Auto affiliate program", priority: "medium", status: "pending", dueDate: null, link: "https://www.advanceautoparts.com", notes: null, sortOrder: 5 },
  { category: "affiliates", title: "NAPA Online Affiliate", description: "Join NAPA affiliate network", priority: "medium", status: "pending", dueDate: null, link: "https://www.napaonline.com", notes: null, sortOrder: 6 },
  { category: "affiliates", title: "Summit Racing Affiliate", description: "Apply for Summit Racing affiliate partnership", priority: "medium", status: "pending", dueDate: null, link: "https://www.summitracing.com", notes: null, sortOrder: 7 },
  { category: "affiliates", title: "Dennis Kirk Affiliate", description: "Powersports affiliate program", priority: "medium", status: "pending", dueDate: null, link: "https://www.denniskirk.com", notes: null, sortOrder: 8 },
  { category: "affiliates", title: "West Marine Affiliate", description: "Marine parts affiliate partnership", priority: "medium", status: "pending", dueDate: null, link: "https://www.westmarine.com", notes: null, sortOrder: 9 },
  { category: "affiliates", title: "CJ: Add Horizon Hobby Merchant", description: "Log into CJ dashboard → Search Advertisers → 'Horizon Hobby' → Apply to their program", priority: "high", status: "pending", dueDate: null, link: "https://members.cj.com", notes: "CJ account already connected - just need to add this merchant", sortOrder: 11 },
  { category: "affiliates", title: "ShareASale: Sign Up & Add Hobby Merchants", description: "Sign up for ShareASale network, then apply to Tower Hobbies, GetFPV, and Redcat Racing", priority: "high", status: "pending", dueDate: null, link: "https://www.shareasale.com/info/affiliates/", notes: "3 hobby merchants to add once network is approved", sortOrder: 12 },
  { category: "affiliates", title: "AvantLink: Sign Up & Add Hobby Merchants", description: "Sign up for AvantLink network, then apply to AMain Hobbies and RC Planet", priority: "high", status: "pending", dueDate: null, link: "https://www.avantlink.com/affiliates/", notes: "2 hobby merchants to add once network is approved", sortOrder: 13 },
  { category: "affiliates", title: "HobbyKing Direct Affiliate", description: "Apply for HobbyKing's direct affiliate program - email or use website form", priority: "medium", status: "pending", dueDate: null, link: "https://www.hobbyking.com/en_us/affiliate-program", notes: "Direct program - 5-8% commission, 30-day cookie", sortOrder: 14 },
  { category: "affiliates", title: "BETAFPV Direct Affiliate", description: "Apply for BETAFPV's affiliate/ambassador program - email marketing team", priority: "medium", status: "pending", dueDate: null, link: "https://betafpv.com/pages/affiliate-program", notes: "Direct program - 5-10% commission on FPV products", sortOrder: 15 },
  { category: "apis", title: "OpenAI Vision API", description: "Enable photo-based part identification", priority: "high", status: "pending", dueDate: null, link: "https://platform.openai.com", notes: null, sortOrder: 3 },
  { category: "apis", title: "Web Speech API", description: "Implement voice search with Hey Buddy", priority: "medium", status: "pending", dueDate: null, link: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API", notes: null, sortOrder: 4 },
  { category: "apis", title: "Twilio SMS API", description: "Enable SMS notifications and reminders", priority: "medium", status: "pending", dueDate: null, link: "https://www.twilio.com", notes: null, sortOrder: 6 },
  { category: "features", title: "VIN Scanner Camera", description: "Build camera-based VIN scanning feature", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "features", title: "Photo Part Search", description: "Snap photo → AI identifies part", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "features", title: "Voice Search (Hey Buddy)", description: "Voice-activated search commands", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "features", title: "Predictive Maintenance", description: "Mileage-based service reminders", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 4 },
  { category: "features", title: "Family Garage Sharing", description: "Share vehicles with family members", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 5 },
  { category: "features", title: "Collaborative Carts", description: "Family can add to shared carts", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 6 },
  { category: "features", title: "PWA Offline Mode", description: "Works without internet in garage", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 7 },
  { category: "features", title: "Order Tracking", description: "Track parts shipments", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 8 },
  { category: "partnerships", title: "Insurance Company Partnerships", description: "Set up referral agreements with auto insurers", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "partnerships", title: "Mechanic Shop Network", description: "Recruit shops to Shop Portal", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "partnerships", title: "Extended Warranty Partners", description: "Referral deals with warranty providers", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "infrastructure", title: "Domain: garagebot.io", description: "Register and configure primary domain", priority: "high", status: "pending", dueDate: null, link: "https://domains.google.com", notes: null, sortOrder: 1 },
  { category: "infrastructure", title: "Domain: garagebot.net", description: "Set up redirect domain", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "infrastructure", title: "SSL Certificates", description: "Ensure SSL on all domains", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "infrastructure", title: "CDN Setup", description: "Configure CDN for assets", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 4 },
  
  { category: "shop_integrations", title: "QuickBooks Online OAuth", description: "OAuth 2.0 - Sync invoices, payments, financial reports. Apply at developer.intuit.com", priority: "high", status: "pending", dueDate: null, link: "https://developer.intuit.com", notes: "OAuth 2.0, access token expires 1hr, refresh 100 days", sortOrder: 1 },
  { category: "shop_integrations", title: "FreshBooks OAuth", description: "OAuth 2.0 - Time tracking, invoicing, expense management", priority: "medium", status: "pending", dueDate: null, link: "https://www.freshbooks.com/api", notes: "OAuth 2.0 Authorization Code flow", sortOrder: 2 },
  { category: "shop_integrations", title: "Xero OAuth", description: "OAuth 2.0 - Cloud accounting with powerful reporting", priority: "medium", status: "pending", dueDate: null, link: "https://developer.xero.com", notes: "OAuth 2.0, PKCE flow recommended", sortOrder: 3 },
  { category: "shop_integrations", title: "Wave Accounting API", description: "Free accounting software API integration", priority: "low", status: "pending", dueDate: null, link: "https://developer.waveapps.com", notes: "GraphQL API", sortOrder: 4 },
  
  { category: "shop_integrations", title: "UKG Pro OAuth", description: "OAuth 2.0 - HR, payroll, talent management. Apply at developer.ukg.com", priority: "high", status: "pending", dueDate: null, link: "https://developer.ukg.com", notes: "OAuth 2.0 client credentials, token ~30min", sortOrder: 5 },
  { category: "shop_integrations", title: "ADP OAuth", description: "OAuth 2.0 - Payroll, HR, workforce management", priority: "high", status: "pending", dueDate: null, link: "https://developers.adp.com", notes: "OAuth 2.0, requires partner approval", sortOrder: 6 },
  { category: "shop_integrations", title: "Gusto OAuth", description: "OAuth 2.0 - Modern payroll and benefits for small business", priority: "medium", status: "pending", dueDate: null, link: "https://dev.gusto.com", notes: "OAuth 2.0, REST API", sortOrder: 7 },
  { category: "shop_integrations", title: "Paychex API", description: "Payroll and HR services integration", priority: "medium", status: "pending", dueDate: null, link: "https://developer.paychex.com", notes: "REST API with OAuth", sortOrder: 8 },
  
  { category: "shop_integrations", title: "Google Calendar OAuth", description: "OAuth 2.0 - Sync appointments with Google accounts", priority: "high", status: "pending", dueDate: null, link: "https://console.cloud.google.com", notes: "OAuth 2.0, calendar.events scope", sortOrder: 9 },
  { category: "shop_integrations", title: "Google Workspace OAuth", description: "OAuth 2.0 - Gmail, Drive, Sheets integration", priority: "medium", status: "pending", dueDate: null, link: "https://console.cloud.google.com", notes: "OAuth 2.0, multiple scopes available", sortOrder: 10 },
  { category: "shop_integrations", title: "Microsoft 365 OAuth", description: "OAuth 2.0 - Outlook calendar and email sync", priority: "medium", status: "pending", dueDate: null, link: "https://portal.azure.com", notes: "Azure AD OAuth 2.0", sortOrder: 11 },
  { category: "shop_integrations", title: "Twilio API", description: "API Key - SMS notifications and customer messaging", priority: "high", status: "pending", dueDate: null, link: "https://www.twilio.com/console", notes: "API Key auth, no OAuth", sortOrder: 12 },
  { category: "shop_integrations", title: "SendGrid API", description: "API Key - Email notifications and invoices", priority: "medium", status: "pending", dueDate: null, link: "https://app.sendgrid.com", notes: "API Key auth, 69 char keys", sortOrder: 13 },
  { category: "shop_integrations", title: "Mailchimp OAuth", description: "OAuth 2.0 - Email marketing and customer outreach", priority: "low", status: "pending", dueDate: null, link: "https://mailchimp.com/developer", notes: "OAuth 2.0, tokens never expire", sortOrder: 14 },
  
  { category: "shop_integrations", title: "CARFAX API", description: "Vehicle history report integration", priority: "high", status: "pending", dueDate: null, link: "https://www.carfaxforlife.com", notes: "Contact for partnership", sortOrder: 15 },
  { category: "shop_integrations", title: "AutoCheck API", description: "Vehicle history from Experian", priority: "medium", status: "pending", dueDate: null, link: "https://www.autocheck.com", notes: "Contact for API access", sortOrder: 16 },
  { category: "shop_integrations", title: "Smartcar OAuth", description: "OAuth 2.0 - Connected vehicle data from 30+ brands", priority: "medium", status: "pending", dueDate: null, link: "https://smartcar.com/developers", notes: "OAuth 2.0, real-time vehicle data", sortOrder: 17 },
  
  { category: "shop_integrations", title: "Square OAuth", description: "OAuth 2.0 - Payment processing and POS", priority: "medium", status: "pending", dueDate: null, link: "https://developer.squareup.com", notes: "OAuth 2.0 for Connect API", sortOrder: 18 },
  { category: "shop_integrations", title: "PayPal OAuth", description: "OAuth 2.0 - Alternative payment option", priority: "low", status: "pending", dueDate: null, link: "https://developer.paypal.com", notes: "OAuth 2.0 REST API", sortOrder: 19 },
  
  { category: "shop_integrations", title: "Shopmonkey API", description: "API/OAuth - Import customer data from Shopmonkey shops", priority: "medium", status: "pending", dueDate: null, link: "https://shopmonkey.dev", notes: "REST API, Bearer token auth", sortOrder: 20 },
  { category: "shop_integrations", title: "Tekmetric API", description: "REST API - Import from Tekmetric shops", priority: "medium", status: "pending", dueDate: null, link: "https://api.tekmetric.com", notes: "REST API with OAuth", sortOrder: 21 },
  { category: "shop_integrations", title: "Mitchell 1 API", description: "Shop management data import", priority: "low", status: "pending", dueDate: null, link: "https://mitchell1.com", notes: "Contact for API access", sortOrder: 22 },
  
  { category: "parts_ordering", title: "PartsTech API (FREE)", description: "FREE API - Search 20,000+ suppliers, 7M+ parts, VIN lookup", priority: "high", status: "pending", dueDate: null, link: "https://partstech.com", notes: "FREE - Username + API key auth", sortOrder: 1 },
  { category: "parts_ordering", title: "Nexpart/WHI Solutions API", description: "43,000+ seller locations, multi-seller stock check", priority: "high", status: "pending", dueDate: null, link: "https://whisolutions.com/products/nexpart-ecommerce-solution", notes: "SDK + REST API, contact WHI", sortOrder: 2 },
  { category: "parts_ordering", title: "WorldPac SpeedDIAL API", description: "OEM and import parts distributor", priority: "medium", status: "pending", dueDate: null, link: "https://worldpac.com", notes: "Contact for API access", sortOrder: 3 },
  { category: "parts_ordering", title: "RepairLink API", description: "OEM parts ordering integration", priority: "medium", status: "pending", dueDate: null, link: "https://repairlink.com", notes: "OEM parts network", sortOrder: 4 },
  { category: "parts_ordering", title: "AutoZone Pro Commercial", description: "Commercial account integration for shops", priority: "high", status: "pending", dueDate: null, link: "https://www.autozonepro.com", notes: "Contact for commercial API", sortOrder: 5 },
  { category: "parts_ordering", title: "O'Reilly Pro Commercial", description: "Commercial/shop account ordering", priority: "high", status: "pending", dueDate: null, link: "https://www.oreillyauto.com", notes: "Contact for commercial partnership", sortOrder: 6 },
  { category: "parts_ordering", title: "Advance Pro Commercial", description: "Commercial parts ordering for shops", priority: "medium", status: "pending", dueDate: null, link: "https://shop.advanceautoparts.com", notes: "Contact for pro account API", sortOrder: 7 },
  { category: "parts_ordering", title: "NAPA TRACS Integration", description: "NAPA commercial shop ordering", priority: "medium", status: "pending", dueDate: null, link: "https://napatracs.com", notes: "NAPA commercial accounts", sortOrder: 8 },
  
  { category: "parts_ordering", title: "Grainger API", description: "Industrial tool and supply ordering", priority: "medium", status: "pending", dueDate: null, link: "https://www.grainger.com", notes: "B2B API available", sortOrder: 9 },
  { category: "parts_ordering", title: "MSC Industrial API", description: "Industrial tools and metalworking", priority: "medium", status: "pending", dueDate: null, link: "https://www.mscdirect.com", notes: "EDI/API for B2B", sortOrder: 10 },
  { category: "parts_ordering", title: "Fastenal B2B Integration", description: "Industrial and construction supplies", priority: "low", status: "pending", dueDate: null, link: "https://www.fastenal.com", notes: "B2B integration options", sortOrder: 11 },
  { category: "parts_ordering", title: "Snap-on B2B Portal", description: "Tool ordering for shops (EDI required)", priority: "low", status: "pending", dueDate: null, link: "https://b2b.snapon.com", notes: "Contact order@snapon.com for B2B", sortOrder: 12 },
  { category: "parts_ordering", title: "Matco Tools EDI", description: "EDI integration via B2BGateway", priority: "low", status: "pending", dueDate: null, link: "https://www.matcotools.com", notes: "EDI via B2BGateway.net", sortOrder: 13 },
  
  { category: "parts_ordering", title: "Fortellis Marketplace", description: "CDK Global automotive API marketplace", priority: "medium", status: "pending", dueDate: null, link: "https://fortellis.io", notes: "Automotive API ecosystem", sortOrder: 14 },

  { category: "oem_distributors", title: "AutoNation Parts — Affiliate (CJ)", description: "Genuine OEM from all major brands + aftermarket (Bosch, Denso). Apply via CJ Affiliate.", priority: "high", status: "pending", dueDate: null, link: "https://www.autonationparts.com/join-the-autonation-parts-affiliate-program", notes: "Also via CJ: signup.cj.com/member/signup/publisher/?cid=7394161. Nation's largest auto retailer.", sortOrder: 1 },
  { category: "oem_distributors", title: "Parts Geek — Affiliate (FlexOffers)", description: "10M+ OEM & aftermarket parts, up to 80% off list. Apply via FlexOffers.", priority: "high", status: "pending", dueDate: null, link: "https://www.partsgeek.com/affliates.html", notes: "FlexOffers signup: publisherpro.flexoffers.com. $0.32/purchase or 5-10%. 7-day cookie. 600+ brands.", sortOrder: 2 },
  { category: "oem_distributors", title: "OEM Parts Online — Direct Outreach", description: "Multi-brand OEM catalogs, up to 35% off MSRP. No public affiliate — contact directly.", priority: "medium", status: "pending", dueDate: null, link: "https://oempartsonline.com", notes: "Check footer for contact/partnership page. Free shipping US, 2-3 day delivery.", sortOrder: 3 },
  { category: "oem_distributors", title: "Genuine OEM Auto Parts — Direct Outreach", description: "Mopar, Motorcraft, AcDelco, Caterpillar, Fleetguard. Diesel/truck focus. Global wholesale.", priority: "medium", status: "pending", dueDate: null, link: "https://genuineoemautoparts.com", notes: "Contact via website for affiliate/referral partnership inquiry.", sortOrder: 4 },
  { category: "oem_distributors", title: "Detroit Axle — Amazon Associates", description: "OE remanufactured + new aftermarket — suspension, steering, brakes. 30+ years, 180K sq ft warehouse.", priority: "medium", status: "pending", dueDate: null, link: "https://www.detroitaxle.com", notes: "Sells via Amazon & eBay. Promote through Amazon Associates (already connected) or eBay Partner Network.", sortOrder: 5 },
  { category: "oem_distributors", title: "OEM Surplus Depot — Direct Outreach", description: "Nissan, Toyota, Lexus, Infiniti, Kia, Hyundai, Mazda, Honda surplus. 40 years in business.", priority: "medium", status: "pending", dueDate: null, link: "https://oemsurplus.parts", notes: "Nationwide via UPS. Contact for referral/affiliate partnership.", sortOrder: 6 },

  { category: "oem_distributors", title: "Keystone Automotive — Wholesale Dealer", description: "Major national distributor (LKQ Corp). 185K+ SKUs, 800+ suppliers, 8 warehouses.", priority: "high", status: "pending", dueDate: null, link: "https://www.keystoneautomotive.com/newcustomers", notes: "Apply online. Phone: 1-800-521-9999. Email: customercare@ekeystone.com. Next-day delivery 48 states.", sortOrder: 7 },
  { category: "oem_distributors", title: "Factory Motor Parts (FMP) — Wholesale", description: "OEM + aftermarket, import parts, virtual inventory, GPS tracking. 300+ locations nationwide.", priority: "high", status: "pending", dueDate: null, link: "https://www.factorymotorparts.com/contact-us", notes: "Call 800-278-6394, select 'New Customer' on contact form. Since 1945, family-owned.", sortOrder: 8 },
  { category: "oem_distributors", title: "APW (Auto Parts Warehouse) — Wholesale", description: "Largest independent distributor. 55+ years, Pronto Network member, vast inventory.", priority: "medium", status: "pending", dueDate: null, link: "https://apwks.com", notes: "Contact via website for dealer/wholesale inquiries.", sortOrder: 9 },
  { category: "oem_distributors", title: "Advantage Parts Solutions (ADPS) — Partnership", description: "OEM wholesale platform connecting suppliers to 300,000+ repair shops. Loyalty rewards.", priority: "medium", status: "pending", dueDate: null, link: "https://adps.com", notes: "Contact partnership team for integration/referral opportunity.", sortOrder: 10 },
  { category: "oem_distributors", title: "Bam Wholesale Parts — Wholesale", description: "OEM parts from Brunswick Auto Mart. Nationwide delivery.", priority: "low", status: "pending", dueDate: null, link: "https://bamwholesaleparts.com", notes: "Direct wholesale ordering available on site.", sortOrder: 11 },
  { category: "oem_distributors", title: "Cochran Wholesale Parts — Regional Wholesale", description: "OEM at aftermarket prices. Fleet of 20 delivery vehicles. PA/OH region.", priority: "low", status: "pending", dueDate: null, link: "https://www.cochran.com/wholesale-parts-dev/", notes: "Will beat competitor pricing. Regional coverage PA/OH.", sortOrder: 12 },

  { category: "oem_distributors", title: "OEC (OE Connection) — Catalog API", description: "Leading OEM parts catalog software. Connects dealers, distributors, repair shops, insurers.", priority: "high", status: "pending", dueDate: null, link: "https://oeconnection.com", notes: "Industry leader for OEM catalog data. Contact for API/partnership.", sortOrder: 13 },
  { category: "oem_distributors", title: "Epicor Parts Portal — Distributor API", description: "API access to 19,000+ aftermarket distributors. Lookup, ordering, purchasing.", priority: "high", status: "pending", dueDate: null, link: "https://www.epicor.com/en-us/products/supply-chain-management-scm/parts-portal/", notes: "Enterprise-level integration. Contact sales for API access.", sortOrder: 14 },
  { category: "oem_distributors", title: "SEMA Data Co-op — ACES/PIES Data", description: "Industry standard for parts catalog data. OEM-to-aftermarket cross-referencing.", priority: "medium", status: "pending", dueDate: null, link: "https://www.semadatacoop.org", notes: "ACES (fitment) + PIES (product info) standards. Key for part number cross-referencing.", sortOrder: 15 },
  { category: "oem_distributors", title: "TecDoc API — European Catalog", description: "European parts catalog standard. Multi-language, region-specific data.", priority: "low", status: "pending", dueDate: null, link: "https://www.tecalliance.net", notes: "Useful if expanding to European markets.", sortOrder: 16 },

  { category: "oem_distributors", title: "Western Power Sports (WPS) — Powersports Wholesale", description: "Honda, Kawasaki, Yamaha, Suzuki, KTM, Polaris, Can-Am, Arctic Cat, Sea-Doo. 120K+ parts.", priority: "high", status: "pending", dueDate: null, link: "https://www.wps.com", notes: "5 regional warehouses. HardDrive Parts = their V-Twin division. Contact for dealer program.", sortOrder: 17 },
  { category: "oem_distributors", title: "Parts Unlimited — Powersports Wholesale", description: "World's largest powersports aftermarket distributor. 75K+ parts, all major brands.", priority: "high", status: "pending", dueDate: null, link: "https://www.partsunlimited.com", notes: "Contact for dealer/partner program.", sortOrder: 18 },
  { category: "oem_distributors", title: "Drag Specialties — Harley/V-Twin Wholesale", description: "Leading Harley-Davidson and V-Twin aftermarket. 40+ years in business.", priority: "medium", status: "pending", dueDate: null, link: "https://www.dragspecialties.com", notes: "Contact for dealer program.", sortOrder: 19 },
  { category: "oem_distributors", title: "Automatic Distributors — Powersports", description: "350+ brands, 75K+ products, 7 catalogs. National wholesale distribution.", priority: "medium", status: "pending", dueDate: null, link: "https://www.autodist.com", notes: "Contact for dealer/wholesale program.", sortOrder: 20 },
  { category: "oem_distributors", title: "Dealer Cost Parts — OEM Powersports", description: "OEM parts: Arctic Cat, Can-Am, Honda, Indian, Kawasaki, KTM, Polaris, Sea-Doo, Suzuki, Yamaha.", priority: "medium", status: "pending", dueDate: null, link: "https://www.dealercostparts.com", notes: "OEM parts & accessories at dealer cost. Contact for partnership.", sortOrder: 21 },

  { category: "oem_distributors", title: "Wholesale Marine — Marine Affiliate (AvantLink)", description: "OEM boat engine parts: Mercury, Yamaha, Honda Marine. Has affiliate program.", priority: "high", status: "pending", dueDate: null, link: "https://www.wholesalemarine.com/affiliate-program/", notes: "Via AvantLink. 2-5% commission, 14-day cookie, $200+ avg order. Sign up through AvantLink network.", sortOrder: 22 },

  { category: "oem_distributors", title: "Medart Engine — Small Engine Wholesale", description: "80+ manufacturers, 50K+ part numbers. Outdoor power equipment, rental, industrial.", priority: "medium", status: "pending", dueDate: null, link: "https://www.medartengine.com", notes: "5 distribution locations. Contact for dealer/wholesale program.", sortOrder: 23 },
  { category: "oem_distributors", title: "The OEM Parts Store — Small Engine", description: "Briggs & Stratton, Kohler, Tecumseh, Honda, Kawasaki. 1M+ parts. Wholesale pricing available.", priority: "medium", status: "pending", dueDate: null, link: "https://www.theoempartsstore.com", notes: "Wholesale/dealer pricing available for shops. Contact for partner program.", sortOrder: 24 },
  { category: "oem_distributors", title: "Small Engine Suppliers — Engines & Parts", description: "Complete engines + parts: Briggs, Honda, Kohler. Online source.", priority: "low", status: "pending", dueDate: null, link: "https://www.smallenginesuppliers.com", notes: "Contact for referral/affiliate partnership inquiry.", sortOrder: 25 },

  { category: "oem_distributors", title: "FlexOffers — Join Network for OEM Programs", description: "Access Parts Geek, NAPA, SimpleTire, and more OEM/aftermarket programs.", priority: "high", status: "pending", dueDate: null, link: "https://www.flexoffers.com/affiliate-programs/automotive/auto-parts-and-accessories/", notes: "Free to join. Multiple auto parts programs in one place.", sortOrder: 26 },
  { category: "oem_distributors", title: "Rakuten Advertising — Join for Advance Auto", description: "Advance Auto Parts runs their affiliate through Rakuten. Apply to network first.", priority: "medium", status: "pending", dueDate: null, link: "https://rakutenadvertising.com", notes: "Apply to Rakuten network, then search for Advance Auto Parts program.", sortOrder: 27 },
  { category: "oem_distributors", title: "Impact — Join for AutoZone & Others", description: "AutoZone, Camping World, Bass Pro run through Impact. Apply as partner.", priority: "medium", status: "pending", dueDate: null, link: "https://impact.com/partners/", notes: "Apply to Impact network, then search automotive brands. Some invite-only.", sortOrder: 28 },

  { category: "marketing", title: "Google AdSense Setup", description: "Sign up for Google AdSense to monetize informational pages (NOT search results). Get your publisher ID (ca-pub-XXXXX)", priority: "high", status: "pending", dueDate: null, link: "https://adsense.google.com/start/", notes: "Only on informational pages (DIY guides, about, blog). Avoid on search results to keep UX clean", sortOrder: 1 },
  { category: "marketing", title: "Buffer Account Setup", description: "Create Buffer account for social media scheduling. Connect Twitter/X, Facebook, Instagram, LinkedIn", priority: "medium", status: "pending", dueDate: null, link: "https://buffer.com", notes: "Free tier: 3 channels, 10 posts/channel. Pro $6/mo for more", sortOrder: 2 },
  { category: "marketing", title: "Hypefury Account Setup", description: "Twitter/X automation and thread scheduling. Great for automotive tips content", priority: "medium", status: "pending", dueDate: null, link: "https://hypefury.com", notes: "Auto-retweet best content, engagement features", sortOrder: 3 },
  { category: "marketing", title: "Content Calendar Creation", description: "Build 30-day social content calendar: DIY tips, part deals, seasonal maintenance, Buddy AI highlights", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Mix: 40% educational, 30% deals, 20% engagement, 10% promotional", sortOrder: 4 },
  { category: "marketing", title: "TikTok/Reels Strategy", description: "Short-form video content: quick repair tips, tool reviews, before/after fixes", priority: "low", status: "pending", dueDate: null, link: null, notes: "Repurpose DIY guide content into 60-sec videos", sortOrder: 5 },
  { category: "marketing", title: "Email Marketing Setup", description: "Set up email list for price drop alerts, weekly deals digest, maintenance reminders", priority: "medium", status: "pending", dueDate: null, link: "https://www.mailerlite.com", notes: "Free up to 1000 subscribers", sortOrder: 6 },
  { category: "marketing", title: "Google Analytics 4", description: "Set up GA4 for traffic and conversion tracking", priority: "high", status: "pending", dueDate: null, link: "https://analytics.google.com", notes: "Track: searches, affiliate clicks, conversions, Buddy usage", sortOrder: 7 },

  { category: "marketing", title: "X/Twitter API Credentials", description: "Add Twitter API keys to secrets so auto-posting connector goes live. Social connector is coded — just needs credentials", priority: "high", status: "pending", dueDate: null, link: "https://developer.x.com/en/portal/dashboard", notes: "Need: API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET", sortOrder: 8 },
  { category: "marketing", title: "Meta ads_management Permission", description: "Request ads_management permission in Meta App Review so Meta Ads campaigns can go live", priority: "high", status: "pending", dueDate: null, link: "https://developers.facebook.com/apps", notes: "Token has pages_manage_posts but needs ads_management added", sortOrder: 9 },
  { category: "marketing", title: "Google AdSense Verification", description: "Verify domain in AdSense console and configure ad units for blog, DIY guides, Break Room pages", priority: "high", status: "pending", dueDate: null, link: "https://adsense.google.com", notes: "Meta tag is in place — just needs domain verification + ad unit setup", sortOrder: 10 },
  { category: "marketing", title: "Newsletter Email System", description: "Build subscriber management, campaign creation, and sending via Resend or MailerLite", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Page exists in Command Center — needs full email campaign backend", sortOrder: 11 },
  { category: "marketing", title: "Sponsored Products Feature", description: "Build featured placements system — vendors can pay to promote listings in search results", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Revenue stream: promoted listings with CPC/CPM model", sortOrder: 12 },

  { category: "features", title: "Stripe Checkout End-to-End Test", description: "Test full checkout flow with live Stripe keys — Pro subscription, ad-free tier, cart purchases", priority: "high", status: "pending", dueDate: null, link: "https://dashboard.stripe.com", notes: "Switch from test to live keys, verify webhooks", sortOrder: 13 },
  { category: "features", title: "Affiliate Click Tracking Verification", description: "Verify that clicks through to Amazon, CJ, eBay actually record in their dashboards for commission", priority: "high", status: "pending", dueDate: null, link: null, notes: "Test with real affiliate tags — check each network's reporting", sortOrder: 14 },
  { category: "features", title: "Inbound Affiliate Payout Flow", description: "Test full GB-XXXXXX affiliate payout cycle: signup → referral → earning → PayPal payout request", priority: "medium", status: "pending", dueDate: null, link: "/affiliates", notes: "System built — needs real affiliates to validate end-to-end", sortOrder: 15 },
  { category: "features", title: "Genesis Hallmark Live Minting", description: "Test NFT minting with real Solana transactions on mainnet", priority: "low", status: "pending", dueDate: null, link: null, notes: "Currently testnet — switch to mainnet when ready", sortOrder: 16 },
  { category: "features", title: "Giveaways System", description: "Build prize drawings, winner selection, and management page at /giveaways", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Card exists in Command Center — needs full feature build", sortOrder: 17 },
  { category: "features", title: "Blog SEO Content Pipeline", description: "Publish 20+ high-quality blog posts covering seasonal maintenance, DIY tips, and part buying guides", priority: "high", status: "pending", dueDate: null, link: "/blog", notes: "11 posts published — need more for organic traffic growth", sortOrder: 18 },
  { category: "features", title: "Trivia Quiz Content Expansion", description: "Add 200+ questions across all vehicle categories — cars, trucks, marine, powersports, hobby", priority: "low", status: "pending", dueDate: null, link: "/trivia", notes: "Game works — just needs more question variety", sortOrder: 19 },

  { category: "infrastructure", title: "Production Error Monitoring", description: "Set up error tracking (Sentry or similar) for production crash reporting", priority: "medium", status: "pending", dueDate: null, link: "https://sentry.io", notes: "Catch runtime errors before users report them", sortOrder: 5 },
  { category: "infrastructure", title: "Database Backup Strategy", description: "Configure automated daily database backups and test restoration process", priority: "high", status: "pending", dueDate: null, link: null, notes: "Neon has point-in-time recovery — verify it works", sortOrder: 6 },
  { category: "infrastructure", title: "Rate Limiting Audit", description: "Review API rate limits across all endpoints — ensure partner API and public routes are protected", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Partner API has limits — check public search and blog endpoints too", sortOrder: 7 },
];

export default function DevPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.id));
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ category: "features", title: "", description: "", priority: "medium", link: "" });
  const validTabs = ["dashboard", "roadmap", "releases", "affiliates", "buddy"];
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && validTabs.includes(tab) ? tab : "dashboard";
  });

  useEffect(() => {
    const syncTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    };
    window.addEventListener("popstate", syncTab);
    syncTab();
    return () => window.removeEventListener("popstate", syncTab);
  }, []);

  const [showNewRelease, setShowNewRelease] = useState(false);
  const [newRelease, setNewRelease] = useState({
    version: "",
    versionType: "stable" as "beta" | "stable" | "hotfix" | "major",
    title: "",
    changelog: [{ category: "Features", changes: [""] }],
    highlights: [""],
    notes: "",
  });
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId] = useState(() => `dev-portal-${Date.now()}`);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<DevTask[]>({
    queryKey: ['devTasks'],
    queryFn: async () => {
      const res = await fetch('/api/dev/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const initTasksMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/dev/tasks/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: DEFAULT_TASKS }),
      });
      if (!res.ok) throw new Error('Failed to initialize tasks');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
      toast({ title: "Tasks initialized", description: "Default checklist loaded" });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/dev/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, completedAt: status === 'completed' ? new Date().toISOString() : null }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (task: typeof newTask) => {
      const res = await fetch('/api/dev/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to add task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
      setShowAddTask(false);
      setNewTask({ category: "features", title: "", description: "", priority: "medium", link: "" });
      toast({ title: "Task added", description: "New task added to checklist" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dev/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
      toast({ title: "Task deleted" });
    },
  });

  interface Release {
    id: string;
    version: string;
    versionType: string;
    versionNumber: number;
    title: string | null;
    changelog: { category: string; changes: string[] }[];
    highlights: string[] | null;
    status: string;
    publishedAt: string | null;
    isBlockchainVerified: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }

  const { data: releases = [] } = useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => {
      const res = await fetch('/api/releases');
      if (!res.ok) throw new Error('Failed to fetch releases');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: latestRelease } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) throw new Error('Failed to fetch latest release');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  interface BlockchainAsset {
    id: string;
    entityType: 'hallmark' | 'vehicle' | 'release';
    entityId: string;
    userId: string;
    dataHash: string;
    txSignature: string | null;
    status: string;
    network: string;
    createdAt: string;
    submittedAt: string | null;
    confirmedAt: string | null;
    entityDetails: any;
    ownerInfo: { id: string; username: string; email: string } | null;
    solscanUrl: string | null;
  }

  const { data: blockchainAssets = [], isLoading: loadingAssets } = useQuery<BlockchainAsset[]>({
    queryKey: ['blockchainAssets'],
    queryFn: async () => {
      const res = await fetch(`/api/blockchain/all?pin=${DEV_PIN}`);
      if (!res.ok) throw new Error('Failed to fetch blockchain assets');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: blockchainHealth } = useQuery<{ connected: boolean; network?: string; walletAddress?: string; balance?: number }>({
    queryKey: ['blockchainHealth'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/health');
      if (!res.ok) throw new Error('Failed to fetch blockchain status');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createReleaseMutation = useMutation({
    mutationFn: async (release: typeof newRelease) => {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(release),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create release');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['latestRelease'] });
      setShowNewRelease(false);
      setNewRelease({
        version: "",
        versionType: "stable",
        title: "",
        changelog: [{ category: "Features", changes: [""] }],
        highlights: [""],
        notes: "",
      });
      toast({ title: "Release created", description: "New release saved as draft" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const publishReleaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/releases/${id}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to publish release');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['latestRelease'] });
      if (data.isBlockchainVerified && data.blockchainVerificationId) {
        toast({ 
          title: "Release published & verified on Solana!", 
          description: `TX: ${data.blockchainVerificationId.substring(0, 20)}...`,
          duration: 8000,
        });
      } else {
        toast({ title: "Release published!", description: "Version is now live" });
      }
    },
  });

  const deleteReleaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/releases/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete release');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast({ title: "Release deleted" });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai/buddy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: chatSessionId }),
      });
      if (!res.ok) throw new Error('Failed to get response');
      return res.json();
    },
    onSuccess: (data) => {
      const responseText = typeof data.response === 'string' 
        ? data.response 
        : (data.response?.text || data.response?.message || JSON.stringify(data.response));
      setChatMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    },
    onError: () => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." }]);
    },
  });

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    chatMutation.mutate(chatInput);
    setChatInput("");
  };

  const addChangelogCategory = () => {
    setNewRelease(prev => ({
      ...prev,
      changelog: [...prev.changelog, { category: "", changes: [""] }]
    }));
  };

  const addChangelogItem = (categoryIndex: number) => {
    setNewRelease(prev => ({
      ...prev,
      changelog: prev.changelog.map((cat, i) => 
        i === categoryIndex ? { ...cat, changes: [...cat.changes, ""] } : cat
      )
    }));
  };

  const updateChangelogCategory = (categoryIndex: number, category: string) => {
    setNewRelease(prev => ({
      ...prev,
      changelog: prev.changelog.map((cat, i) => 
        i === categoryIndex ? { ...cat, category } : cat
      )
    }));
  };

  const updateChangelogItem = (categoryIndex: number, itemIndex: number, value: string) => {
    setNewRelease(prev => ({
      ...prev,
      changelog: prev.changelog.map((cat, i) => 
        i === categoryIndex ? {
          ...cat,
          changes: cat.changes.map((c, j) => j === itemIndex ? value : c)
        } : cat
      )
    }));
  };

  const removeChangelogItem = (categoryIndex: number, itemIndex: number) => {
    setNewRelease(prev => ({
      ...prev,
      changelog: prev.changelog.map((cat, i) => 
        i === categoryIndex ? {
          ...cat,
          changes: cat.changes.filter((_, j) => j !== itemIndex)
        } : cat
      ).filter(cat => cat.changes.length > 0)
    }));
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEV_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getTasksByCategory = (categoryId: string) => 
    tasks.filter(t => t.category === categoryId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const getCompletionStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="pt-24 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card className="glass-ultra border-primary/30 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-tech text-2xl uppercase text-primary mb-2">Dev Portal</h1>
                <p className="text-sm text-muted-foreground">Enter access code to continue</p>
              </div>

              <form onSubmit={handlePinSubmit}>
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className={`text-center text-2xl tracking-[0.5em] mb-4 ${pinError ? 'border-red-500' : ''}`}
                  maxLength={4}
                  data-testid="input-dev-pin"
                />
                {pinError && (
                  <p className="text-red-400 text-sm text-center mb-4">Invalid access code</p>
                )}
                <Button type="submit" className="w-full font-tech uppercase" data-testid="button-dev-login">
                  Access Portal
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();
  const connectedAffiliates = AFFILIATE_NETWORKS.filter(n => n.status === 'connected').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const recentCompletions = tasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-24 min-h-[calc(100vh-5rem)] max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-cyan-500/5 border-primary/20 p-4 h-full">
              <h1 className="font-tech text-2xl uppercase text-primary mb-1">Dev Portal</h1>
              <p className="text-sm text-muted-foreground">TORQUE development command center</p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4"
          >
            <Card className="glass-card border-primary/20 p-4 h-full flex items-center justify-center gap-4">
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle 
                    cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                    strokeDasharray={`${stats.percentage * 1.63} 163`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{stats.percentage}%</p>
                <p className="text-xs text-muted-foreground">{stats.completed}/{stats.total}</p>
              </div>
            </Card>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto no-scrollbar mb-4">
            <TabsTrigger value="dashboard" className="font-tech uppercase text-xs flex-shrink-0">
              <LayoutDashboard className="w-3 h-3 mr-1" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="font-tech uppercase text-xs flex-shrink-0">
              <CheckCheck className="w-3 h-3 mr-1" /> Roadmap
            </TabsTrigger>
            <TabsTrigger value="releases" className="font-tech uppercase text-xs flex-shrink-0">
              <Tag className="w-3 h-3 mr-1" /> Releases
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="font-tech uppercase text-xs flex-shrink-0">
              <DollarSign className="w-3 h-3 mr-1" /> Affiliates
            </TabsTrigger>
            <TabsTrigger value="buddy" className="font-tech uppercase text-xs flex-shrink-0">
              <Bot className="w-3 h-3 mr-1" /> Buddy
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════ DASHBOARD TAB ═══════════════════════ */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card border-primary/20 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <CheckCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Tasks</p>
                    <p className="font-tech text-2xl text-primary" data-testid="text-total-tasks">{stats.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-green-400">{stats.completed} done</span>
                  <span>·</span>
                  <span className="text-yellow-400">{pendingTasks} pending</span>
                </div>
              </Card>

              <Card className="glass-card border-green-500/20 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Connected Affiliates</p>
                    <p className="font-tech text-2xl text-green-400" data-testid="text-connected-affiliates">{connectedAffiliates}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-yellow-400">{AFFILIATE_NETWORKS.filter(n => n.status === 'pending').length} pending</span>
                  <span>·</span>
                  <span>{AFFILIATE_NETWORKS.length} total networks</span>
                </div>
              </Card>

              <Card className="glass-card border-cyan-500/20 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Latest Release</p>
                    <p className="font-tech text-2xl text-cyan-400" data-testid="text-latest-version">
                      {latestRelease?.version || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {blockchainHealth?.connected ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <Blocks className="w-3 h-3" /> Solana Connected
                    </span>
                  ) : (
                    <span className="text-red-400">Blockchain Disconnected</span>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card border-primary/20 p-4">
                <h3 className="font-tech text-sm text-primary mb-3 flex items-center gap-2 uppercase">
                  <Activity className="w-4 h-4" /> Quick Navigation
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Roadmap", tab: "roadmap", icon: CheckCheck, color: "text-yellow-400" },
                    { label: "Releases", tab: "releases", icon: Tag, color: "text-cyan-400" },
                    { label: "Affiliates", tab: "affiliates", icon: DollarSign, color: "text-green-400" },
                    { label: "Buddy AI", tab: "buddy", icon: Bot, color: "text-purple-400" },
                  ].map(item => (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-all text-left"
                      data-testid={`button-nav-${item.tab}`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-tech uppercase">{item.label}</span>
                      <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="glass-card border-primary/20 p-4">
                <h3 className="font-tech text-sm text-primary mb-3 flex items-center gap-2 uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Recent Completions
                </h3>
                {recentCompletions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No completed tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentCompletions.map(task => (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                        <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{task.title}</span>
                        {task.completedAt && (
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card className="glass-card border-primary/20 p-4">
              <h3 className="font-tech text-sm text-primary mb-3 uppercase">Category Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CATEGORIES.map(category => {
                  const catTasks = getTasksByCategory(category.id);
                  const catCompleted = catTasks.filter(t => t.status === 'completed').length;
                  const catPct = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;
                  const IconComponent = category.icon;
                  return (
                    <div key={category.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${category.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{category.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${catPct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{catCompleted}/{catTasks.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ ROADMAP TAB ═══════════════════════ */}
          <TabsContent value="roadmap">
            {tasks.length === 0 && !isLoading && (
              <Card className="glass-ultra border-primary/30 p-8 text-center mb-8">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="font-tech text-xl mb-2">No Tasks Found</h3>
                <p className="text-muted-foreground mb-4">Initialize your checklist with default tasks to get started</p>
                <Button onClick={() => initTasksMutation.mutate()} className="font-tech uppercase">
                  <Plus className="w-4 h-4 mr-2" /> Initialize Checklist
                </Button>
              </Card>
            )}

            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setShowAddTask(!showAddTask)} 
                variant="outline" 
                className="font-tech uppercase border-primary/30 hover:bg-primary/10"
                size="sm"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Task
              </Button>
            </div>

            <AnimatePresence>
              {showAddTask && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <Card className="glass-card border-primary/30 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <Select value={newTask.category} onValueChange={(v) => setNewTask(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}>
                        <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input 
                      placeholder="Task title" 
                      value={newTask.title} 
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => addTaskMutation.mutate(newTask)} disabled={!newTask.title} className="font-tech" size="sm">
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => {
                const categoryTasks = getTasksByCategory(category.id);
                const completedCount = categoryTasks.filter(t => t.status === 'completed').length;
                const isExpanded = expandedCategories.includes(category.id);
                const IconComponent = category.icon;

                return (
                  <Card key={category.id} className="glass-card border-border overflow-hidden h-fit">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${category.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-tech text-sm uppercase">{category.name}</h3>
                          <p className="text-[10px] text-muted-foreground">
                            {completedCount}/{categoryTasks.length} done
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${categoryTasks.length > 0 ? (completedCount / categoryTasks.length) * 100 : 0}%` }}
                          />
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-2">
                            {categoryTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`flex items-start gap-2 p-2 rounded-lg border transition-all text-sm ${
                                  task.status === 'completed' 
                                    ? 'bg-green-500/5 border-green-500/20' 
                                    : 'bg-white/5 border-white/10 hover:border-primary/30'
                                }`}
                              >
                                <button
                                  onClick={() => toggleTaskMutation.mutate({ 
                                    id: task.id, 
                                    status: task.status === 'completed' ? 'pending' : 'completed' 
                                  })}
                                  className="mt-0.5 shrink-0"
                                >
                                  {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {task.priority === 'high' && (
                                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1 py-0">!</Badge>
                                      )}
                                      {task.link && (
                                        <a 
                                          href={task.link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:text-primary/80"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                      <button
                                        onClick={() => deleteTaskMutation.mutate(task.id)}
                                        className="text-muted-foreground hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {categoryTasks.length === 0 && (
                              <p className="text-center text-muted-foreground py-2 text-xs">No tasks</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══════════════════════ RELEASES TAB (merged with Blockchain) ═══════════════════════ */}
          <TabsContent value="releases" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Card className="md:col-span-8 bg-gradient-to-br from-primary/10 to-cyan-500/5 border-primary/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <GitBranch className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Version</p>
                    <p className="font-tech text-xl text-primary">
                      {latestRelease?.version || "No releases yet"}
                    </p>
                    {latestRelease?.publishedAt && (
                      <p className="text-xs text-muted-foreground">
                        Published {new Date(latestRelease.publishedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
              
              <Card className="md:col-span-4 glass-card border-primary/20 p-4 flex flex-col justify-center gap-2">
                <Button 
                  onClick={() => setShowNewRelease(true)} 
                  className="font-tech uppercase text-xs w-full"
                  size="sm"
                >
                  <Plus className="w-3 h-3 mr-1" /> New Release
                </Button>
                {latestRelease && (
                  <Badge className="text-center justify-center bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    {releases.length} releases
                  </Badge>
                )}
              </Card>
            </div>

            <AnimatePresence>
              {showNewRelease && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="glass-ultra border-primary/30 p-6">
                    <h3 className="font-tech text-lg text-primary mb-4">Create New Release</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Version</label>
                        <Input 
                          placeholder="e.g., v1.0, beta.1, v1.2.3"
                          value={newRelease.version}
                          onChange={(e) => setNewRelease(prev => ({ ...prev, version: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                        <Select 
                          value={newRelease.versionType} 
                          onValueChange={(v: "beta" | "stable" | "hotfix" | "major") => setNewRelease(prev => ({ ...prev, versionType: v }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beta">Beta</SelectItem>
                            <SelectItem value="stable">Stable</SelectItem>
                            <SelectItem value="hotfix">Hotfix</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Title (optional)</label>
                        <Input 
                          placeholder="e.g., Genesis Launch"
                          value={newRelease.title}
                          onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-muted-foreground">Changelog</label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={addChangelogCategory}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Category
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {newRelease.changelog.map((cat, catIndex) => (
                          <div key={catIndex} className="bg-background/50 rounded-lg p-3 border border-border">
                            <Input 
                              placeholder="Category (e.g., Features, Fixes, Improvements)"
                              value={cat.category}
                              onChange={(e) => updateChangelogCategory(catIndex, e.target.value)}
                              className="mb-2 font-medium"
                            />
                            <div className="space-y-2">
                              {cat.changes.map((change, changeIndex) => (
                                <div key={changeIndex} className="flex gap-2">
                                  <Input 
                                    placeholder="What changed?"
                                    value={change}
                                    onChange={(e) => updateChangelogItem(catIndex, changeIndex, e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeChangelogItem(catIndex, changeIndex)}
                                    className="shrink-0 hover:text-red-400"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addChangelogItem(catIndex)}
                                className="w-full text-xs border-dashed"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Change
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm text-muted-foreground mb-1 block">Dev Notes (internal)</label>
                      <Textarea 
                        placeholder="Notes for your reference..."
                        value={newRelease.notes}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => createReleaseMutation.mutate(newRelease)} 
                        disabled={!newRelease.version}
                        className="font-tech"
                      >
                        <Save className="w-4 h-4 mr-2" /> Save as Draft
                      </Button>
                      <Button variant="ghost" onClick={() => setShowNewRelease(false)}>
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 className="font-tech text-sm text-primary mb-3">Release History</h3>
              
              {releases.length === 0 && (
                <Card className="glass-card border-border p-6 text-center">
                  <Archive className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No releases yet. Create your first release above!</p>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {releases.map((release) => (
                <Card 
                  key={release.id} 
                  className={`glass-card border-border p-3 ${
                    release.status === 'published' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-tech text-xl text-primary">{release.version}</span>
                        {release.title && <span className="text-muted-foreground">— {release.title}</span>}
                        <Badge 
                          variant="outline" 
                          className={
                            release.versionType === 'major' ? 'border-purple-500/50 text-purple-400' :
                            release.versionType === 'stable' ? 'border-green-500/50 text-green-400' :
                            release.versionType === 'hotfix' ? 'border-red-500/50 text-red-400' :
                            'border-yellow-500/50 text-yellow-400'
                          }
                        >
                          {release.versionType}
                        </Badge>
                        <Badge 
                          variant={release.status === 'published' ? 'default' : 'secondary'}
                          className={release.status === 'published' ? 'bg-green-500/20 text-green-400' : ''}
                        >
                          {release.status}
                        </Badge>
                        {release.isBlockchainVerified && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            <Shield className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        {release.status === 'published' && release.publishedAt
                          ? `Published ${new Date(release.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric', 
                              hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
                            })}`
                          : `Created ${new Date(release.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}`
                        }
                      </p>

                      {release.changelog && Array.isArray(release.changelog) && release.changelog.length > 0 && (
                        <div className="space-y-2">
                          {release.changelog.map((cat: { category: string; changes: string[] }, i: number) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-foreground">{cat.category}</p>
                              <ul className="text-sm text-muted-foreground pl-4 list-disc">
                                {cat.changes.map((c: string, j: number) => (
                                  <li key={j}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {release.status === 'draft' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => publishReleaseMutation.mutate(release.id)}
                            className="font-tech uppercase text-xs"
                          >
                            <Rocket className="w-3 h-3 mr-1" /> Publish
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteReleaseMutation.mutate(release.id)}
                            className="text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              </div>
            </div>

            {/* Blockchain Section */}
            <div className="border-t border-primary/20 pt-6">
              <h3 className="font-tech text-sm text-primary mb-4 flex items-center gap-2 uppercase">
                <Blocks className="w-4 h-4" /> Blockchain Verification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <Card className={`md:col-span-8 border-primary/30 p-4 ${blockchainHealth?.connected ? 'bg-gradient-to-br from-green-500/10 to-cyan-500/5' : 'bg-gradient-to-br from-red-500/10 to-orange-500/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${blockchainHealth?.connected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <Blocks className={`w-6 h-6 ${blockchainHealth?.connected ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Solana Network</p>
                      <p className="font-tech text-xl text-primary">
                        {blockchainHealth?.connected ? blockchainHealth.network?.replace('-beta', '') : 'Disconnected'}
                      </p>
                      {blockchainHealth?.walletAddress && (
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                          Wallet: {blockchainHealth.walletAddress.slice(0, 8)}...{blockchainHealth.walletAddress.slice(-6)}
                        </p>
                      )}
                    </div>
                    {blockchainHealth?.balance !== undefined && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {blockchainHealth.balance.toFixed(4)} SOL
                      </Badge>
                    )}
                  </div>
                </Card>
                
                <Card className="md:col-span-4 glass-card border-primary/20 p-4 flex flex-col justify-center gap-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{blockchainAssets.filter(a => a.entityType === 'hallmark').length}</p>
                      <p className="text-xs text-muted-foreground">Hallmarks</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-cyan-400">{blockchainAssets.filter(a => a.entityType === 'vehicle').length}</p>
                      <p className="text-xs text-muted-foreground">Vehicles</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-400">{blockchainAssets.filter(a => a.entityType === 'release').length}</p>
                      <p className="text-xs text-muted-foreground">Releases</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="glass-card border-primary/20 p-4">
                <h3 className="font-tech text-sm text-primary mb-4 flex items-center gap-2">
                  <Blocks className="w-4 h-4" />
                  All Blockchain-Verified Assets ({blockchainAssets.length})
                </h3>
                
                {loadingAssets ? (
                  <div className="text-center py-8 text-muted-foreground">Loading assets...</div>
                ) : blockchainAssets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No blockchain-verified assets yet
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {blockchainAssets.map((asset) => (
                      <div key={asset.id} className="bg-background/50 border border-primary/10 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              asset.entityType === 'hallmark' ? 'bg-primary/20' :
                              asset.entityType === 'vehicle' ? 'bg-cyan-500/20' :
                              'bg-purple-500/20'
                            }`}>
                              {asset.entityType === 'hallmark' ? (
                                <Shield className={`w-5 h-5 text-primary`} />
                              ) : asset.entityType === 'vehicle' ? (
                                <Car className={`w-5 h-5 text-cyan-400`} />
                              ) : (
                                <Tag className={`w-5 h-5 text-purple-400`} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-tech text-sm uppercase text-primary">
                                  {asset.entityType}
                                </span>
                                <Badge className={`text-xs ${
                                  asset.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  asset.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}>
                                  {asset.status}
                                </Badge>
                                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                  {asset.network.replace('-beta', '')}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {asset.entityDetails ? (
                                  asset.entityType === 'hallmark' ? (
                                    <>Genesis #{asset.entityDetails.assetNumber}: {asset.entityDetails.displayName || 'Unnamed'}</>
                                  ) : asset.entityType === 'vehicle' ? (
                                    <>{asset.entityDetails.year} {asset.entityDetails.make} {asset.entityDetails.model}</>
                                  ) : (
                                    <>v{asset.entityDetails.version} ({asset.entityDetails.versionType})</>
                                  )
                                ) : 'Entity details not available'}
                              </p>
                              {asset.ownerInfo && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <User className="w-3 h-3" />
                                  {asset.ownerInfo.username || asset.ownerInfo.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-muted-foreground">
                              {new Date(asset.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: '2-digit'
                              })}
                            </p>
                            {asset.solscanUrl && (
                              <a 
                                href={asset.solscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 justify-end mt-1"
                              >
                                Solscan <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {asset.txSignature && !asset.solscanUrl && (
                              <p className="font-mono text-muted-foreground truncate max-w-[100px]">
                                {asset.txSignature.slice(0, 12)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════ AFFILIATES TAB (merged with Outreach) ═══════════════════════ */}
          <TabsContent value="affiliates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Card className="md:col-span-8 bg-gradient-to-br from-green-500/10 to-primary/5 border-green-500/30 p-4">
                <h2 className="font-tech text-lg text-green-400 mb-2">Affiliate Network Status</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  When users click a link on GarageBot and buy something, you earn a commission (typically 2-10% of the sale).
                </p>
                <div className="flex flex-wrap gap-2">
                  {AFFILIATE_NETWORKS.map(n => (
                    <Badge 
                      key={n.id}
                      className={`text-xs ${
                        n.status === 'connected' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {n.status === 'connected' ? '✓' : '○'} {n.name}
                    </Badge>
                  ))}
                </div>
              </Card>
              <Card className="md:col-span-4 glass-card border-primary/20 p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-tech text-xl text-green-400">{AFFILIATE_NETWORKS.filter(n => n.status === 'connected').length}</p>
                    <p className="text-[10px] text-muted-foreground">Connected</p>
                  </div>
                  <div>
                    <p className="font-tech text-xl text-yellow-400">{AFFILIATE_NETWORKS.filter(n => n.status === 'pending').length}</p>
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                  </div>
                  <div>
                    <p className="font-tech text-xl text-primary">{DIRECT_RETAILERS.length}</p>
                    <p className="text-[10px] text-muted-foreground">Direct</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-pink-500/10 to-indigo-500/5 border-pink-500/30 p-4">
              <h3 className="font-tech text-sm text-pink-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Hobby & RC Affiliate Setup Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AFFILIATE_NETWORKS.filter(n => n.hobbyRetailers && n.hobbyRetailers.length > 0).map(network => (
                  <div key={network.id} className="bg-background/50 rounded-lg p-3 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{network.logo}</span>
                      <span className="font-tech text-sm">{network.name}</span>
                      <Badge className={`text-[10px] ml-auto ${
                        network.status === 'connected' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {network.status === 'connected' ? 'CONNECTED' : 'NEED SIGNUP'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {network.hobbyRetailers?.map(r => (
                        <div key={r} className="flex items-center gap-2 text-xs">
                          <Circle className="w-3 h-3 text-muted-foreground" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                    {network.hobbyAction && (
                      <p className="text-[10px] text-muted-foreground mt-2 p-2 bg-primary/5 rounded">
                        {network.hobbyAction}
                      </p>
                    )}
                  </div>
                ))}
                {DIRECT_RETAILERS.filter(r => r.name === 'HobbyKing' || r.name === 'BETAFPV').map(retailer => (
                  <div key={retailer.name} className="bg-background/50 rounded-lg p-3 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{retailer.name === 'HobbyKing' ? '🎮' : '🚁'}</span>
                      <span className="font-tech text-sm">{retailer.name}</span>
                      <Badge className="text-[10px] ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">
                        DIRECT APPLY
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{retailer.notes}</p>
                    <a href={retailer.contactUrl || `mailto:${retailer.contact}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                      <ExternalLink className="w-3 h-3" /> Apply Now
                    </a>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-tech text-sm text-primary mb-2">Affiliate Networks</h3>
                <Accordion type="multiple" className="space-y-2" defaultValue={["amazon"]}>
                {AFFILIATE_NETWORKS.map(network => (
                  <AccordionItem 
                    key={network.id} 
                    value={network.id}
                    className="border border-primary/20 rounded-lg overflow-hidden glass-card"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{network.logo}</span>
                        <div className="flex-1 text-left">
                          <h4 className="font-tech font-bold">{network.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {network.retailers.slice(0, 3).join(", ")}{network.retailers.length > 3 ? ` +${network.retailers.length - 3} more` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${
                            network.status === 'connected' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {network.status === 'connected' ? 'CONNECTED' : 'PENDING'}
                          </Badge>
                          <Badge variant="outline" className={network.difficulty === "Easy" ? "border-green-500/50 text-green-400" : "border-yellow-500/50 text-yellow-400"}>
                            {network.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Commission Rate</p>
                          <p className="text-sm font-medium text-green-400">{network.commission}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Approval Time</p>
                          <p className="text-sm font-medium">{network.approval}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Retailers Available</p>
                        <div className="flex flex-wrap gap-1">
                          {network.retailers.map(r => (
                            <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Requirements</p>
                        <ul className="text-sm space-y-1">
                          {network.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Step-by-Step Setup</p>
                        <ol className="text-sm space-y-2">
                          {network.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {network.hobbyRetailers && network.hobbyRetailers.length > 0 && (
                        <div className="mb-4 p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                          <p className="text-xs text-pink-400 font-medium mb-2">Hobby & RC Retailers to Add</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {network.hobbyRetailers.map(r => (
                              <Badge key={r} className="text-xs bg-pink-500/20 text-pink-300 border-pink-500/30">{r}</Badge>
                            ))}
                          </div>
                          {network.hobbyAction && (
                            <p className="text-xs text-muted-foreground mt-1">{network.hobbyAction}</p>
                          )}
                        </div>
                      )}

                      <div className="p-3 bg-primary/10 rounded-lg mb-4">
                        <p className="text-xs text-muted-foreground mb-1">How to Integrate</p>
                        <p className="text-sm">{network.integration}</p>
                      </div>

                      <Button asChild className={`w-full font-tech uppercase ${network.status === 'connected' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> {network.status === 'connected' ? 'Open Dashboard' : `Sign Up at ${network.name}`}
                        </a>
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              </div>

              <div>
                <h3 className="font-tech text-sm text-primary mb-2">Direct Outreach</h3>
                <Accordion type="multiple" className="space-y-2">
                {DIRECT_RETAILERS.map((retailer, index) => (
                  <AccordionItem 
                    key={retailer.name} 
                    value={`retailer-${index}`}
                    className="border border-primary/20 rounded-lg overflow-hidden glass-card"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">
                          {retailer.name === "RockAuto" ? "🚗" : 
                           retailer.name === "O'Reilly Auto Parts" ? "🔧" :
                           retailer.name === "NAPA Auto Parts" ? "🔩" :
                           retailer.name === "VMC Chinese Parts" ? "🏍️" : "♻️"}
                        </span>
                        <div className="flex-1 text-left">
                          <h4 className="font-tech font-bold">{retailer.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {retailer.notes && retailer.notes.length > 60 
                              ? `${retailer.notes.slice(0, 60)}...` 
                              : retailer.notes || "Contact for partnership details"}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            (retailer.status || "").includes("✓") ? "border-green-500/50 text-green-400" :
                            retailer.status === "API Partnership" ? "border-purple-500/50 text-purple-400" :
                            "border-yellow-500/50 text-yellow-400"
                          }`}
                        >
                          {retailer.status || "Contact Required"}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-primary/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Primary Contact</p>
                              {'contactUrl' in retailer ? (
                                <a href={retailer.contactUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  {retailer.contact}
                                </a>
                              ) : (
                                <a href={`mailto:${retailer.contact}`} className="text-sm text-primary hover:underline">
                                  {retailer.contact}
                                </a>
                              )}
                            </div>
                          </div>
                          {'contactAlt' in retailer && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Alt Contact</p>
                                <a href={`mailto:${retailer.contactAlt}`} className="text-sm hover:underline">
                                  {retailer.contactAlt}
                                </a>
                              </div>
                            </div>
                          )}
                          {'phone' in retailer && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <a href={`tel:${retailer.phone?.replace(/[^0-9]/g, '')}`} className="text-sm hover:underline">
                                  {retailer.phone}
                                </a>
                              </div>
                            </div>
                          )}
                          {'keyContact' in retailer && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Key Contact</p>
                                <p className="text-sm font-medium">{retailer.keyContact}</p>
                              </div>
                            </div>
                          )}
                          {'ceoContact' in retailer && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-amber-400" />
                              <div>
                                <p className="text-xs text-muted-foreground">CEO Direct</p>
                                <a href={`mailto:${retailer.ceoContact}`} className="text-sm text-amber-400 hover:underline">
                                  {retailer.ceoContact}
                                </a>
                              </div>
                            </div>
                          )}
                          {'apiUrl' in retailer && (
                            <div className="flex items-center gap-2">
                              <Link2 className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="text-xs text-muted-foreground">API/Web Services</p>
                                <a href={retailer.apiUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-400 hover:underline">
                                  View API Docs
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-sm">{retailer.notes || "Contact for partnership details"}</p>

                        {(() => {
                          const letter = retailer.letterType 
                            ? OUTREACH_LETTERS[retailer.letterType as keyof typeof OUTREACH_LETTERS] 
                            : undefined;
                          if (!letter) return null;
                          return (
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <h5 className="font-tech text-sm text-primary flex items-center gap-2">
                                  <Mail className="w-4 h-4" /> Ready-to-Send Outreach Letter
                                </h5>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`Subject: ${letter.subject}\n\n${letter.body}`);
                                      toast({
                                        title: "Copied!",
                                        description: "Full letter copied to clipboard",
                                      });
                                    }}
                                  >
                                    <Copy className="w-3 h-3 mr-1" /> Copy Letter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => {
                                      navigator.clipboard.writeText(letter.subject);
                                      toast({
                                        title: "Copied!",
                                        description: "Subject line copied to clipboard",
                                      });
                                    }}
                                  >
                                    <Copy className="w-3 h-3 mr-1" /> Copy Subject
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
                                <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                                <p className="text-sm font-medium text-primary mb-3">{letter.subject}</p>
                                <p className="text-xs text-muted-foreground mb-1">Letter:</p>
                                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                                  {letter.body}
                                </pre>
                              </div>
                            </div>
                          );
                        })()}

                        {retailer.name === "NAPA Auto Parts" && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-sm text-green-400 font-medium">✓ No outreach letter needed!</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              NAPA has a standard affiliate program through FlexOffers. Just sign up there and apply to the NAPA program.
                            </p>
                            <Button asChild size="sm" className="mt-2 font-tech uppercase">
                              <a href="https://www.flexoffers.com/affiliate-programs/napa-auto-affiliate-program/" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" /> Apply at FlexOffers
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="glass-card border-green-500/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-green-500 text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">1</span>
                <p className="text-xs font-medium">Amazon + eBay</p>
                <p className="text-[10px] text-muted-foreground">Easiest approval</p>
              </Card>
              <Card className="glass-card border-yellow-500/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-yellow-500 text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">2</span>
                <p className="text-xs font-medium">CJ + ShareASale</p>
                <p className="text-[10px] text-muted-foreground">Major retailers</p>
              </Card>
              <Card className="glass-card border-primary/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-primary text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">3</span>
                <p className="text-xs font-medium">AvantLink + Impact</p>
                <p className="text-[10px] text-muted-foreground">Powersports</p>
              </Card>
              <Card className="glass-card border-purple-500/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">4</span>
                <p className="text-xs font-medium">Direct Outreach</p>
                <p className="text-[10px] text-muted-foreground">Custom deals</p>
              </Card>
            </div>

            {/* Outreach Vendors Section */}
            <div className="border-t border-primary/20 pt-6">
              {(() => {
                const withProgram = AFFILIATE_OUTREACH_VENDORS.filter(v => v.hasProgram);
                const withoutProgram = AFFILIATE_OUTREACH_VENDORS.filter(v => !v.hasProgram);
                const highPriority = AFFILIATE_OUTREACH_VENDORS.filter(v => v.priority === 'high');
                const categories = Array.from(new Set(AFFILIATE_OUTREACH_VENDORS.map(v => v.category)));
                
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                      <Card className="md:col-span-8 bg-gradient-to-br from-orange-500/10 to-primary/5 border-orange-500/30 p-4">
                        <h2 className="font-tech text-lg text-orange-400 mb-2 flex items-center gap-2">
                          <Megaphone className="w-5 h-5" /> Affiliate Outreach Command Center
                        </h2>
                        <p className="text-sm text-muted-foreground mb-3">
                          Complete contact list for all {AFFILIATE_OUTREACH_VENDORS.length} vendors needing affiliate connections. 
                          Research completed Feb 2026 with signup links, networks, contact info, and recommended actions.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                      <Card className="md:col-span-4 glass-card border-primary/20 p-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="font-tech text-xl text-green-400">{withProgram.length}</p>
                            <p className="text-[10px] text-muted-foreground">Has Program</p>
                          </div>
                          <div>
                            <p className="font-tech text-xl text-yellow-400">{withoutProgram.length}</p>
                            <p className="text-[10px] text-muted-foreground">Need Outreach</p>
                          </div>
                          <div>
                            <p className="font-tech text-xl text-red-400">{highPriority.length}</p>
                            <p className="text-[10px] text-muted-foreground">High Priority</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 p-4 mb-4">
                      <h3 className="font-tech text-sm text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Ready to Sign Up (Active Programs Found)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {withProgram.map(vendor => (
                          <div key={vendor.name} className="bg-background/50 rounded-lg p-3 border border-green-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-tech text-sm font-bold">{vendor.name}</span>
                              <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                                {vendor.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-orange-300 mb-1">{vendor.category}</p>
                            <p className="text-xs text-muted-foreground mb-2">{vendor.notes}</p>
                            <div className="flex items-center gap-1 text-xs text-cyan-300 mb-2">
                              <Link2 className="w-3 h-3" /> {vendor.network}
                            </div>
                            <div className="flex gap-2">
                              {vendor.contact.startsWith('http') ? (
                                <Button asChild size="sm" className="text-xs flex-1 bg-green-600 hover:bg-green-700">
                                  <a href={vendor.contact} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" /> Sign Up
                                  </a>
                                </Button>
                              ) : (
                                <Button asChild size="sm" variant="outline" className="text-xs flex-1">
                                  <a href={`mailto:${vendor.contact}`}>
                                    <Mail className="w-3 h-3 mr-1" /> Contact
                                  </a>
                                </Button>
                              )}
                              <Button asChild size="sm" variant="outline" className="text-xs">
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                                  <Globe className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30 p-4 mb-4">
                      <h3 className="font-tech text-sm text-yellow-400 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Need Direct Outreach (No Public Program)
                      </h3>
                      <div className="space-y-2">
                        {withoutProgram.map(vendor => (
                          <div key={vendor.name} className="bg-background/50 rounded-lg p-3 border border-yellow-500/10 flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-tech text-sm font-bold">{vendor.name}</span>
                                <Badge variant="outline" className={`text-[10px] ${
                                  vendor.priority === 'high' ? 'border-red-500/50 text-red-400' :
                                  vendor.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                                  'border-gray-500/50 text-gray-400'
                                }`}>
                                  {vendor.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-300">
                                  {vendor.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{vendor.notes}</p>
                              <p className="text-[10px] text-cyan-300">{vendor.network}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {vendor.phone && (
                                <Button asChild size="sm" variant="outline" className="text-xs">
                                  <a href={`tel:${vendor.phone.replace(/[^0-9]/g, '')}`}>
                                    <Phone className="w-3 h-3 mr-1" /> {vendor.phone}
                                  </a>
                                </Button>
                              )}
                              {vendor.contact.startsWith('http') ? (
                                <Button asChild size="sm" variant="outline" className="text-xs">
                                  <a href={vendor.contact} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" /> Contact
                                  </a>
                                </Button>
                              ) : vendor.contact.includes('@') ? (
                                <Button asChild size="sm" variant="outline" className="text-xs">
                                  <a href={`mailto:${vendor.contact}`}>
                                    <Mail className="w-3 h-3 mr-1" /> Email
                                  </a>
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-xs">{vendor.contact}</Badge>
                              )}
                              <Button asChild size="sm" variant="outline" className="text-xs">
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                                  <Globe className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="glass-card border-primary/20 p-4 mb-4">
                      <h3 className="font-tech text-sm text-primary mb-3 flex items-center gap-2">
                        <Rocket className="w-4 h-4" /> Recommended Signup Order
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="font-tech text-xs text-green-400 mb-2">PHASE 1: Quick Wins</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>1. Power Mower Sales (direct, 5%)</li>
                            <li>2. Aurora Off Road (direct, 5%)</li>
                            <li>3. FinditParts (FlexOffers/CJ)</li>
                            <li>4. Sixity Powersports (FlexOffers)</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <p className="font-tech text-xs text-yellow-400 mb-2">PHASE 2: AvantLink Batch</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>5. Wholesale Marine (AvantLink)</li>
                            <li>6. Marine Products Pro Shop (AvantLink)</li>
                            <li>7. BuyAutoParts.com (AvantLink/CJ)</li>
                            <li>8. Dennis Kirk (AvantLink)</li>
                          </ul>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                          <p className="font-tech text-xs text-orange-400 mb-2">PHASE 3: Direct Outreach</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>9. Aircraft Spruce (dealer pgm)</li>
                            <li>10. RockAuto (forum partnership)</li>
                            <li>11. O'Reilly (sponsorship)</li>
                            <li>12. Car-Part.com (API partner)</li>
                          </ul>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                          <p className="font-tech text-xs text-purple-400 mb-2">PHASE 4: Niche Coverage</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>13. Sky Supply USA (direct)</li>
                            <li>14. Diesel Laptops (15%!)</li>
                            <li>15. Lawnmower Pros (direct)</li>
                            <li>16. VMC Chinese Parts (propose)</li>
                          </ul>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-amber-500/10 border border-amber-500/30 p-4">
                      <h3 className="font-tech text-sm text-amber-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Impact Network Note
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        AutoZone's affiliate program is on the Impact network which has a <strong className="text-amber-400">$30/month minimum subscription</strong>. 
                        This was ruled out for now. Revisit once GarageBot has enough traffic to justify the cost. 
                        Bass Pro Shops and Camping World are also on Impact but may be available via CJ or other networks too.
                      </p>
                    </Card>
                  </>
                );
              })()}
            </div>
          </TabsContent>

          {/* ═══════════════════════ BUDDY AI TAB ═══════════════════════ */}
          <TabsContent value="buddy" className="space-y-4">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-primary/5 border-cyan-500/30">
              <div className="p-4 border-b border-cyan-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-tech text-lg text-cyan-400">Buddy AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask me anything about GarageBot, releases, or development</p>
                </div>
              </div>
              
              <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-cyan-400/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Start a conversation with Buddy</p>
                    <p className="text-xs text-muted-foreground mt-1">Try: "What's the latest release?" or "Create a new release"</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary/20 text-foreground' 
                        : 'bg-cyan-500/10 border border-cyan-500/20 text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-cyan-500/20 flex gap-2">
                <Input
                  placeholder="Ask Buddy anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  className="flex-1 bg-background/50 border-cyan-500/30 focus:border-cyan-500"
                  data-testid="input-buddy-chat"
                />
                <Button 
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || chatMutation.isPending}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-tech"
                  data-testid="button-send-buddy"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
            
            <Card className="glass-card border-border p-4">
              <h4 className="font-tech text-sm text-primary mb-2">Quick Commands</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "What's the latest version?",
                  "Show blockchain status",
                  "How many retailers do we have?",
                  "What's new in v1.0.10?",
                ].map((cmd) => (
                  <Button
                    key={cmd}
                    variant="outline"
                    size="sm"
                    className="text-xs border-primary/30 hover:bg-primary/10"
                    onClick={() => {
                      setChatInput(cmd);
                    }}
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function VendorLogoChecklist() {
  const { data: vendors = [] } = useQuery<Array<{ id: string; name: string; slug: string; logoUrl: string | null; websiteUrl: string; affiliateNetwork: string; commissionRate: string }>>({
    queryKey: ["/api/vendors/logo-status"],
  });

  const vendorsWithLogos = vendors.filter(v => v.logoUrl);
  const vendorsMissingLogos = vendors.filter(v => !v.logoUrl);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-2xl font-bold text-green-400">{vendorsWithLogos.length}</p>
          <p className="text-xs text-green-400/70">Have Logos</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-2xl font-bold text-amber-400">{vendorsMissingLogos.length}</p>
          <p className="text-xs text-amber-400/70">Need Logos</p>
        </div>
      </div>

      {vendorsMissingLogos.length > 0 && (
        <div>
          <h4 className="font-tech text-sm text-amber-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Missing Logos ({vendorsMissingLogos.length})
          </h4>
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
            {vendorsMissingLogos.map(vendor => (
              <div key={vendor.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-amber-500/30 transition-colors" data-testid={`logo-missing-${vendor.slug}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-700/50 flex items-center justify-center text-xs font-bold text-gray-400">
                    {vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{vendor.name}</p>
                    <p className="text-[10px] text-gray-500">{vendor.slug} | {vendor.affiliateNetwork || 'Direct'} | {vendor.commissionRate ? `${vendor.commissionRate}%` : 'N/A'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">Needs Logo</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendorsWithLogos.length > 0 && (
        <div>
          <h4 className="font-tech text-sm text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Have Logos ({vendorsWithLogos.length})
          </h4>
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
            {vendorsWithLogos.map(vendor => (
              <div key={vendor.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 border border-gray-700/50" data-testid={`logo-have-${vendor.slug}`}>
                <div className="flex items-center gap-3">
                  <img src={vendor.logoUrl!} alt={vendor.name} className="w-8 h-8 rounded object-contain bg-white/10" />
                  <div>
                    <p className="text-sm text-white font-medium">{vendor.name}</p>
                    <p className="text-[10px] text-gray-500">{vendor.slug}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Has Logo</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
