# 🚴 The Anand Cycling Club (ACC)

<div align="center">

![The Anand Cycling Club](public/logo.webp)

**Gujarat's Premier Community Cycling Collective • Anand, Gujarat, India**  
*Dawn pacelines, Charotar canal routes, and endurance brevets across Anand and beyond.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-Serverless_PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Live_Payments-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![Resend](https://img.shields.io/badge/Resend-Transactional_Email-000000?style=for-the-badge&logo=resend)](https://resend.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_Editorial-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 Executive Overview

**The Anand Cycling Club** platform is a modern full-stack web application designed for organizing, managing, and scaling endurance cycling events across Gujarat, India.

Built specifically for high-concurrency race registrations (500+ riders simultaneously), the platform delivers:
- **Instant Digital Passes with QR Codes** for paperless checkpoint check-ins.
- **Rider Emergency Safety Profiles** (Blood Group, Verified Emergency Contacts, Medical/Residential Details).
- **Live Event Capacity Management** with real-time seat quota decrementing and auto-sold-out triggers.
- **Production-Grade Payment Verification** via Razorpay live checkout and timing-safe webhook reconciliation.
- **Club Operations Radar** allowing administrators to create events, monitor revenues, and export sanitized participant rosters to Excel/CSV.

---

## 🏛 System Architecture

The following diagram illustrates the complete end-to-end architecture across client, application, background services, and data layers:

```mermaid
graph TD
    subgraph ClientLayer ["1. Client & Interface Layer"]
        A1["📱 Rider Mobile View"]
        A2["💻 Desktop Event Portal"]
        A3["🛡️ Club Operations Radar"]
    end

    subgraph AppLayer ["2. Application Layer (Next.js 16 App Router)"]
        B1["SSR & Server Components"]
        B2["Zod Schema Validation Engine"]
        B3["HMAC Session Cookie Signer"]
        B4["Rate-Limiting & Security Guards"]
    end

    subgraph ServiceLayer ["3. Third-Party Integrations"]
        C1["💳 Razorpay Live Gateway"]
        C2["🔐 Razorpay Webhook Verifier (HMAC-SHA256)"]
        C3["📧 Resend Transactional Email Engine"]
    end

    subgraph DataLayer ["4. Persistence Layer (Neon Serverless PostgreSQL)"]
        D1["(Events & Capacity Quotas)"]
        D2["(Rider Profiles & Emergency Details)"]
        D3["(Registrations & Digital Bibs)"]
        D4["(Audit Logs & Payment Records)"]
    end

    ClientLayer --> AppLayer
    AppLayer --> ServiceLayer
    AppLayer --> DataLayer
    ServiceLayer -.-> AppLayer
```

---

## 🔄 End-to-End Registration & Payment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Rider as 🚴 Rider
    participant Web as 🌐 Event Detail Page
    participant API as ⚡ /api/registrations
    participant DB as 🐘 Neon PostgreSQL
    participant RZP as 💳 Razorpay Gateway
    participant WH as 🔒 /api/webhooks/razorpay
    participant Mail as 📧 Resend Email API

    Rider->>Web: Selects Event & Clicks "Register Now"
    Web->>Web: Prefills rider profile + prompts for Emergency details & Blood Group
    Rider->>API: Submits Registration (Idempotency Key + Validated Schema)
    API->>DB: Check real-time capacity quota (atomic reservation)
    alt Capacity Full
        DB-->>API: 0 spots remaining
        API-->>Web: Error: "Registration Full / Sold Out"
    else Capacity Available
        DB-->>API: Slot Reserved (status: 'pending_payment')
        API->>RZP: Create Razorpay Order (Paise amount, INR)
        RZP-->>API: Order ID (order_xxx)
        API-->>Web: Return Order ID & Launch Razorpay Modal
        Rider->>RZP: Completes UPI / Card / NetBanking Payment
        RZP-->>Web: Payment Handler Callback
        Web->>Web: Redirect to /registrations/{reference}
        RZP->>WH: Webhook event 'payment.captured' (Raw Body + Signature)
        WH->>WH: crypto.timingSafeEqual(rawHMAC, headerSignature)
        WH->>DB: Atomic Update: status -> 'confirmed', payment -> 'succeeded'
        WH->>Mail: Dispatch Digital Bib Pass + QR Code
        Mail-->>Rider: Confirmation Email Delivered
    end
```

---

## 🗄 Database Entity-Relationship Model (ERD)

```mermaid
erDiagram
    CYCLING_EVENTS ||--o{ EVENT_REGISTRATIONS : receives
    RIDER_PROFILES ||--o{ EVENT_REGISTRATIONS : creates
    EVENT_REGISTRATIONS ||--o{ PAYMENTS : settles
    CYCLING_EVENTS ||--o{ EVENT_SPONSORS : featured_in
    CYCLING_EVENTS ||--o{ EVENT_INCLUSIONS : provides

    CYCLING_EVENTS {
        uuid id PK
        string slug UK
        string title
        text description
        string cover_image_url
        string venue
        string location_description
        timestamp starts_at
        int distance_km
        int elevation_gain_m
        string difficulty
        int registration_fee_paise
        int max_capacity
        string status
        timestamp registration_closes_at
    }

    RIDER_PROFILES {
        uuid id PK
        uuid user_id UK
        string full_name
        string email
        string mobile
        string blood_group
        string emergency_contact_name
        string emergency_contact_phone
        text residential_address
        string bicycle_type
        string bicycle_brand
        string jersey_size
    }

    EVENT_REGISTRATIONS {
        uuid id PK
        uuid event_id FK
        uuid rider_id FK
        string reference_code UK
        string bib_number
        string status
        string blood_group
        string emergency_contact_name
        string emergency_contact_phone
        text residential_address
        string bicycle_type
        int amount_paid_paise
        timestamp registered_at
    }

    PAYMENTS {
        uuid id PK
        uuid registration_id FK
        string provider
        string provider_order_id
        string provider_payment_id
        int amount_paise
        string status
        timestamp created_at
    }
```

---

## ⚡ Key Feature Highlights

### 1. Rider Safety & Emergency Details
Every event registration captures and validates rider personal safety data:
- **Blood Group**: Standardized dropdown selection (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `Don't Know`).
- **Emergency Contact**: Full name and strictly validated 10-digit Indian phone number (`+91` normalization).
- **Residential Address**: Full address for medical emergency cross-verification.
- **Decoupled Bicycle Overrides**: Event-specific bicycle selection (e.g. riding an MTB on a gravel trail) preserves the rider's primary profile without silent overwriting.

### 2. Live Registration Quota Management
- Authoritative database-level quota calculation (`COUNT(*) WHERE status IN ('confirmed', 'pending_payment')`).
- Visual real-time progress bar (`LiveRegistrationProgress`) displaying spots remaining.
- Automatic **SOLD OUT** badge and UI lockout when capacity is reached.

### 3. High-Performance Editorial UI
- **Light Editorial Design**: Inspired by cycling journals (Warm Ivory `#F7F7F2`, Muted Sage `#EAEDE2`, High-Contrast Obsidian `#171914`, and Glossy Lime `#C7F36B`).
- **Next-Gen WebP Imagery**: All heavy camera assets converted to WebP with responsive breakpoints and lazy loading below the fold.
- **Balanced Desktop View**: Full-width event cover banner with a balanced two-column layout:
  - **Left Column**: Event overview, route metrics, inclusions with custom category icons, and rider safety protocols.
  - **Right Column**: Sticky registration card + clean partner sponsor cards (Kapsul Foods, R. K. & Sons, Varni Holidays).

### 4. Enterprise-Grade Security Architecture
- **Timing-Safe Cryptography**: Password validation and webhook HMAC checks use `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- **Fail-Closed Production Mode**: Missing production secrets (`SESSION_SECRET`, `ADMIN_PASSWORD`) fail closed securely with HTTP 503 instead of falling back to default credentials.
- **Session Cookie HMAC Signing**: Admin and rider sessions are cryptographically signed with SHA-256 HMAC and delivered via `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Excel Formula Injection Defense**: CSV exports escape potentially dangerous prefixes (`=`, `+`, `-`, `@`) with prepended single quotes.

---

## 🛠 Tech Stack & Dependencies

| Category | Technology |
|---|---|
| **Framework** | Next.js 16.4.3 (App Router, Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) |
| **Authentication** | Neon Auth / Supabase Auth (`@supabase/ssr`) + HMAC Session Cookies |
| **Payments** | Razorpay Live Gateway + HMAC-SHA256 Webhooks |
| **Transactional Email** | Resend API (`resend`) |
| **Image Processing** | Sharp (WebP conversion & Favicon generation) |
| **Styling** | Tailwind CSS with custom glassmorphism & Plus Jakarta Sans typography |
| **Icons** | Lucide React |
| **Validation** | Zod (Authoritative dual-layer client + server schema validation) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`

### 2. Clone and Install
```bash
git clone https://github.com/tirth-patel29/cycle-club.git
cd cycle-club
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:

```env
# ==========================================
# DATABASE (Neon Serverless PostgreSQL)
# ==========================================
DATABASE_URL=postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require

# ==========================================
# ADMIN AUTHENTICATION & SESSIONS
# ==========================================
ADMIN_PASSWORD=your_secure_master_password
ADMIN_EMAILS=admin@anandcyclingclub.in,tirthhpatel29@gmail.com
SESSION_SECRET=369fa5dd657ff4f89561a8f13af6e4d7395f4834d04a7354eddaeb2e02b8a204

# ==========================================
# PAYMENTS (Razorpay)
# ==========================================
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# ==========================================
# EMAIL (Resend)
# ==========================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 Verification & Automated Testing

The repository includes a comprehensive 28-scenario test suite verifying end-to-end functionality:

```bash
# Run complete test suite (Unit, Integration, Security, and Auth)
npm test

# Run Next.js production build check with Turbopack
npm run build

# Run TypeScript static analysis
npx tsc --noEmit
```

### Test Suite Coverage
- **Suite 1**: Indian Mobile Normalization (`+91`, leading zeros, dashes).
- **Suite 2**: Canonical 5 Bicycle Types Enforcement (`Road`, `Hybrid`, `MTB`, `City Bike`, `Gravel Cycle`).
- **Suite 3**: Rider Profile Lifecycle & Decoupled Event Overrides.
- **Suite 4**: Free Event Instant Confirmation (₹0 / 0 paise).
- **Suite 5**: Paid Event Idempotency & State Transitions.
- **Suite 6**: CSV Export Security & Formula Injection Defense (`=`, `+`, `-`, `@`).
- **Suite 7**: Live Admin Operations Metrics Calculation.
- **Suite 8**: Rider Safety & Blood Group Schema Validation.
- **Suite 9**: Real-Time Event Capacity Quota Boundaries.
- **Suite 10**: Pre-Launch Security Remediations (Fail-Closed secrets & Webhook signatures).
- **Suite 11**: Admin Authentication Lifecycle (Plaintext + SHA-256 matching, rate limiting).

---

## 🚢 Production Deployment (Vercel)

1. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository in **Vercel**.
3. Add the required Environment Variables in **Project Settings &rarr; Environment Variables**.
4. Deploy the application.
5. After updating any environment variable in Vercel, trigger a **Redeploy** to ensure serverless functions receive the updated values.

---

## 🚴 Community & Contact

- **Club**: The Anand Cycling Club (ACC)
- **Location**: Anand, Gujarat, India (Meeting point: R. K. & Sons Cycle Shop)
- **Helpline**: `+91 70430 66800`
- **Facebook**: [facebook.com/anandcycling](https://www.facebook.com/anandcycling/)
- **Instagram**: [@anandcyclingclub](https://www.instagram.com/anandcyclingclub/)

---

<div align="center">
  <sub>Built with pride for the cycling community of Anand & Gujarat. Ride Beyond the Ordinary.</sub>
</div>
