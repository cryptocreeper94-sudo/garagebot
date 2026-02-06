# ORBIT Staffing Integration Handoff Request

**From:** GarageBot (DarkWave Studios, LLC)
**To:** ORBIT Staffing Ecosystem Hub Team
**Date:** February 6, 2026
**Priority:** High - Blocking Production Launch

---

## Summary

GarageBot is ready to go live and needs the ORBIT Staffing Ecosystem Hub endpoints to be fully operational so that Mechanics Garage shop owners can use staffing, payroll, and employee management features through GarageBot. Everything is built and coded on our side - we just need ORBIT to be ready to receive our API calls.

---

## What GarageBot Does Today

GarageBot is a parts aggregator platform with a **Mechanics Garage** module that auto mechanics shops can subscribe to. When a shop subscribes, they get:

- Shop management dashboard
- Repair orders & estimates
- Customer management
- Appointment scheduling
- Inventory tracking
- QuickBooks integration
- Marketing hub

**The next step** is letting those shops also manage their employees and run payroll through ORBIT Staffing - all from within GarageBot. The shop owner shouldn't have to leave GarageBot to do any of this.

---

## What We Need From ORBIT Staffing

### 1. Confirm These API Endpoints Are Live and Accepting Requests

GarageBot is already coded to call these endpoints. We need confirmation they are active on the ORBIT hub at `https://orbitstaffing.io`:

| # | Endpoint | Method | What GarageBot Sends | What We Expect Back |
|---|----------|--------|---------------------|---------------------|
| 1 | `/api/ecosystem/status` | GET | Health check | `{ version, registered }` |
| 2 | `/api/ecosystem/sync/contractors` | POST | `{ contractors: [{ externalId, name, email, phone, skills, status }] }` | `{ synced: number, errors: [] }` |
| 3 | `/api/ecosystem/sync/workers` | POST | `{ workers: [{ id, firstName, lastName, email, status, employeeType, hireDate, hourlyRate, salary, department, position }] }` | `{ synced: number, errors: [] }` |
| 4 | `/api/ecosystem/sync/timesheets` | POST | `{ timesheets: [{ id, workerId, date, hoursWorked, overtime, notes, approved }] }` | `{ synced: number, totalHours: number }` |
| 5 | `/api/ecosystem/sync/1099` | POST | `{ year, contractors: [{ contractorId, amount, date, description }] }` | `{ synced: number, totalAmount: number }` |
| 6 | `/api/ecosystem/sync/w2` | POST | `{ year, employees: [{ workerId, payPeriodStart, payPeriodEnd, grossPay, federalWithholding, stateWithholding, socialSecurity, medicare, netPay }] }` | `{ synced: number, totalGross: number }` |
| 7 | `/api/ecosystem/sync/certifications` | POST | `{ certifications: [{ id, workerId, name, issuer, issueDate, expirationDate, certificationNumber }] }` | `{ synced: number, expiringSoon: number }` |
| 8 | `/api/ecosystem/shops/{shopId}/workers` | GET | Shop ID in URL | `Worker[]` array |
| 9 | `/api/ecosystem/shops/{shopId}/payroll` | GET | `?year=&month=` query params | `{ totalW2Gross, total1099Payments, employeeCount, contractorCount }` |
| 10 | `/api/ecosystem/logs` | GET/POST | Activity log entries | `{ logged: boolean }` or `ActivityLog[]` |
| 11 | `/api/ecosystem/snippets` | GET/POST | Code snippets for cross-app sharing | `{ id, created }` or `CodeSnippet[]` |
| 12 | `/api/financial-hub/events` | POST | `{ sourceSystem: 'garagebot', sourceAppId: 'dw_app_garagebot', eventType, grossAmount, description, metadata }` | `{ success: boolean }` |

### 2. Authentication Headers We're Sending

Every request from GarageBot includes these headers:

```
Content-Type: application/json
X-Api-Key: [ORBIT_ECOSYSTEM_API_KEY]
X-Api-Secret: [ORBIT_ECOSYSTEM_API_SECRET]
X-Timestamp: [unix timestamp]
X-Signature: [HMAC-SHA256 of request body + timestamp, signed with API secret]
X-App-Name: GarageBot
```

