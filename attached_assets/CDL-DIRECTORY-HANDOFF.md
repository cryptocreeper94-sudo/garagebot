# CDL & Trucking Directory — Full Handoff Document

**Source App**: GarageBot (DarkWave Studios)
**Page Route**: `/cdl-directory`
**Purpose**: Portable CDL schools & trucking companies directory with search, filters, interest/referral forms, and affiliate referral pay setup.

---

## 1. Overview

A full-featured directory page listing trucking companies and CDL training schools. Users can:
- Search and filter by company type, experience level, home time, freight type, state, and CDL training availability
- View detailed company profiles with pay, benefits, fleet info, DOT/MC numbers, safety ratings
- Submit "Express Interest" forms (lead generation for affiliate referral)
- Paginate through results (12 per page)
- Mobile responsive with slide-out filter drawer

---

## 2. Database Schema

### Table: `cdl_programs`

```sql
CREATE TABLE cdl_programs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  program_type TEXT NOT NULL,
  category TEXT DEFAULT 'trucking',
  company_type TEXT DEFAULT 'mega_carrier',
  description TEXT,
  short_description TEXT,
  requirements TEXT,
  benefits TEXT,
  pay_range TEXT,
  average_cpm TEXT,
  training_length TEXT,
  tuition_cost TEXT,
  tuition_reimbursement BOOLEAN DEFAULT false,
  sign_on_bonus TEXT,
  referral_bonus TEXT,
  location TEXT,
  headquarters TEXT,
  state TEXT,
  operating_states TEXT,
  is_nationwide BOOLEAN DEFAULT false,
  website TEXT,
  apply_url TEXT,
  phone TEXT,
  logo_url TEXT,
  freight_types TEXT,
  cdl_class_required TEXT DEFAULT 'Class A',
  experience_required TEXT DEFAULT 'none',
  home_time TEXT,
  solo_team TEXT DEFAULT 'both',
  hazmat_required BOOLEAN DEFAULT false,
  endorsements_required TEXT,
  fleet_size TEXT,
  year_founded TEXT,
  dot_number TEXT,
  mc_number TEXT,
  safety_rating TEXT,
  equipment_type TEXT,
  fuel_card_provided BOOLEAN DEFAULT false,
  health_insurance BOOLEAN DEFAULT false,
  retirement_plan BOOLEAN DEFAULT false,
  paid_time_off BOOLEAN DEFAULT false,
  pet_policy BOOLEAN DEFAULT false,
  rider_policy BOOLEAN DEFAULT false,
  tags TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_hiring BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IDX_cdl_programs_type ON cdl_programs(program_type);
CREATE INDEX IDX_cdl_programs_category ON cdl_programs(category);
CREATE INDEX IDX_cdl_programs_state ON cdl_programs(state);
CREATE INDEX IDX_cdl_programs_active ON cdl_programs(is_active);
CREATE INDEX IDX_cdl_programs_company_type ON cdl_programs(company_type);
CREATE INDEX IDX_cdl_programs_experience ON cdl_programs(experience_required);
```

### Table: `cdl_referrals` (Interest / Lead Gen Forms)

```sql
CREATE TABLE cdl_referrals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id VARCHAR NOT NULL REFERENCES cdl_programs(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  cdl_class_interest TEXT,
  experience TEXT,
  message TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IDX_cdl_referrals_program ON cdl_referrals(program_id);
CREATE INDEX IDX_cdl_referrals_user ON cdl_referrals(user_id);
CREATE INDEX IDX_cdl_referrals_status ON cdl_referrals(status);
```

---

## 3. API Endpoints

### Search & Browse

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cdl-directory/search?params` | Search with filters. Query params: `search`, `companyType`, `experienceRequired`, `homeTime`, `freightType`, `state`, `hasTraining`, `limit`, `offset`. Returns `{ results: CdlProgram[], total: number }` |
| GET | `/api/cdl-directory/categories` | Returns `{ categories, companyTypes, freightTypes, experienceLevels, homeTimeOptions }` |
| GET | `/api/cdl-directory/stats` | Returns `{ totalCompanies, totalHiring, categoryCounts, companyTypeCounts }` |
| GET | `/api/cdl-directory/states` | Returns `string[]` of active states |
| POST | `/api/cdl-directory/interest` | Submit interest form. Body: `{ programId, fullName, email, phone?, location?, cdlClassInterest?, experience?, message? }`. Rate limited: 5 per hour per IP. |

### Legacy (Break Room integration)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/break-room/cdl-programs` | Get programs with optional `state`, `category`, `type` query params |
| POST | `/api/break-room/cdl-referrals` | Submit referral. Rate limited: 3 per hour per IP. |

