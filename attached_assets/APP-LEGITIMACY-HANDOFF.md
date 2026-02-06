# DarkWave Studios — App Legitimacy & Credibility Handoff

**Version:** 1.0  
**Generated:** February 2026  
**From:** GarageBot (garagebot.replit.app)  
**Purpose:** Reference blueprint for all DarkWave Studios ecosystem apps to achieve Google recognition, affiliate network approval, ad network compliance, and general trust/credibility signals.

---

## Quick Reference: What GarageBot Has Implemented

| Requirement | Route / File | Status |
|---|---|---|
| Terms of Service | `/terms` | Live |
| Privacy Policy | `/privacy` | Live |
| Affiliate Disclosure (FTC) | `/affiliate-disclosure` | Live |
| About Us | `/about` | Live |
| Contact Us (with working form) | `/contact` | Live |
| Support / FAQ | `/support` | Live |
| sitemap.xml (dynamic) | `/sitemap.xml` | Live |
| robots.txt | `/robots.txt` (static) | Live |
| Structured Data (JSON-LD) | `index.html` `<script>` tag | Live |
| Open Graph Meta Tags | `index.html` `<head>` | Live |
| Twitter Card Meta Tags | `index.html` `<head>` | Live |
| Canonical URL | `index.html` `<link rel="canonical">` | Live |
| SSL / HTTPS | Replit-managed | Live |
| PWA Manifest | `/manifest.json` | Live |
| Google AdSense Integration | `index.html` script tag | Live |
| Favicon + Apple Touch Icons | `index.html` link tags | Live |
| Service Worker | `/sw.js` | Live |
| Footer w/ Legal Links | All pages via `Footer.tsx` | Live |

---

## 1. REQUIRED PAGES (Must-Have for Every App)

### 1A. Terms of Service (`/terms`)

**Purpose:** Legal agreement between user and company. Required by Google, Apple, all ad networks, and affiliate networks.

**Must include:**
- Company legal name: **DarkWave Studios, LLC**
- Acceptance of terms clause
- Description of services provided
- User responsibilities and conduct rules
- Payment terms (if applicable)
- Intellectual property rights
- Limitation of liability / warranty disclaimers
- Termination clause
- Governing law and jurisdiction
- Contact information for legal inquiries
- "Last Updated" date (keep current — update at least quarterly)

**GarageBot example sections:**
1. Acceptance of Terms
2. Platform Services (parts aggregation, AI recommendations, DIY guides)
3. User Accounts & Registration
4. Payment Terms (Pro subscription, Mechanics Garage)
5. Affiliate Links & Third-Party Products
6. User Conduct
7. Intellectual Property
8. Disclaimers & Limitation of Liability
9. Termination
10. Governing Law
11. Contact Information

---

### 1B. Privacy Policy (`/privacy`)

**Purpose:** Required by GDPR, CCPA, Google, all ad networks, and affiliate programs. Explains what data you collect and how you use it.

**Must include:**
- What information is collected (personal info, usage data, cookies)
- How information is used
- How information is shared (third parties, analytics, ads)
- Data security measures
- Cookie policy (especially if using Google AdSense or analytics)
- Advertising practices disclosure (ad networks, personalized ads)
- Affiliate link disclosure (data shared with affiliate partners)
- User rights (access, deletion, opt-out)
- Children's privacy (COPPA compliance if applicable)
- Third-party services used (list them: Stripe, Google Analytics, etc.)
- Data retention policy
- Contact info for privacy inquiries
- "Last Updated" date

**Critical for ad networks:** Must explicitly mention:
- Use of cookies for advertising
- Third-party ad serving (Google AdSense, etc.)
- How users can opt out of personalized advertising
- Link to Google's ad privacy page

---

### 1C. About Us (`/about`)

**Purpose:** Establishes legitimacy and trust. Affiliate networks and Google want to see a real company behind the site.