**We need confirmation:**
- Are our API Key and Secret active and registered on ORBIT's side?
- Is HMAC signature verification enabled? (We're computing it as `HMAC-SHA256(body + timestamp, secret)`)
- Is `GarageBot` registered as an authorized app name?

### 3. Webhook Support (ORBIT -> GarageBot)

We have a webhook endpoint ready to receive events FROM ORBIT:

- **Our webhook URL:** `https://garagebot.io/api/orbit/webhook` (or the Replit dev URL)
- **Our webhook secret:** Already configured as `GARAGEBOT_WEBHOOK_SECRET`
- **Signature verification:** We verify incoming webhooks using `HMAC-SHA256(payload, secret)`

**We need from ORBIT:**
- Register our webhook URL in the ORBIT system
- Configure which events to send us (employee updates, payroll completions, certification expirations, etc.)
- Confirm the webhook payload format

### 4. Self-Service Shop Connection Flow

When a Mechanics Garage shop owner clicks "Connect to ORBIT Staffing" in their dashboard, we need:

- **Option A (Preferred - Fully Automatic):** GarageBot calls an ORBIT endpoint to provision a new staffing account for that shop, linked to the shop owner's email. No redirect needed, no separate signup. ORBIT returns an account ID we store.

- **Option B (OAuth Flow):** ORBIT provides an OAuth authorization URL. Shop owner gets redirected, authorizes, and ORBIT redirects back to GarageBot with a token. We store the token and use it for that shop's staffing API calls.

**Please confirm which approach ORBIT supports and provide:**
- The provisioning endpoint (Option A) OR OAuth URLs (Option B)
- Any additional credentials or client IDs needed per-shop
- Whether shops get billed through GarageBot (we collect and remit) or directly by ORBIT

### 5. Payroll Processing Specifics

For shops that want to run actual payroll through ORBIT:

**We need to know:**
- Does ORBIT handle actual payroll processing (tax calculations, direct deposits, W-2 generation)?
- Or is ORBIT a record-keeping/tracking system that syncs with a payroll processor (like Gusto, ADP, etc.)?
- If ORBIT processes payroll directly, what onboarding is needed per shop? (EIN, bank account, state registrations)
- What's the per-shop cost for payroll services?
- Is there an API to initiate a payroll run, or is that done in the ORBIT dashboard?

---

## What's Already Working On Our Side

These are NOT requests - just confirmation of what GarageBot has built and tested:

| Feature | Status | Notes |
|---------|--------|-------|
| ORBIT API client (orbitEcosystem.ts) | Built & Ready | Handles all 12 endpoints above |
| DarkWave Dev Hub client (ecosystemHub.ts) | Built & Ready | HMAC-signed requests, full sync |
| Worker/contractor sync on shop creation | Built & Ready | Auto-syncs when shop owner registers |
| Timesheet sync on job completion | Built & Ready | Auto-syncs when repair order completes |
| Financial event reporting | Built & Ready | Reports subscription revenue to ORBIT |
| Webhook receiver & signature verification | Built & Ready | HMAC-SHA256 verified |
| Activity logging | Built & Ready | Logs all ecosystem actions |
| API keys configured | Done | ORBIT_ECOSYSTEM_API_KEY and SECRET are set |

---

## Environment Variables We Have Configured

| Variable | Status |
|----------|--------|
| `ORBIT_ECOSYSTEM_API_KEY` | Set |
| `ORBIT_ECOSYSTEM_API_SECRET` | Set |
| `DEV_HUB_URL` | Set |
| `GARAGEBOT_WEBHOOK_SECRET` | Set |

---

## What We Need Back (Action Items for ORBIT)

1. **Confirm all 12 API endpoints are live** and returning the expected response formats listed above
2. **Confirm our API credentials are active** and GarageBot is registered as an authorized app
3. **Register our webhook URL** and confirm which events will be sent to us
4. **Provide the shop self-service connection flow** (provisioning endpoint or OAuth details)
5. **Clarify payroll capabilities** - direct processing vs. record-keeping
6. **Provide per-shop pricing** for staffing/payroll services (so we can display it to shop owners)
7. **Provide a test/sandbox environment** if available, so we can do end-to-end testing before going live
8. **Provide any additional API documentation** for endpoints we may not have covered

---

## Timeline

GarageBot is ready to go live NOW. The ORBIT integration is the last piece blocking full launch of the Mechanics Garage staffing features. Please prioritize this handoff.

---

## Contact

**Jason - DarkWave Studios, LLC**
**App:** GarageBot (garagebot.io)
**App ID:** dw_app_garagebot