---

## 4. Enumerated Values / Constants

### Company Types
```typescript
const COMPANY_TYPES = [
  { value: "mega_carrier", label: "Mega Carrier" },
  { value: "large_carrier", label: "Large Carrier" },
  { value: "regional_carrier", label: "Regional Carrier" },
  { value: "ltl_carrier", label: "LTL Carrier" },
  { value: "specialized", label: "Specialized" },
  { value: "flatbed", label: "Flatbed" },
  { value: "tanker", label: "Tanker" },
  { value: "reefer", label: "Reefer" },
  { value: "intermodal", label: "Intermodal" },
  { value: "owner_operator", label: "Owner Operator" },
  { value: "cdl_school", label: "CDL School" },
  { value: "staffing", label: "Staffing" },
];
```

### Experience Levels
```typescript
const EXPERIENCE_LEVELS = [
  { value: "none", label: "No Experience" },
  { value: "recent_grad", label: "Recent Graduate" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "5_years", label: "5+ Years" },
];
```

### Home Time Options
```typescript
const HOME_TIME_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "regional", label: "Regional" },
  { value: "otr", label: "Over the Road" },
];
```

### Freight Types
```
"Dry Van", "Flatbed", "Reefer", "Tanker", "LTL", "Intermodal",
"Hazmat", "Oversized", "Auto Transport", "Dedicated", "OTR",
"Regional", "Local", "Team", "Expedited", "Moving/Household"
```

---

## 5. UI/UX Design Specification

### Theme: "Deep Space / Future Forward"
- **Background**: `#0a0a0f` (near-black)
- **Primary accent**: `#00D9FF` (electric cyan)
- **Text**: White headings, `zinc-400` body, `zinc-500` labels
- **Cards**: Glassmorphism style (`glass-card` class = semi-transparent with backdrop blur and subtle white/10 border)
- **Fonts**: `font-tech` (Rajdhani) for headings/labels, system sans-serif for body
- **Animations**: Framer Motion fade-in/slide-up on page load (staggered delays)
- **Hover effects**: Cards get `border-[#00D9FF]/40` on hover, scale slight, glow shadow
- **Buttons**: Cyan background with black text for primary actions, outline with cyan accents for secondary

### Page Layout

```
┌─────────────────────────────────────────────────┐
│ Nav Bar                                          │
├─────────────────────────────────────────────────┤
│ Hero Section                                     │
│  ┌─ Gradient bg with animated blur orbs ──────┐ │
│  │ [Truck icon] CDL & Trucking Directory pill  │ │
│  │ CDL & Trucking Company Directory (h1)       │ │
│  │ Subtitle text                               │ │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │ │
│  │ │ 51 │ │ 45 │ │  3 │ │ 38 │  Stats cards  │ │
│  │ │Comp│ │Hir │ │Schl│ │Stat│               │ │
│  │ └────┘ └────┘ └────┘ └────┘               │ │
│  └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Search Bar (full width, centered)                │
├──────────┬──────────────────────────────────────┤
│ Filters  │ Results Grid                          │
│ Sidebar  │  ┌────┐ ┌────┐ ┌────┐               │
│ (desktop)│  │Card│ │Card│ │Card│               │
│          │  └────┘ └────┘ └────┘               │
│ Company  │  ┌────┐ ┌────┐ ┌────┐               │
│ Type     │  │Card│ │Card│ │Card│               │
│ Exp Level│  └────┘ └────┘ └────┘               │
│ Home Time│                                       │
│ Freight  │  Pagination: ← 1 2 3 ... 5 →        │
│ State    │                                       │
│ Training │                                       │
│ [Clear]  │                                       │
├──────────┴──────────────────────────────────────┤
│ Footer                                           │
└─────────────────────────────────────────────────┘
```

