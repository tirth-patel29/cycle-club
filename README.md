# Anand Cycling Club (ACC) • Production Platform

Production-ready cycling club and event registration platform built for **Anand Cycling Club (Anand, Gujarat, India)** using the Google Stitch THE ANAND CYCLING CLUB design system as the primary visual reference.

Built with Next.js App Router, Supabase PostgreSQL, Supabase Auth, `@supabase/ssr`, Tailwind CSS, Zod, and full server-side validation.

---

## 1. Technology Stack

- **Framework**: Next.js 16 (App Router, Server Components by default)
- **Language**: TypeScript (Strict Mode)
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth (`@supabase/ssr`)
- **Styling**: Tailwind CSS with custom glassmorphism, athletic dark mode, and high-contrast light mode
- **Typography**: Google Font *Plus Jakarta Sans*
- **Validation**: Zod (Dual-layer client UX + authoritative server-side parsing)
- **Testing**: Automated unit & integration verification runner (`scripts/run-tests.mjs`), Vitest
- **Icons**: Lucide React
- **Payments**: Isolated Demo Gateway simulator with verified atomic state transitions (Razorpay disabled)

---

## 2. Project Structure

```
├── supabase/
│   ├── migrations/
│   │   ├── 20261024000001_initial_schema.sql             # Events, registrations, payments, RLS
│   │   ├── 20261024000002_fix_rls_security_definer.sql    # Security definer helper functions
│   │   ├── 20261024000003_admin_roles_and_indexes.sql    # RBAC and search indexes
│   │   └── 20261024000004_rider_profiles_and_bicycle_types.sql # Profiles & 5 bicycle type constraints
│   └── seed.sql                                          # Initial club events and demo data
├── src/
│   ├── app/
│   │   ├── page.tsx                                      # Homepage: Hero, Manifesto, 3 Pillars, Join CTA
│   │   ├── events/                                       # Dedicated Event Catalog
│   │   │   ├── page.tsx                                  # Filterable by All, Upcoming, Past
│   │   │   └── [slug]/                                   # Event Details & Itinerary
│   │   │       └── register/                             # Authenticated & Prefilled Event Registration
│   │   ├── auth/                                         # Rider Authentication
│   │   │   ├── login/page.tsx                            # Rider Sign In with returnUrl redirect
│   │   │   ├── signup/page.tsx                           # Rider Sign Up with Bicycle Type selector
│   │   │   ├── forgot-password/page.tsx                  # Password Recovery
│   │   │   └── callback/route.ts                         # Supabase OAuth/Email callback handler
│   │   ├── profile/                                      # Rider Profile Management
│   │   │   └── page.tsx                                  # Profile Editor & Historical Digital Passes
│   │   ├── admin/                                        # Operations & Race Control
│   │   │   ├── login/page.tsx                            # Dedicated Admin Portal
│   │   │   ├── page.tsx                                  # Metrics Radar Dashboard
│   │   │   ├── events/page.tsx                           # Event Creation, Price Setting, Publishing
│   │   │   └── registrations/page.tsx                    # Searchable Participant Roster
│   │   ├── registrations/
│   │   │   ├── [reference]/                              # Official Rider Pass / Digital Bib
│   │   │   │   └── pay/                                  # Demo Payment Simulation Gateway
│   │   │   └── lookup/                                   # Public Reference Lookup
│   │   └── api/
│   │       ├── profile/route.ts                          # Authenticated Rider Profile API
│   │       ├── registrations/route.ts                    # Server-Validated Bib Allocator
│   │       ├── payments/demo/route.ts                    # Atomic Demo Payment Processor
│   │       └── admin/export-csv/route.ts                 # Sanitized Participant CSV Export
│   ├── components/
│   │   ├── events/                                       # EventCard, EventsFilterView, EventPoster
│   │   ├── layout/                                       # Navbar, Footer
│   │   └── theme/                                        # ThemeToggle (Dark/Light mode switch)
│   ├── lib/
│   │   ├── db.ts                                         # Database Service & In-Memory Fallback
│   │   ├── supabase/                                     # SSR Supabase Client & Server Helpers
│   │   ├── validations/                                  # Canonical Bicycle Types & Zod Schemas
│   │   └── constants.ts                                  # Club branding & INR formatters
│   └── types/                                            # Core TypeScript Domain Models
├── scripts/
│   ├── run-tests.mjs                                     # Production verification test runner
│   └── load-test.mjs                                     # Concurrent load simulator (500 synthetic riders)
└── README.md
```

---

## 3. Installation & Setup

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Clone & Install
```bash
git clone https://github.com/tirth-patel29/cycle-club.git
cd cycle-club
npm install
```

### Environment Configuration
Create `.env.local` using safe placeholders:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Provider Configuration
# Set to 'demo' for simulated checkout. Razorpay remains disabled in production until credentials are provided.
PAYMENT_PROVIDER=demo
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 4. Supabase Database & Migrations

The project maintains reviewed, incremental, versioned SQL migrations in `supabase/migrations/`:

| Migration File | Description |
|---|---|
| `20261024000001_initial_schema.sql` | Creates `events`, `registrations`, `payments`, `audit_logs` tables and enables RLS. |
| `20261024000002_fix_rls_security_definer.sql` | Adds security definer helper functions for safe registration lookups. |
| `20261024000003_admin_roles_and_indexes.sql` | Adds `admin_roles` RBAC table and performance indexes for lookups. |
| `20261024000004_rider_profiles_and_bicycle_types.sql` | Creates `rider_profiles` table linked to `auth.users(id)` and enforces the canonical 5 bicycle types check constraint. |

