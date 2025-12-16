import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lock, CheckCircle2, Circle, Plus, ExternalLink, Trash2, 
  DollarSign, Link2, Settings, Zap, Users, Shield, Clock,
  ChevronDown, ChevronRight, Edit2, Save, X, AlertTriangle,
  BookOpen, ArrowRight, CheckCheck, Timer, Globe, CreditCard, ClipboardList,
  Copy, Mail, Phone, User, Tag, Rocket, Archive, GitBranch, Blocks, Car,
  MessageCircle, Send, Bot, Loader2, BarChart3
} from "lucide-react";
import Nav from "@/components/Nav";
import { FeatureInventory } from "@/components/FeatureInventory";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
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
    retailers: ["Amazon Automotive", "Amazon Tools"],
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
    integration: "Update vendor records with your Associate tag. Links become: amazon.com/dp/ASIN?tag=YOUR-TAG"
  },
  {
    id: "cj",
    name: "CJ Affiliate (Commission Junction)",
    logo: "🔗",
    url: "https://www.cj.com/join",
    commission: "Varies by retailer (2-8%)",
    approval: "1-3 business days for CJ, then apply to each retailer",
    difficulty: "Medium",
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
    integration: "CJ provides unique tracking links for each retailer. Use their link generator or Deep Link Automation."
  },
  {
    id: "shareasale",
    name: "ShareASale",
    logo: "💰",
    url: "https://www.shareasale.com/info/affiliates/",
    commission: "Varies by retailer (3-10%)",
    approval: "24-72 hours for network, varies by retailer",
    difficulty: "Easy",
    retailers: ["Partzilla", "Jack's Small Engines", "Classic Industries", "RV Parts Country", "etrailer"],
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
    integration: "ShareASale provides tracking links. Use their bookmarklet or API for deep linking."
  },
  {
    id: "avantlink",
    name: "AvantLink",
    logo: "⚡",
    url: "https://www.avantlink.com/affiliates/",
    commission: "3-15% depending on retailer",
    approval: "1-5 business days",
    difficulty: "Medium",
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
    integration: "AvantLink has a good API for automated linking. Deep linking supported."
  },
  {
    id: "impact",
    name: "Impact (formerly Impact Radius)",
    logo: "🎯",
    url: "https://impact.com/partners/",
    commission: "Varies (2-8%)",
    approval: "2-5 business days",
    difficulty: "Medium",
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
    id: "ebay",
    name: "eBay Partner Network",
    logo: "🏷️",
    url: "https://partnernetwork.ebay.com",
    commission: "1-4% depending on category",
    approval: "Instant to 24 hours",
    difficulty: "Easy",
    retailers: ["eBay Motors", "eBay Auto Parts"],
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
  }
];