### Mobile Layout
- Filters move to a slide-out Sheet (left side)
- Grid becomes single column
- "Filters" button with active count badge appears above results
- Search bar stays full width

### Company Card Structure

```
┌──────────────────────────────────────┐
│ [Icon] Company Name         [Hiring] │
│         Company Type Badge  [Featured]│
│                                      │
│ Short description (2 lines max)      │
│                                      │
│ 💲 $0.48-$0.68 per mile             │
│ ┌──────────────────────────────────┐ │
│ │ 💰 Sign-On Bonus: Up to $15,000 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Health] [401k] [PTO] [Pets] [Rider] │
│                                      │
│ Dry Van | Dedicated | OTR  +2        │
│                                      │
│ [Learn More]  [Express Interest]     │
└──────────────────────────────────────┘
```

### Company Detail Modal
- Larger icon + name header with badges
- Description paragraph
- Grid of stat cards: Pay Range, Avg CPM, Home Time, Experience, Fleet Size, Founded
- Sign-on bonus banner
- Requirements and Benefits sections
- Benefit badges row (Health, 401k, PTO, Pets, Rider, Fuel Card, Tuition)
- Contact info grid: Location, HQ, Phone, Website, DOT#, MC#, Safety Rating, Equipment
- Action buttons: Express Interest (primary), Apply Direct (secondary, opens external URL)

### Interest Form Modal
- Fields: Full Name*, Email*, Phone, Location, CDL Class (A/B dropdown), Experience (dropdown), Message (textarea)
- Submit button: cyan bg, black text
- Rate limited on backend (5/hour/IP)
- Success toast notification on submit

---

## 6. Affiliate Referral Pay Setup

### How It Works

The CDL Directory is designed for **affiliate lead generation**. When a user clicks "Express Interest" on a company, their info is captured in the `cdl_referrals` table. This creates a trackable lead.

### Setting Up Affiliate Referral Pay

#### Option A: Direct Company Partnerships
1. Each `cdl_programs` entry has `referral_bonus` field (e.g., "$1,500")
2. The `apply_url` field can include affiliate tracking parameters
3. When a user clicks "Apply Direct", they go to the company's site via `apply_url`
4. Modify `apply_url` to include your affiliate ID: `https://www.werner.com/drivers/apply?ref=YOUR_AFFILIATE_ID`

#### Option B: CJ Affiliate / ShareASale Integration
Many trucking companies have affiliate programs through networks:

```typescript
// Example: Add affiliate tracking to apply URLs
function getAffiliateUrl(company: CdlProgram, affiliateId: string): string {
  // CJ Affiliate deep link format
  if (company.affiliateNetwork === 'cj') {
    return `https://www.anrdoezrs.net/click-${affiliateId}-${company.cjProgramId}?url=${encodeURIComponent(company.applyUrl)}`;
  }
  // ShareASale format
  if (company.affiliateNetwork === 'shareasale') {
    return `https://shareasale.com/r.cfm?b=${company.shareasaleId}&u=${affiliateId}&m=${company.merchantId}&urllink=${encodeURIComponent(company.applyUrl)}`;
  }
  // Direct referral link
  return `${company.applyUrl}?ref=${affiliateId}`;
}
```

#### Option C: Lead-Based Revenue Model
1. Capture leads via the Interest Form
2. Forward qualified leads to trucking companies
3. Get paid per qualified lead ($25-$150 per lead depending on company)
4. Track lead status in `cdl_referrals.status`:
   - `submitted` → Lead received
   - `contacted` → Company reached out to candidate
   - `converted` → Candidate hired/enrolled
   - `paid` → Referral commission paid

#### Recommended Schema Addition for Affiliate Tracking

```sql
ALTER TABLE cdl_programs ADD COLUMN affiliate_network TEXT;
ALTER TABLE cdl_programs ADD COLUMN affiliate_program_id TEXT;
ALTER TABLE cdl_programs ADD COLUMN commission_type TEXT; -- 'per_lead', 'per_hire', 'per_click', 'rev_share'
ALTER TABLE cdl_programs ADD COLUMN commission_amount TEXT; -- '$50', '10%', etc.