### Applying Migrations via Supabase CLI
```bash
# Link your Supabase project
npx supabase link --project-ref <your-project-id>

# Apply all migrations to remote database
npx supabase db push

# Apply seed data
npx supabase db execute --file supabase/seed.sql
```

---

## 5. Rider Authentication & Profile Behavior

### Canonical Bicycle Types
Per product requirements, exactly five canonical bicycle types are supported across the database, server validations, profile editor, and registration prefill:
1. `Road`
2. `Hybrid`
3. `MTB`
4. `City Bike`
5. `Gravel Cycle`

Enforced by database constraint:
```sql
CHECK (bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'))
```

### Profile & Event Prefill Lifecycle
- **Account Creation (`/auth/signup`)**: Rider enters name, email, password, mobile, and selects their initial bicycle type from interactive cards.
- **Permanent Profile (`/profile`)**: Riders can view and update their full name, mobile, age, gender, bicycle type, bicycle brand, model, and T-shirt size. Also lists all digital passes allocated to the rider.
- **Prefilled Event Registration (`/events/[slug]/register`)**: When an authenticated rider opens any event registration, their profile information automatically prefills.
- **Decoupled Event Overrides**: If a rider uses an MTB for a gravel ride instead of their default Road bike, the event registration records MTB as an immutable historical snapshot. The rider's permanent profile remains untouched unless they explicitly opt to save the change.

---

## 6. Registration & Payment Workflows

### Free Events (`amount_due_paise === 0`)
1. User completes prefilled form and accepts safety terms.
2. Server validates fee authoritative amount (0 paise).
3. Registration is created with `status: 'confirmed'`.
4. Stable public reference is generated (e.g. `ACC-2026-X7Y9`).
5. **No payment screen is opened and no fake payment transaction is created.**
6. The rider is redirected directly to their digital bib pass (`/registrations/[reference]`).

### Paid Events (Demo Mode)
1. Rider completes prefilled form and accepts safety terms.
2. Registration is created in `status: 'pending_payment'`.
3. Rider is directed to `/registrations/[reference]/pay`.
4. Demo payment simulates UPI or Card checkout with Success or Decline actions.
5. On **Success**: Registration updates atomically to `confirmed`, demo payment updates to `succeeded`, and rider is directed to pass with confetti.
6. On **Decline**: Registration remains `pending_payment` with option to retry. Duplicate payments are strictly prevented.

> **CRITICAL**: Razorpay remains completely disabled. No real money or bank transactions are processed.

---

## 7. Admin Console & Race Control

### Access
- Entry portal: `/admin/login`
- Protected Dashboard: `/admin`
- Initial Admin Account: `admin@anandcyclingclub.in`

### Features
- **Radar Dashboard**: Live counts for total registrations, confirmed riders, pending checkouts, and collected revenue.
- **Stage Management (`/admin/events`)**: Create new events, set distances, elevation gain, start venue, configure registration fees, mark events as free, and toggle draft/published/cancelled states.
- **Rider Roster (`/admin/registrations`)**: Search participants by name or public reference code, filter by event or status, inspect bicycle type, brand, model, and jersey size.
- **Participant CSV Export (`/api/admin/export-csv`)**: Authorized CSV export with formula injection protection (cells beginning with `=`, `+`, `-`, or `@` are safely sanitized).

---

## 8. Testing & Verification

### Running Unit & Integration Tests
```bash
npm test
```
The test suite validates:
- Indian mobile number normalization (`+91`, spaces, dashes)
- Strict validation of all 5 canonical bicycle types (`Road`, `Hybrid`, `MTB`, `City Bike`, `Gravel Cycle`)
- Rejection of invalid bicycle types at schema boundaries
- Rider profile creation and persistence
- Decoupled event bicycle overrides without modifying permanent profile
- Historical registration snapshot immutability
- Free event registration flow (instant confirmation, 0 paise, no fake payment)
- Paid event demo flow (pending -> confirmed state transition)
- Duplicate request prevention via UUID idempotency keys
- CSV formula injection protection (`=`, `+`, `-`, `@`)
- Live admin operations metrics

### Running Production Build Check
```bash
npm run build
```

### Reproducible Load Testing (500 Concurrent Riders)
Simulate high-volume concurrent traffic against the registration endpoint:
```bash
# Syntax: node scripts/load-test.mjs [concurrency] [totalRequests] [baseUrl]
node scripts/load-test.mjs 50 500 http://localhost:3000
```
Outputs total requests, throughput (req/sec), success rate, and p50/p95/p99 latency metrics.

---

## 9. Deployment Instructions (Vercel + Supabase)

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. In Vercel Dashboard, import the repository.
3. Configure the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `PAYMENT_PROVIDER=demo`
4. Deploy the application.

---

## 10. Future Razorpay Integration Steps

When the club is ready to accept live payments:
1. Obtain Razorpay Key ID and Key Secret from the Razorpay Dashboard.
2. In Vercel Environment Variables, set `PAYMENT_PROVIDER=razorpay`.
3. Provide `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
4. In `src/app/api/payments/razorpay/create-order/route.ts`, initialize the official Razorpay SDK instance.
5. Configure Razorpay Webhook endpoint (`/api/payments/razorpay/webhook`) with signature verification (`X-Razorpay-Signature`).

---

## 11. Known Limitations

- Participant photos and event flyer uploads currently utilize CDN URLs; Supabase Storage bucket `event-covers` can be provisioned for local asset hosting.
- SMS notifications via Gupshup / Twilio are designed as async webhooks and require SMS API credentials to dispatch live text messages to Indian mobile numbers.