**Must include:**
- Company name: **DarkWave Studios, LLC**
- Mission statement / what the app does
- Company story (founding, why it exists)
- Team information (even if general — "founded by automotive enthusiasts")
- Key features and value proposition
- Business model transparency (how you make money)
- Links to other ecosystem apps (builds credibility)

---

### 1D. Contact Us (`/contact`)

**Purpose:** Required by affiliate networks and Google. Proves the business is reachable.

**Must include:**
- Working contact form (name, email, subject/category, message)
- Email address (use a professional domain email: support@[app].io)
- Business hours
- Response time expectations
- Links to Support/FAQ page
- Optional: Physical address or registered agent info

**Critical:** The form must actually work — affiliate reviewers sometimes test it.

---

### 1E. Support / FAQ (`/support`)

**Purpose:** Reduces bounce rate, improves SEO, shows Google the site provides real value.

**Must include:**
- Searchable FAQ section covering common questions
- Categories organized logically
- Contact form (can share with Contact page)
- Links to other help resources
- Clear navigation back to main app

---

### 1F. Affiliate Disclosure (`/affiliate-disclosure`)

**Purpose:** FTC compliance requirement. Mandatory if earning ANY affiliate commissions.

**Must include:**
- Clear statement that the site uses affiliate links
- Explanation that clicking links may earn a commission
- Statement that this doesn't affect the user's price
- List of affiliate networks/programs participated in
- Statement about editorial independence (recommendations aren't biased by commissions)
- FTC compliance language
- Contact info for questions about affiliate relationships

**GarageBot's affiliate networks:**
- Amazon Associates
- eBay Partner Network
- CJ Affiliate (Commission Junction)
- Impact Radius (Walmart, pending)
- Direct retailer partnerships

**Placement:** Must be linked from:
- Footer (every page)
- Any page that contains affiliate links
- Results/search pages with product links

---

## 2. SEO & TECHNICAL REQUIREMENTS

### 2A. sitemap.xml (`/sitemap.xml`)

**Purpose:** Tells Google which pages to crawl and index. Submit to Google Search Console.

**Implementation (server-side dynamic generation):**
```javascript
app.get('/sitemap.xml', (_req, res) => {
  const baseUrl = 'https://yourapp.replit.app'; // or custom domain
  const pages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/terms', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { path: '/affiliate-disclosure', priority: '0.5', changefreq: 'monthly' },
    { path: '/support', priority: '0.6', changefreq: 'monthly' },
    // Add all public-facing pages here
    // Do NOT include: /api/*, /auth/*, /checkout, /account, /dashboard
  ];
  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});
```

**Rules:**
- Include all public pages
- Exclude: API routes, auth pages, checkout/payment flows, user dashboards, WebSocket endpoints
- Set homepage priority to 1.0
- Update `changefreq` based on how often content actually changes
- Submit URL to Google Search Console after deployment

---

### 2B. robots.txt (`/robots.txt`)

**Purpose:** Tells search engines which pages NOT to crawl.

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/callback
Disallow: /checkout
Disallow: /checkout/success
Disallow: /checkout/cancel
Disallow: /account
Disallow: /dashboard
Disallow: /ws/

Sitemap: https://yourapp.replit.app/sitemap.xml
```

**Rules:**
- Block all API routes
- Block auth callback pages
- Block checkout/payment flows
- Block user account/dashboard pages
- Block WebSocket endpoints
- Always include Sitemap URL at the bottom
- Serve as static file from public directory

---

### 2C. HTML Meta Tags (`index.html <head>`)

**Every app must have in the `<head>` section:**

```html
<!-- Primary SEO -->
<title>[App Name] | [Tagline]</title>
<meta name="title" content="[App Name] | [Tagline]" />
<meta name="description" content="[150-160 char description with keywords]" />
<meta name="keywords" content="[relevant, comma, separated, keywords]" />
<meta name="author" content="[App Name]" />
<meta name="robots" content="index, follow" />
<meta name="language" content="English" />
<meta name="revisit-after" content="7 days" />
<meta name="theme-color" content="#[brand-color-hex]" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://[domain]/" />
<meta property="og:title" content="[App Name] | [Tagline]" />
<meta property="og:description" content="[Description]" />
<meta property="og:image" content="/[path-to-social-preview-image].png" />
<meta property="og:site_name" content="[App Name]" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@[twitter_handle]" />
<meta name="twitter:creator" content="@[twitter_handle]" />
<meta name="twitter:url" content="https://[domain]/" />
<meta name="twitter:title" content="[App Name] | [Tagline]" />
<meta name="twitter:description" content="[Description]" />
<meta name="twitter:image" content="/[path-to-social-preview-image].png" />

<!-- Canonical URL -->
<link rel="canonical" href="https://[domain]/" />

<!-- PWA -->
<meta name="application-name" content="[App Name]" />
<meta name="apple-mobile-web-app-title" content="[App Name]" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<link rel="manifest" href="/manifest.json" />
```

---

### 2D. Structured Data / JSON-LD (`index.html`)

**Purpose:** Rich results in Google Search. Helps Google understand what your app is.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "[App Name]",
  "url": "https://[domain]",
  "description": "[App description]",
  "applicationCategory": "[Category — ShoppingApplication, BusinessApplication, etc.]",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "DarkWave Studios, LLC"
  }
}
</script>
```

---

## 3. FOOTER REQUIREMENTS

**Every page must have a footer containing links to:**
- About
- Contact
- Support
- Terms of Service
- Privacy Policy
- Affiliate Disclosure (if applicable)

**GarageBot footer layout (two-row design):**

**Row 1 — Navigation links grouped with `|` separators:**
- About | Contact | Support | Terms | Privacy | Affiliates | Investors | Vendor Signup | Break Room | Dev Portal

**Row 2 — Copyright + Version + Ecosystem:**
- Copyright 2026 DarkWave Studios, LLC | v1.0.10 | Ecosystem links (dwsc.io, tlid.io, trustshield.tech)

---

## 4. AD NETWORK REQUIREMENTS (Google AdSense)

**To get approved and stay compliant:**

1. **Publisher ID** in `index.html`:
   ```html
   <meta name="google-adsense-account" content="ca-pub-[YOUR_ID]">
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-[YOUR_ID]" crossorigin="anonymous"></script>
   ```

2. **Privacy Policy must mention:**
   - Use of Google AdSense
   - Cookie usage for personalized advertising
   - Link to Google's ad settings page
   - How users can opt out

3. **Ad placement rules:**
   - Never on login/signup/checkout flows
   - Never covering content or navigation
   - No auto-clicking or incentivized clicking
   - Must be clearly distinguishable from content
   - Respect ad density limits (don't overload pages)

4. **Ad-free subscription option:**
   - If offering paid tier to remove ads, must have proper subscription lifecycle
   - GarageBot: $5/month ad-free tier via Stripe

---

## 5. AFFILIATE NETWORK APPROVAL CHECKLIST

**What affiliate networks look for when reviewing your application:**

- [ ] Live, functional website with real content
- [ ] SSL/HTTPS enabled
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Affiliate Disclosure page (FTC compliant)
- [ ] About Us page with company information
- [ ] Contact page with working form
- [ ] Professional design (not a template with dummy text)
- [ ] Consistent navigation and footer across all pages
- [ ] No broken links
- [ ] Real content (not placeholder/lorem ipsum)
- [ ] Clear business model explanation
- [ ] Original content (not copied from other sites)
- [ ] Multiple pages of substantive content
- [ ] Mobile-responsive design
- [ ] Reasonable page load times
- [ ] sitemap.xml submitted to Google Search Console
- [ ] robots.txt properly configured
- [ ] Google Analytics or equivalent tracking installed

**Major affiliate networks to apply to:**
| Network | URL | Commission Type |
|---|---|---|
| Amazon Associates | affiliate-program.amazon.com | 1-10% per product category |
| eBay Partner Network | partnernetwork.ebay.com | 1-4% |
| CJ Affiliate | cj.com | Varies by advertiser |
| Impact Radius | impact.com | Varies (Walmart 1-4%) |
| ShareASale | shareasale.com | Varies by merchant |
| Rakuten Advertising | rakutenadvertising.com | Varies by merchant |

---

## 6. GOOGLE SEARCH CONSOLE SETUP

**After deploying your app:**

1. Go to https://search.google.com/search-console
2. Add property → URL prefix → `https://yourapp.replit.app`
3. Verify ownership (HTML tag method works easiest with Replit)
4. Submit sitemap: `https://yourapp.replit.app/sitemap.xml`
5. Request indexing for homepage
6. Monitor Coverage report for crawl errors
7. Check Mobile Usability report

---

## 7. DARKWAVE STUDIOS ECOSYSTEM APPS

All DarkWave apps should cross-link in their footers to build domain authority:

| App | Domain | Description |
|---|---|---|
| GarageBot | garagebot.replit.app / garagebot.io | Parts aggregator |
| Trust Layer ID | tlid.io | Identity & SSO hub |
| TrustShield | trustshield.tech | Security & verification |
| ORBIT Staffing | orbitstaffing.replit.app | Payroll & staffing |
| DarkWave Studios | dwsc.io | Parent company hub |

---

## 8. COPY-PASTE PAGE TEMPLATES

### Minimal Terms of Service Template
```
Terms of Service
Last Updated: [Month Year]

1. ACCEPTANCE OF TERMS
By accessing [App Name], operated by DarkWave Studios, LLC, you agree to these Terms of Service.

2. SERVICES
[App Name] provides [description of services]. We reserve the right to modify or discontinue services at any time.

3. USER ACCOUNTS
You are responsible for maintaining the security of your account. You must provide accurate information during registration.

4. PAYMENT TERMS
[If applicable: subscription details, refund policy, billing cycle]

5. INTELLECTUAL PROPERTY
All content, branding, and technology are owned by DarkWave Studios, LLC. You may not copy, modify, or distribute our proprietary materials.

6. USER CONDUCT
You agree not to: use the service for illegal purposes, attempt to breach security, harass other users, or upload malicious content.

7. THIRD-PARTY LINKS & AFFILIATES
[App Name] may contain links to third-party websites and affiliate links. We are not responsible for third-party content or practices.

8. DISCLAIMERS
Services are provided "as is" without warranties. We do not guarantee accuracy of pricing, availability, or third-party product information.

9. LIMITATION OF LIABILITY
DarkWave Studios, LLC shall not be liable for indirect, incidental, or consequential damages arising from use of the service.

10. TERMINATION
We may terminate or suspend your account at any time for violation of these terms.

11. GOVERNING LAW
These terms are governed by the laws of the State of Tennessee, United States.

12. CONTACT
For questions: support@[app-domain] or visit our Contact page.
```

### Minimal Privacy Policy Template
```
Privacy Policy
Last Updated: [Month Year]

DarkWave Studios, LLC ("we", "us") operates [App Name]. This policy explains how we collect, use, and protect your information.

1. INFORMATION WE COLLECT
- Personal: Name, email, account credentials
- Usage: Pages visited, searches performed, features used
- Technical: IP address, browser type, device information
- Cookies: Session cookies, preference cookies, advertising cookies

2. HOW WE USE INFORMATION
- Provide and improve our services
- Process transactions and send notifications
- Personalize your experience
- Display relevant advertisements
- Comply with legal obligations

3. ADVERTISING
We use Google AdSense and affiliate partnerships to display advertisements. These services may use cookies to serve personalized ads. You can opt out at https://adssettings.google.com.

4. AFFILIATE LINKS
We participate in affiliate programs. When you click affiliate links and make purchases, we may earn commissions. See our Affiliate Disclosure for details.

5. DATA SHARING
We do not sell your personal data. We share data only with:
- Payment processors (Stripe) for transactions
- Analytics services for usage insights
- Advertising partners as described above
- Law enforcement when legally required

6. DATA SECURITY
We implement industry-standard security measures including encryption, secure sessions, and access controls.

7. YOUR RIGHTS
You may: access your data, request deletion, opt out of marketing emails, and disable cookies in your browser.

8. CHILDREN'S PRIVACY
Our services are not intended for children under 13. We do not knowingly collect data from children.

9. CHANGES
We may update this policy periodically. Continued use constitutes acceptance.

10. CONTACT
Privacy inquiries: support@[app-domain]
```

### Minimal Affiliate Disclosure Template
```
Affiliate Disclosure
Last Updated: [Month Year]

FTC COMPLIANCE
In accordance with the Federal Trade Commission's guidelines (16 CFR Part 255), [App Name] discloses the following:

[App Name] is a participant in affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to retail partners.

WHAT THIS MEANS
- Some links on [App Name] are affiliate links
- If you click an affiliate link and make a purchase, we may earn a commission
- This comes at NO additional cost to you
- Affiliate relationships do not influence our recommendations
- We recommend products based on quality and relevance, not commission rates

AFFILIATE PARTNERS
We participate in the following programs:
- [List your affiliate networks]

PRICING TRANSPARENCY
Prices displayed are sourced directly from retailers. We do not mark up prices. Any price you see on [App Name] is the same price you would find on the retailer's website.

EDITORIAL INDEPENDENCE
Our product recommendations and search results are not influenced by affiliate relationships. We prioritize accuracy and user value.

CONTACT
Questions about our affiliate relationships: support@[app-domain]
```

---

## 9. FILE STRUCTURE REFERENCE

```
your-app/
├── client/
│   ├── index.html              ← Meta tags, structured data, AdSense
│   ├── public/
│   │   ├── robots.txt          ← Search engine crawl rules
│   │   ├── manifest.json       ← PWA manifest
│   │   ├── favicon.png         ← Site icon
│   │   └── sw.js               ← Service worker (PWA)
│   └── src/
│       ├── pages/
│       │   ├── TermsOfService.tsx
│       │   ├── PrivacyPolicy.tsx
│       │   ├── AffiliateDisclosure.tsx
│       │   ├── About.tsx
│       │   ├── Contact.tsx       ← Must have working form
│       │   └── Support.tsx       ← FAQ + contact form
│       └── components/
│           └── Footer.tsx        ← Links to all legal pages
├── server/
│   └── routes.ts               ← sitemap.xml endpoint
└── attached_assets/
    └── APP-LEGITIMACY-HANDOFF.md ← This file
```

---

## 10. POST-DEPLOYMENT CHECKLIST

After deploying any DarkWave app, verify:

- [ ] All legal pages load without errors (Terms, Privacy, Affiliate, About, Contact, Support)
- [ ] Contact form actually submits successfully
- [ ] Footer appears on every page with all legal links
- [ ] `/sitemap.xml` returns valid XML
- [ ] `/robots.txt` returns correct rules
- [ ] Meta tags render correctly (test with https://metatags.io)
- [ ] Structured data validates (test with https://search.google.com/structured-data/testing-tool)
- [ ] Open Graph preview works (test by pasting URL in Slack/Discord/Twitter)
- [ ] SSL certificate active (padlock icon in browser)
- [ ] No broken links (run a link checker)
- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1440px)
- [ ] Page load under 3 seconds
- [ ] Submit sitemap to Google Search Console
- [ ] Apply to affiliate networks
- [ ] Set up Google Analytics

---

**Document created by:** GarageBot Agent  
**For:** DarkWave Studios ecosystem app agents  
**Last Updated:** February 2026  
**Company:** DarkWave Studios, LLC  
