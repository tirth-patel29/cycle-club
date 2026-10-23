# Anand Cycling Club (ACC) • Official Event Registration Platform

Production-ready, highly accessible cycling club web application built for **Anand Cycling Club (Anand, Gujarat, India)**. Adapted from high-performance athletic editorial designs, engineered for Indian road cycling realities, and optimized for extreme legibility across all age groups (from youth riders to senior club members and enthusiast uncles).

---

## 1. Product Overview

Anand Cycling Club organizes weekend community rides, Gujarat heritage tours, and 100K/200K endurance brevets across Anand, Vallabh Vidyanagar, Karamsad, and Charotar.

### Core Capabilities:
- **Public Event Catalog & Featured Poster**: Clear route distance, elevation profile, venue reporting points, pace guidelines, and inclusions (hot breakfast, finisher medal, and backup SAG van).
- **Uncle-Friendly & Clear UX**: Clear readable typography (Plus Jakarta Sans), large friendly input targets, prominent Rupee (`₹`) pricing in paise, and helpline triggers.
- **Participant Registration Flow**: Server-side validation of 10-digit Indian mobile numbers (`+91`), age verification, gender selection, and terms acceptance.
- **Atomic Idempotency**: Prevents double submissions or duplicate records during network retries using UUID idempotency keys.
- **Simulated Demo Payment Workflow**: Dedicated testing checkout with UPI QR and Card simulators. Supports both simulated success (generating verified Rider Passes with confetti) and simulated failure (allowing safe retries).
- **Public Pass Lookup**: Direct retrieval of digital rider passes via reference code without exposing database IDs or sensitive information.
- **Admin Dashboard (`/admin`)**: Live database metrics, event management (draft, publish, cancel), participant directory with search and status management.
- **CSV Export Protection**: Prevents CSV formula injection attacks by escaping cells starting with `=`, `+`, `-`, `@`.
- **Prepared Payment Boundary**: Strict abstraction isolating the Demo provider while laying clean groundwork for future Razorpay integration.

---

## 2. Technology Stack

- **Framework**: Next.js (App Router, Server Components by default)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Typography**: Google Font *Plus Jakarta Sans* (High legibility, modern athletic editorial)
- **Database**: Supabase PostgreSQL with Versioned Migrations & Row Level Security (RLS)
- **Validation**: Zod (Client-side usability + Server-side enforcement)
- **Testing**: Vitest unit & integration tests
- **Icons**: Lucide React

---

## 3. Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/export-csv/route.ts  # Protected participant CSV export
│   │   │   ├── payments/demo/route.ts     # Atomic demo payment processor
│   │   │   └── registrations/route.ts     # Validated registration creation
│   │   ├── admin/                         # Admin Console (/admin, /admin/events, /admin/registrations)
│   │   ├── events/                        # Public Catalog & Event Detail (/events, /events/[slug])
│   │   │   └── [slug]/register/           # Registration Form
│   │   ├── registrations/
│   │   │   ├── [reference]/               # Digital Rider Pass & Confirmation
│   │   │   ├── [reference]/pay/           # Demo Payment Simulation Screen
│   │   │   └── lookup/                    # Public Reference Lookup
│   │   ├── layout.tsx                     # Root Layout with Font & Meta
│   │   ├── page.tsx                       # High-impact Public Homepage
│   │   └── globals.css                    # Tailwind CSS v4 setup
│   ├── components/
│   │   ├── events/                        # EventCard, EventPoster
│   │   └── layout/                        # Navbar, Footer
│   ├── lib/
│   │   ├── constants.ts                   # Club branding, initial events, Indian currency formatters
│   │   ├── db.ts                          # Unified data service with in-memory persistence & RLS mirror
│   │   ├── payments/boundary.ts           # Payment provider abstraction (Demo active, Razorpay stub)
│   │   ├── supabase/                      # Supabase client & server SSR helpers
│   │   └── validations/registration.ts    # Zod schemas & Indian phone normalizer
│   └── types/                             # TypeScript definitions
├── supabase/
│   ├── migrations/                        # Versioned SQL migrations
│   │   ├── 20261024000001_initial_schema.sql
│   │   ├── 20261024000002_security_policies.sql
│   │   └── 20261024000003_indexes_and_constraints.sql
│   └── seed.sql                           # Real Anand, Gujarat cycling events seed
├── tests/
│   └── unit/                              # Vitest validation & payment lifecycle tests
├── scripts/
│   └── load-test.mjs                      # Concurrency harness (50–500 virtual users)
└── .env.example                           # Safe configuration template
```

---

## 4. Getting Started

### Prerequisites:
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation:
```bash
# Clone the repository
git clone <repo-url>
cd CYCLE

# Install dependencies
npm install
```

### Environment Configuration:
Create `.env.local` using `.env.example`:
```bash
cp .env.example .env.local
```

---

## 5. Running the Application Locally

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Homepage**: `http://localhost:3000/`
- **Events Catalog**: `http://localhost:3000/events`
- **Featured Ride**: `http://localhost:3000/events/amul-heritage-city-ride-2026`
- **Registration Form**: `http://localhost:3000/events/amul-heritage-city-ride-2026/register`
- **Lookup Pass**: `http://localhost:3000/registrations/lookup`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Admin Registrations**: `http://localhost:3000/admin/registrations`

---

## 6. Running Tests

```bash
# Run unit & integration tests
npm run test
```

---

## 7. Load Testing (50 to 500 Concurrent Users)

We provide an autonomous load test script to simulate peak traffic:
```bash
# Test with 50 concurrent users
node scripts/load-test.mjs --concurrency 50 --requests 200 --url http://localhost:3000

# Scale to 500 concurrent users
node scripts/load-test.mjs --concurrency 500 --requests 1000 --url http://localhost:3000
```

---

## 8. Database Migrations Workflow (Supabase CLI)

Apply migrations to your Supabase project:
```bash
# Link project
supabase link --project-ref <your-supabase-project-ref>

# Push versioned migrations
supabase db push

# Apply seed data
supabase db reset
```

---

## 9. Demo Payment Behavior vs. Future Razorpay

- **Active Provider**: `DemoPaymentProvider`
- **Simulated Outcomes**:
  - **Success**: Atomically updates registration to `confirmed`, creates a `succeeded` payment record with a unique transaction reference, and generates the verified Rider Pass with celebratory confetti.
  - **Failure**: Records `failed` attempt, preserves registration in `pending_payment` state, and displays an immediate retry option.
- **Future Razorpay Activation**:
  1. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to server environment.
  2. Implement HMAC-SHA256 signature verification in `src/lib/payments/boundary.ts`.
  3. Register raw-body verified webhook at `/api/webhooks/razorpay`.
  4. Switch factory provider to `RazorpayPaymentProvider`.

---

## 10. Security & Privacy Highlights

- **Row Level Security (RLS)**: Public visitors can only query published events; participant records cannot be enumerated.
- **No Client Price Trust**: Fees are calculated authoritatively on the server from the database record in integer paise.
- **Idempotency Protection**: Repeated form submissions return the initial registration rather than duplicating records or charges.
- **CSV Formula Injection Sanitization**: Prepends `'` to any field starting with `=`, `+`, `-`, or `@`.
- **Zero Sensitive Credential Storage**: No UPI PINs, passwords, or bank credentials are ever captured or stored.