const OUTREACH_LETTERS = {
  forum_partnership: {
    subject: "GarageBot.io Partnership Inquiry - Auto Parts Search Platform",
    body: `Dear RockAuto Team,

I'm Jason, the founder of GarageBot.io, a comprehensive auto parts search aggregator that helps vehicle owners find the right parts across 40+ retailers.

I understand RockAuto works with automotive communities through discount code partnerships rather than traditional affiliate programs. I'd love to explore a similar arrangement.

**About GarageBot:**
• Unified search across 40+ auto parts retailers
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
GarageBot.io is a comprehensive auto parts search aggregator that unifies inventory from 40+ retailers into a single searchable interface. We serve DIY enthusiasts, professional mechanics, and fleet managers.

**Key Features:**
• VIN-based vehicle identification and part matching
• AI-powered repair guides and part recommendations
• "Mechanics Garage" portal for professional shops
• Coverage across cars, trucks, boats, ATVs, motorcycles, RVs, and more

**Partnership Interests:**
1. **Affiliate/Referral Program** - Drive qualified buyers to O'Reilly locations and online store
2. **Local Pickup Integration** - Highlight O'Reilly stores for same-day pickup options
3. **Commercial Account** - Access to B2B pricing for our Mechanics Garage portal users
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
• Auto parts search aggregator covering 40+ retailers
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
• Unified search across 40+ auto parts retailers (new parts focus currently)
• VIN decoding and vehicle-specific part matching
• AI-powered recommendations and DIY repair guides
• "Mechanics Garage" portal for professional shops
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
  }
};

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
  { id: "partnerships", name: "Partnerships", icon: Users, color: "text-purple-400" },
  { id: "legal", name: "Legal & Compliance", icon: Shield, color: "text-red-400" },
  { id: "infrastructure", name: "Infrastructure", icon: Settings, color: "text-cyan-400" },
];

const DEFAULT_TASKS: Omit<DevTask, 'id' | 'completedAt'>[] = [
  { category: "affiliates", title: "AutoZone Affiliate Program", description: "Sign up for AutoZone affiliate program through CJ Affiliate", priority: "high", status: "pending", dueDate: null, link: "https://www.cj.com", notes: null, sortOrder: 1 },
  { category: "affiliates", title: "O'Reilly Auto Parts Affiliate", description: "Apply for O'Reilly affiliate partnership", priority: "high", status: "pending", dueDate: null, link: "https://www.oreillyauto.com", notes: null, sortOrder: 2 },
  { category: "affiliates", title: "RockAuto Affiliate Program", description: "Join RockAuto affiliate network", priority: "high", status: "pending", dueDate: null, link: "https://www.rockauto.com", notes: null, sortOrder: 3 },
  { category: "affiliates", title: "Amazon Associates - Automotive", description: "Set up Amazon Associates for automotive category", priority: "high", status: "pending", dueDate: null, link: "https://affiliate-program.amazon.com", notes: null, sortOrder: 4 },
  { category: "affiliates", title: "Advance Auto Parts Affiliate", description: "Apply for Advance Auto affiliate program", priority: "medium", status: "pending", dueDate: null, link: "https://www.advanceautoparts.com", notes: null, sortOrder: 5 },
  { category: "affiliates", title: "NAPA Online Affiliate", description: "Join NAPA affiliate network", priority: "medium", status: "pending", dueDate: null, link: "https://www.napaonline.com", notes: null, sortOrder: 6 },
  { category: "affiliates", title: "Summit Racing Affiliate", description: "Apply for Summit Racing affiliate partnership", priority: "medium", status: "pending", dueDate: null, link: "https://www.summitracing.com", notes: null, sortOrder: 7 },
  { category: "affiliates", title: "Dennis Kirk Affiliate", description: "Powersports affiliate program", priority: "medium", status: "pending", dueDate: null, link: "https://www.denniskirk.com", notes: null, sortOrder: 8 },
  { category: "affiliates", title: "West Marine Affiliate", description: "Marine parts affiliate partnership", priority: "medium", status: "pending", dueDate: null, link: "https://www.westmarine.com", notes: null, sortOrder: 9 },
  { category: "affiliates", title: "eBay Partner Network", description: "Set up eBay Motors affiliate links", priority: "medium", status: "pending", dueDate: null, link: "https://partnernetwork.ebay.com", notes: null, sortOrder: 10 },
  { category: "apis", title: "NHTSA VIN Decoder API", description: "Integrate NHTSA VIN decoding for vehicle identification", priority: "high", status: "pending", dueDate: null, link: "https://vpic.nhtsa.dot.gov/api/", notes: null, sortOrder: 1 },
  { category: "apis", title: "NHTSA Recalls API", description: "Set up recall alerts using NHTSA recall database", priority: "high", status: "pending", dueDate: null, link: "https://www.nhtsa.gov/recalls", notes: null, sortOrder: 2 },
  { category: "apis", title: "OpenAI Vision API", description: "Enable photo-based part identification", priority: "high", status: "pending", dueDate: null, link: "https://platform.openai.com", notes: null, sortOrder: 3 },
  { category: "apis", title: "Web Speech API", description: "Implement voice search with Hey Buddy", priority: "medium", status: "pending", dueDate: null, link: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API", notes: null, sortOrder: 4 },
  { category: "apis", title: "Stripe Subscriptions", description: "Set up Pro tier subscription billing", priority: "high", status: "pending", dueDate: null, link: "https://stripe.com/docs/billing/subscriptions", notes: null, sortOrder: 5 },
  { category: "apis", title: "Twilio SMS API", description: "Enable SMS notifications and reminders", priority: "medium", status: "pending", dueDate: null, link: "https://www.twilio.com", notes: null, sortOrder: 6 },
  { category: "features", title: "VIN Scanner Camera", description: "Build camera-based VIN scanning feature", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "features", title: "Photo Part Search", description: "Snap photo → AI identifies part", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "features", title: "Voice Search (Hey Buddy)", description: "Voice-activated search commands", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "features", title: "Predictive Maintenance", description: "Mileage-based service reminders", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 4 },
  { category: "features", title: "Family Garage Sharing", description: "Share vehicles with family members", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 5 },
  { category: "features", title: "Collaborative Carts", description: "Family can add to shared carts", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 6 },
  { category: "features", title: "PWA Offline Mode", description: "Works without internet in garage", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 7 },
  { category: "features", title: "Order Tracking", description: "Track parts shipments", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 8 },
  { category: "features", title: "Member Referral Program", description: "Unique referral codes/links for each user, track sign-ups", priority: "high", status: "pending", dueDate: null, link: null, notes: "Phase 2 feature", sortOrder: 9 },
  { category: "features", title: "Referral Points System", description: "100 pts for sign-up, 500 pts when friend goes Pro", priority: "high", status: "pending", dueDate: null, link: null, notes: "Points balance in user profile", sortOrder: 10 },
  { category: "features", title: "Points Redemption Flow", description: "500 pts = 1 month Pro, 1000 pts = 1 year, 2500 pts = Lifetime", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Auto-extend Pro subscription time", sortOrder: 11 },
  { category: "features", title: "Invite Friends UI", description: "Show referral link, stats, and points balance in profile", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Copy-to-clipboard + share buttons", sortOrder: 12 },
  { category: "partnerships", title: "Insurance Company Partnerships", description: "Set up referral agreements with auto insurers", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "partnerships", title: "Mechanic Shop Network", description: "Recruit shops to Shop Portal", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "partnerships", title: "Extended Warranty Partners", description: "Referral deals with warranty providers", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "legal", title: "Terms of Service", description: "Draft and publish ToS", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "legal", title: "Affiliate Disclosure", description: "FTC-compliant affiliate disclosures", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "legal", title: "DMCA Policy", description: "Copyright protection policy", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "infrastructure", title: "Domain: garagebot.io", description: "Register and configure primary domain", priority: "high", status: "pending", dueDate: null, link: "https://domains.google.com", notes: null, sortOrder: 1 },
  { category: "infrastructure", title: "Domain: garagebot.net", description: "Set up redirect domain", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "infrastructure", title: "SSL Certificates", description: "Ensure SSL on all domains", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "infrastructure", title: "CDN Setup", description: "Configure CDN for assets", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 4 },
  
  // SHOP SOFTWARE OAUTH INTEGRATIONS - Accounting
  { category: "shop_integrations", title: "QuickBooks Online OAuth", description: "OAuth 2.0 - Sync invoices, payments, financial reports. Apply at developer.intuit.com", priority: "high", status: "pending", dueDate: null, link: "https://developer.intuit.com", notes: "OAuth 2.0, access token expires 1hr, refresh 100 days", sortOrder: 1 },
  { category: "shop_integrations", title: "FreshBooks OAuth", description: "OAuth 2.0 - Time tracking, invoicing, expense management", priority: "medium", status: "pending", dueDate: null, link: "https://www.freshbooks.com/api", notes: "OAuth 2.0 Authorization Code flow", sortOrder: 2 },
  { category: "shop_integrations", title: "Xero OAuth", description: "OAuth 2.0 - Cloud accounting with powerful reporting", priority: "medium", status: "pending", dueDate: null, link: "https://developer.xero.com", notes: "OAuth 2.0, PKCE flow recommended", sortOrder: 3 },
  { category: "shop_integrations", title: "Wave Accounting API", description: "Free accounting software API integration", priority: "low", status: "pending", dueDate: null, link: "https://developer.waveapps.com", notes: "GraphQL API", sortOrder: 4 },
  
  // SHOP SOFTWARE OAUTH - Workforce & Payroll
  { category: "shop_integrations", title: "UKG Pro OAuth", description: "OAuth 2.0 - HR, payroll, talent management. Apply at developer.ukg.com", priority: "high", status: "pending", dueDate: null, link: "https://developer.ukg.com", notes: "OAuth 2.0 client credentials, token ~30min", sortOrder: 5 },
  { category: "shop_integrations", title: "ADP OAuth", description: "OAuth 2.0 - Payroll, HR, workforce management", priority: "high", status: "pending", dueDate: null, link: "https://developers.adp.com", notes: "OAuth 2.0, requires partner approval", sortOrder: 6 },
  { category: "shop_integrations", title: "Gusto OAuth", description: "OAuth 2.0 - Modern payroll and benefits for small business", priority: "medium", status: "pending", dueDate: null, link: "https://dev.gusto.com", notes: "OAuth 2.0, REST API", sortOrder: 7 },
  { category: "shop_integrations", title: "Paychex API", description: "Payroll and HR services integration", priority: "medium", status: "pending", dueDate: null, link: "https://developer.paychex.com", notes: "REST API with OAuth", sortOrder: 8 },
  
  // SHOP SOFTWARE - Scheduling & Communication
  { category: "shop_integrations", title: "Google Calendar OAuth", description: "OAuth 2.0 - Sync appointments with Google accounts", priority: "high", status: "pending", dueDate: null, link: "https://console.cloud.google.com", notes: "OAuth 2.0, calendar.events scope", sortOrder: 9 },
  { category: "shop_integrations", title: "Google Workspace OAuth", description: "OAuth 2.0 - Gmail, Drive, Sheets integration", priority: "medium", status: "pending", dueDate: null, link: "https://console.cloud.google.com", notes: "OAuth 2.0, multiple scopes available", sortOrder: 10 },
  { category: "shop_integrations", title: "Microsoft 365 OAuth", description: "OAuth 2.0 - Outlook calendar and email sync", priority: "medium", status: "pending", dueDate: null, link: "https://portal.azure.com", notes: "Azure AD OAuth 2.0", sortOrder: 11 },
  { category: "shop_integrations", title: "Twilio API", description: "API Key - SMS notifications and customer messaging", priority: "high", status: "pending", dueDate: null, link: "https://www.twilio.com/console", notes: "API Key auth, no OAuth", sortOrder: 12 },
  { category: "shop_integrations", title: "SendGrid API", description: "API Key - Email notifications and invoices", priority: "medium", status: "pending", dueDate: null, link: "https://app.sendgrid.com", notes: "API Key auth, 69 char keys", sortOrder: 13 },
  { category: "shop_integrations", title: "Mailchimp OAuth", description: "OAuth 2.0 - Email marketing and customer outreach", priority: "low", status: "pending", dueDate: null, link: "https://mailchimp.com/developer", notes: "OAuth 2.0, tokens never expire", sortOrder: 14 },
  
  // SHOP SOFTWARE - Vehicle Data
  { category: "shop_integrations", title: "CARFAX API", description: "Vehicle history report integration", priority: "high", status: "pending", dueDate: null, link: "https://www.carfaxforlife.com", notes: "Contact for partnership", sortOrder: 15 },
  { category: "shop_integrations", title: "AutoCheck API", description: "Vehicle history from Experian", priority: "medium", status: "pending", dueDate: null, link: "https://www.autocheck.com", notes: "Contact for API access", sortOrder: 16 },
  { category: "shop_integrations", title: "Smartcar OAuth", description: "OAuth 2.0 - Connected vehicle data from 30+ brands", priority: "medium", status: "pending", dueDate: null, link: "https://smartcar.com/developers", notes: "OAuth 2.0, real-time vehicle data", sortOrder: 17 },
  
  // SHOP SOFTWARE - Payment
  { category: "shop_integrations", title: "Square OAuth", description: "OAuth 2.0 - Payment processing and POS", priority: "medium", status: "pending", dueDate: null, link: "https://developer.squareup.com", notes: "OAuth 2.0 for Connect API", sortOrder: 18 },
  { category: "shop_integrations", title: "PayPal OAuth", description: "OAuth 2.0 - Alternative payment option", priority: "low", status: "pending", dueDate: null, link: "https://developer.paypal.com", notes: "OAuth 2.0 REST API", sortOrder: 19 },
  
  // SHOP SOFTWARE - Competitor Data Import
  { category: "shop_integrations", title: "Shopmonkey API", description: "API/OAuth - Import customer data from Shopmonkey shops", priority: "medium", status: "pending", dueDate: null, link: "https://shopmonkey.dev", notes: "REST API, Bearer token auth", sortOrder: 20 },
  { category: "shop_integrations", title: "Tekmetric API", description: "REST API - Import from Tekmetric shops", priority: "medium", status: "pending", dueDate: null, link: "https://api.tekmetric.com", notes: "REST API with OAuth", sortOrder: 21 },
  { category: "shop_integrations", title: "Mitchell 1 API", description: "Shop management data import", priority: "low", status: "pending", dueDate: null, link: "https://mitchell1.com", notes: "Contact for API access", sortOrder: 22 },
  
  // PARTS ORDERING INTEGRATIONS
  { category: "parts_ordering", title: "PartsTech API (FREE)", description: "FREE API - Search 20,000+ suppliers, 7M+ parts, VIN lookup", priority: "high", status: "pending", dueDate: null, link: "https://partstech.com", notes: "FREE - Username + API key auth", sortOrder: 1 },
  { category: "parts_ordering", title: "Nexpart/WHI Solutions API", description: "43,000+ seller locations, multi-seller stock check", priority: "high", status: "pending", dueDate: null, link: "https://whisolutions.com/products/nexpart-ecommerce-solution", notes: "SDK + REST API, contact WHI", sortOrder: 2 },
  { category: "parts_ordering", title: "WorldPac SpeedDIAL API", description: "OEM and import parts distributor", priority: "medium", status: "pending", dueDate: null, link: "https://worldpac.com", notes: "Contact for API access", sortOrder: 3 },
  { category: "parts_ordering", title: "RepairLink API", description: "OEM parts ordering integration", priority: "medium", status: "pending", dueDate: null, link: "https://repairlink.com", notes: "OEM parts network", sortOrder: 4 },
  { category: "parts_ordering", title: "AutoZone Pro Commercial", description: "Commercial account integration for shops", priority: "high", status: "pending", dueDate: null, link: "https://www.autozonepro.com", notes: "Contact for commercial API", sortOrder: 5 },
  { category: "parts_ordering", title: "O'Reilly Pro Commercial", description: "Commercial/shop account ordering", priority: "high", status: "pending", dueDate: null, link: "https://www.oreillyauto.com", notes: "Contact for commercial partnership", sortOrder: 6 },
  { category: "parts_ordering", title: "Advance Pro Commercial", description: "Commercial parts ordering for shops", priority: "medium", status: "pending", dueDate: null, link: "https://shop.advanceautoparts.com", notes: "Contact for pro account API", sortOrder: 7 },
  { category: "parts_ordering", title: "NAPA TRACS Integration", description: "NAPA commercial shop ordering", priority: "medium", status: "pending", dueDate: null, link: "https://napatracs.com", notes: "NAPA commercial accounts", sortOrder: 8 },
  
  // TOOL ORDERING (B2B/EDI)
  { category: "parts_ordering", title: "Grainger API", description: "Industrial tool and supply ordering", priority: "medium", status: "pending", dueDate: null, link: "https://www.grainger.com", notes: "B2B API available", sortOrder: 9 },
  { category: "parts_ordering", title: "MSC Industrial API", description: "Industrial tools and metalworking", priority: "medium", status: "pending", dueDate: null, link: "https://www.mscdirect.com", notes: "EDI/API for B2B", sortOrder: 10 },
  { category: "parts_ordering", title: "Fastenal B2B Integration", description: "Industrial and construction supplies", priority: "low", status: "pending", dueDate: null, link: "https://www.fastenal.com", notes: "B2B integration options", sortOrder: 11 },
  { category: "parts_ordering", title: "Snap-on B2B Portal", description: "Tool ordering for shops (EDI required)", priority: "low", status: "pending", dueDate: null, link: "https://b2b.snapon.com", notes: "Contact order@snapon.com for B2B", sortOrder: 12 },
  { category: "parts_ordering", title: "Matco Tools EDI", description: "EDI integration via B2BGateway", priority: "low", status: "pending", dueDate: null, link: "https://www.matcotools.com", notes: "EDI via B2BGateway.net", sortOrder: 13 },
  
  // FORTELLIS MARKETPLACE
  { category: "parts_ordering", title: "Fortellis Marketplace", description: "CDK Global automotive API marketplace", priority: "medium", status: "pending", dueDate: null, link: "https://fortellis.io", notes: "Automotive API ecosystem", sortOrder: 14 },
  
  // MARKETING & MONETIZATION
  { category: "marketing", title: "Google AdSense Setup", description: "Sign up for Google AdSense to monetize informational pages (NOT search results). Get your publisher ID (ca-pub-XXXXX)", priority: "high", status: "pending", dueDate: null, link: "https://adsense.google.com/start/", notes: "Only on informational pages (DIY guides, about, blog). Avoid on search results to keep UX clean", sortOrder: 1 },
  { category: "marketing", title: "Buffer Account Setup", description: "Create Buffer account for social media scheduling. Connect Twitter/X, Facebook, Instagram, LinkedIn", priority: "medium", status: "pending", dueDate: null, link: "https://buffer.com", notes: "Free tier: 3 channels, 10 posts/channel. Pro $6/mo for more", sortOrder: 2 },
  { category: "marketing", title: "Hypefury Account Setup", description: "Twitter/X automation and thread scheduling. Great for automotive tips content", priority: "medium", status: "pending", dueDate: null, link: "https://hypefury.com", notes: "Auto-retweet best content, engagement features", sortOrder: 3 },
  { category: "marketing", title: "Content Calendar Creation", description: "Build 30-day social content calendar: DIY tips, part deals, seasonal maintenance, Buddy AI highlights", priority: "medium", status: "pending", dueDate: null, link: null, notes: "Mix: 40% educational, 30% deals, 20% engagement, 10% promotional", sortOrder: 4 },
  { category: "marketing", title: "TikTok/Reels Strategy", description: "Short-form video content: quick repair tips, tool reviews, before/after fixes", priority: "low", status: "pending", dueDate: null, link: null, notes: "Repurpose DIY guide content into 60-sec videos", sortOrder: 5 },
  { category: "marketing", title: "Email Marketing Setup", description: "Set up email list for price drop alerts, weekly deals digest, maintenance reminders", priority: "medium", status: "pending", dueDate: null, link: "https://www.mailerlite.com", notes: "Free up to 1000 subscribers", sortOrder: 6 },
  { category: "marketing", title: "Google Analytics 4", description: "Set up GA4 for traffic and conversion tracking", priority: "high", status: "pending", dueDate: null, link: "https://analytics.google.com", notes: "Track: searches, affiliate clicks, conversions, Buddy usage", sortOrder: 7 },
];

export default function DevPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.id));
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ category: "features", title: "", description: "", priority: "medium", link: "" });
  const [activeTab, setActiveTab] = useState("features");
  const [showNewRelease, setShowNewRelease] = useState(false);
  const [newRelease, setNewRelease] = useState({
    version: "",
    versionType: "stable" as "beta" | "stable" | "hotfix" | "major",
    title: "",
    changelog: [{ category: "Features", changes: [""] }],
    highlights: [""],
    notes: "",
  });
  
  // Buddy AI Chat state
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

  // Release Version Control
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

  // Blockchain Assets
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

  // Buddy AI Chat mutation
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
            <Card className="bg-card border-primary/30 p-8">
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-24 min-h-[calc(100vh-5rem)] max-w-6xl mx-auto px-4 pb-20">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Header Card - spans 8 cols */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8"
          >
            <Card className="bg-card/50 border-primary/20 p-4 h-full">
              <h1 className="font-tech text-2xl uppercase text-primary mb-1">Dev Portal</h1>
              <p className="text-sm text-muted-foreground">Your daily checklist for building GarageBot</p>
            </Card>
          </motion.div>
          
          {/* Progress Ring Card - spans 4 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4"
          >
            <Card className="bg-card/50 border-primary/20 p-4 h-full flex items-center justify-center gap-4">
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
          <TabsList className="grid w-full grid-cols-7 mb-4 max-w-4xl">
            <TabsTrigger value="features" className="font-tech uppercase text-xs">
              <ClipboardList className="w-3 h-3 mr-1" /> Features
            </TabsTrigger>
            <TabsTrigger value="tasks" className="font-tech uppercase text-xs">
              <CheckCheck className="w-3 h-3 mr-1" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="releases" className="font-tech uppercase text-xs">
              <Tag className="w-3 h-3 mr-1" /> Releases
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="font-tech uppercase text-xs">
              <Blocks className="w-3 h-3 mr-1" /> Blockchain
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-tech uppercase text-xs">
              <BarChart3 className="w-3 h-3 mr-1" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="font-tech uppercase text-xs">
              <DollarSign className="w-3 h-3 mr-1" /> Affiliates
            </TabsTrigger>
            <TabsTrigger value="buddy" className="font-tech uppercase text-xs">
              <Bot className="w-3 h-3 mr-1" /> Buddy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-6">
            <FeatureInventory />
          </TabsContent>

          <TabsContent value="releases" className="space-y-4">
            {/* Bento Grid: Current Version + Actions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Current Version - 8 cols */}
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
              
              {/* Actions - 4 cols */}
              <Card className="md:col-span-4 bg-card/50 border-primary/20 p-4 flex flex-col justify-center gap-2">
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

            {/* New Release Form */}
            <AnimatePresence>
              {showNewRelease && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="bg-card border-primary/30 p-6">
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

            {/* Release History - 2 column grid */}
            <div>
              <h3 className="font-tech text-sm text-primary mb-3">Release History</h3>
              
              {releases.length === 0 && (
                <Card className="bg-card/50 border-border p-6 text-center">
                  <Archive className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No releases yet. Create your first release above!</p>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {releases.map((release) => (
                <Card 
                  key={release.id} 
                  className={`bg-card border-border p-3 ${
                    release.status === 'published' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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

                      {/* Changelog */}
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
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-4">
            {/* Blockchain Status Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Network Status - 8 cols */}
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
              
              {/* Stats - 4 cols */}
              <Card className="md:col-span-4 bg-card/50 border-primary/20 p-4 flex flex-col justify-center gap-2">
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

            {/* Assets List */}
            <Card className="bg-card/50 border-primary/20 p-4">
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-4">
            {/* Bento Grid: Intro + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Card className="md:col-span-8 bg-gradient-to-br from-green-500/10 to-primary/5 border-green-500/30 p-4">
                <h2 className="font-tech text-lg text-green-400 mb-2">How Affiliate Marketing Works</h2>
                <p className="text-sm text-muted-foreground">
                  When users click a link on GarageBot and buy something, you earn a commission (typically 2-10% of the sale).
                </p>
              </Card>
              <Card className="md:col-span-4 bg-card/50 border-primary/20 p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-tech text-xl text-primary">{AFFILIATE_NETWORKS.length}</p>
                    <p className="text-[10px] text-muted-foreground">Networks</p>
                  </div>
                  <div>
                    <p className="font-tech text-xl text-green-400">2-10%</p>
                    <p className="text-[10px] text-muted-foreground">Commission</p>
                  </div>
                  <div>
                    <p className="font-tech text-xl text-yellow-400">1-5d</p>
                    <p className="text-[10px] text-muted-foreground">Approval</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 6/6 Grid: Networks + Retailers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Affiliate Networks */}
              <div>
                <h3 className="font-tech text-sm text-primary mb-2">Affiliate Networks</h3>
                <Accordion type="multiple" className="space-y-2" defaultValue={["amazon"]}>
                {AFFILIATE_NETWORKS.map(network => (
                  <AccordionItem 
                    key={network.id} 
                    value={network.id}
                    className="border border-primary/20 rounded-lg overflow-hidden bg-card/30"
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

                      <div className="p-3 bg-primary/10 rounded-lg mb-4">
                        <p className="text-xs text-muted-foreground mb-1">How to Integrate</p>
                        <p className="text-sm">{network.integration}</p>
                      </div>

                      <Button asChild className="w-full font-tech uppercase">
                        <a href={network.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> Sign Up at {network.name}
                        </a>
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              </div>

              {/* Right: Direct Retailers */}
              <div>
                <h3 className="font-tech text-sm text-primary mb-2">Direct Outreach</h3>
                <Accordion type="multiple" className="space-y-2">
                {DIRECT_RETAILERS.map((retailer, index) => (
                  <AccordionItem 
                    key={retailer.name} 
                    value={`retailer-${index}`}
                    className="border border-primary/20 rounded-lg overflow-hidden bg-card/30"
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
                        {/* Contact Info Section */}
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

                        {/* Outreach Letter Section - only render if letter exists */}
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

                        {/* NAPA special message */}
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

            {/* Bottom: Recommended Order as 2x2 grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-card/50 border-green-500/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-green-500 text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">1</span>
                <p className="text-xs font-medium">Amazon + eBay</p>
                <p className="text-[10px] text-muted-foreground">Easiest approval</p>
              </Card>
              <Card className="bg-card/50 border-yellow-500/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-yellow-500 text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">2</span>
                <p className="text-xs font-medium">CJ + ShareASale</p>
                <p className="text-[10px] text-muted-foreground">Major retailers</p>
              </Card>
              <Card className="bg-card/50 border-primary/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-primary text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">3</span>
                <p className="text-xs font-medium">AvantLink + Impact</p>
                <p className="text-[10px] text-muted-foreground">Powersports</p>
              </Card>
              <Card className="bg-card/50 border-purple-500/30 p-3 text-center">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-black text-sm flex items-center justify-center mx-auto mb-2 font-bold">4</span>
                <p className="text-xs font-medium">Direct Outreach</p>
                <p className="text-[10px] text-muted-foreground">Custom deals</p>
              </Card>
            </div>
          </TabsContent>

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
            
            <Card className="bg-card/50 border-border p-4">
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

          <TabsContent value="tasks">
            {tasks.length === 0 && !isLoading && (
              <Card className="bg-card border-primary/30 p-8 text-center mb-8">
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
                  <Card className="bg-card border-primary/30 p-4">
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

            {/* Tasks in 2-column bento grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => {
                const categoryTasks = getTasksByCategory(category.id);
                const completedCount = categoryTasks.filter(t => t.status === 'completed').length;
                const isExpanded = expandedCategories.includes(category.id);
                const IconComponent = category.icon;

                return (
                  <Card key={category.id} className="bg-card border-border overflow-hidden h-fit">
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
        </Tabs>
      </div>
    </div>
  );
}