ALTER TABLE cdl_referrals ADD COLUMN referral_source TEXT; -- 'garagebot', 'partner_app', etc.
ALTER TABLE cdl_referrals ADD COLUMN affiliate_click_id TEXT;
ALTER TABLE cdl_referrals ADD COLUMN conversion_status TEXT DEFAULT 'pending'; -- pending, qualified, converted, rejected
ALTER TABLE cdl_referrals ADD COLUMN commission_earned DECIMAL(10,2);
ALTER TABLE cdl_referrals ADD COLUMN commission_paid_at TIMESTAMP;
```

---

## 7. Seed Data (Sample Companies)

The directory comes pre-seeded with 51 real trucking companies and CDL schools. Here are the first 12 as a template:

```typescript
const companies = [
  {
    companyName: "Werner Enterprises",
    programType: "Carrier with CDL Training",
    category: "trucking",
    companyType: "mega_carrier",
    description: "Werner Enterprises is one of the largest truckload carriers in North America...",
    shortDescription: "One of North America's largest carriers with paid CDL training and diverse route options.",
    requirements: "Must be 21+, valid driver's license, pass DOT physical and drug screen, clean driving record",
    benefits: "Medical, dental, vision insurance, 401(k) with company match, paid vacation, rider and pet policies",
    payRange: "$0.48-$0.68 per mile",
    averageCpm: "$0.55",
    trainingLength: "3-4 weeks",
    tuitionCost: "Company-sponsored through approved schools",
    tuitionReimbursement: true,
    signOnBonus: "Up to $15,000",
    referralBonus: "$1,500",
    headquarters: "Omaha, NE",
    state: "NE",
    isNationwide: true,
    operatingStates: "All 48 contiguous states",
    website: "https://www.werner.com",
    applyUrl: "https://www.werner.com/drivers/apply",
    phone: "1-800-346-2818",
    freightTypes: "Dry Van, Dedicated, OTR, Regional, Temperature Controlled",
    cdlClassRequired: "Class A",
    experienceRequired: "none",
    homeTime: "weekly",
    soloTeam: "both",
    hazmatRequired: false,
    fleetSize: "8,000+",
    yearFounded: "1956",
    dotNumber: "89038",
    safetyRating: "Satisfactory",
    equipmentType: "Freightliner Cascadia, Peterbilt 579",
    fuelCardProvided: true,
    healthInsurance: true,
    retirementPlan: true,
    paidTimeOff: true,
    petPolicy: true,
    riderPolicy: true,
    tags: "mega carrier, CDL training, company driver, dedicated, OTR",
    isFeatured: true,
    isHiring: true,
    sortOrder: 1,
  },
  {
    companyName: "Swift Transportation",
    programType: "Carrier with CDL Academy",
    companyType: "mega_carrier",
    shortDescription: "North America's largest truckload carrier with its own CDL training academy.",
    payRange: "$0.46-$0.65 per mile",
    signOnBonus: "Up to $10,000",
    // ... (full data available in server/seeds/cdlDirectory.ts)
  },
  {
    companyName: "Schneider National",
    companyType: "mega_carrier",
    shortDescription: "Premier multimodal carrier with company-paid CDL training and modern equipment.",
    payRange: "$0.50-$0.72 per mile",
    signOnBonus: "Up to $12,000",
  },
  {
    companyName: "JB Hunt Transport Services",
    companyType: "mega_carrier",
    shortDescription: "Fortune 500 carrier with largest intermodal fleet and above-average driver pay.",
    payRange: "$0.55-$0.78 per mile",
  },
  {
    companyName: "CRST International",
    companyType: "mega_carrier",
    shortDescription: "Top team-driving carrier with fully company-paid CDL training program.",
    payRange: "$0.44-$0.60 per mile (team split)",
  },
  // ... 46 more companies including:
  // - Roehl Transport, Prime Inc., US Xpress, Covenant Transport
  // - PAM Transport, Western Express, Knight Transportation
  // - Heartland Express, Marten Transport, Old Dominion, Estes Express
  // - XPO Logistics, Saia, ABF Freight, FedEx Freight
  // - Landstar, Crete Carrier, TMC Transportation
  // - CDL Schools: 160 Driving Academy, SAGE Truck Driving Schools, Roadmaster
  // - Staffing: TransForce, Ryder System
];
```

Full seed data is in `server/seeds/cdlDirectory.ts` (2,029 lines, 51 companies).

---

## 8. Backend Service Layer

```typescript
// CDLDirectoryService class methods:

class CDLDirectoryService {
  // Search with filters, pagination, ordering (featured first, then hiring, then sort order)
  async search(filters: CDLDirectoryFilters): Promise<{ results: CdlProgram[]; total: number }>

  // Get single company by ID
  async getById(id: string): Promise<CdlProgram | null>

  // Get featured companies (limit 12)
  async getFeatured(): Promise<CdlProgram[]>

  // Get category/type counts for filters
  async getCategories(): Promise<{ category: string; count: number }[]>

  // Get aggregate stats
  async getStats(): Promise<CDLDirectoryStats>

  // Submit interest form (insert into cdl_referrals)
  async submitInterest(data: InsertCdlReferral): Promise<CdlReferral>

  // Get distinct states for filter dropdown
  async getStates(): Promise<string[]>
}
```

---

## 9. Frontend Component Structure

```
CDLDirectory (main page component)
├── Hero Section
│   ├── Gradient background with animated orbs
│   ├── Title + subtitle
│   └── Stats grid (Total Companies, Hiring, CDL Schools, States)
├── Search Bar
├── Content Area
│   ├── FilterSidebar (desktop: sticky left panel, mobile: Sheet drawer)
│   │   ├── Company Type select
│   │   ├── Experience Level select
│   │   ├── Home Time select
│   │   ├── Freight Type select
│   │   ├── State select
│   │   ├── Has CDL Training toggle
│   │   └── Clear Filters button
│   └── Results Grid (1-col mobile, 2-col tablet, 3-col desktop)
│       └── CompanyCard (repeating)
│           ├── Company icon + name + type badge
│           ├── Hiring/Featured badges
│           ├── Description (2-line clamp)
│           ├── Pay range
│           ├── Sign-on bonus banner
│           ├── Benefits pills (Health, 401k, PTO, Pets, Rider)
│           ├── Freight type tags
│           └── Action buttons (Learn More, Express Interest)
├── Pagination
├── CompanyDetailModal (full company profile)
└── InterestFormModal (lead gen form)
```

---

## 10. CSS Classes Used

These are custom classes from the GarageBot theme. Implement equivalents in your app:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
}

.glass-ultra {
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.card-3d {
  transition: transform 0.3s, box-shadow 0.3s;
}
.card-3d:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 217, 255, 0.1);
}

.font-tech {
  font-family: 'Rajdhani', sans-serif;
}
```

---

## 11. Key Source Files in GarageBot

| File | Purpose |
|------|---------|
| `client/src/pages/CDLDirectory.tsx` | Full frontend page (1,246 lines) |
| `server/services/cdlDirectory.ts` | Backend service with search, stats, interest submission |
| `server/seeds/cdlDirectory.ts` | Seed data for 51 companies (2,029 lines) |
| `server/routes.ts` | API route handlers (search lines 9870-9929) |
| `shared/schema.ts` | Database schema (cdlPrograms + cdlReferrals tables) |

---

## 12. Dependencies

### Frontend
- React 18 + TypeScript
- TanStack Query (data fetching / caching)
- Framer Motion (animations)
- Lucide React (icons)
- shadcn/ui components: Button, Card, Input, Badge, Label, Textarea, Switch, Select, Dialog, Sheet
- Tailwind CSS

### Backend
- Node.js + Express
- Drizzle ORM
- PostgreSQL (Neon)
- Zod (validation via drizzle-zod)
- crypto (for IP hashing in rate limiting)

---

## 13. Rate Limiting

Interest form submissions are rate limited per IP:
- `/api/cdl-directory/interest`: 5 submissions per hour per IP
- `/api/break-room/cdl-referrals`: 3 submissions per hour per IP
- IP is hashed with SHA-256 before storage (privacy)
- Uses in-memory Map (resets on server restart; replace with Redis for production)

---

*Document generated from GarageBot codebase — DarkWave Studios*
*Last updated: February 2026*
