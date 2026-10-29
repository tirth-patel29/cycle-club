---
name: THE ANAND CYCLING CLUB Club
colors:
  surface: '#faf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#faf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ef'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e3e3de'
  on-surface: '#1b1c19'
  on-surface-variant: '#454843'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#757872'
  outline-variant: '#c6c7c1'
  surface-tint: '#5d5f5b'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1a1c19'
  on-primary-container: '#838480'
  inverse-primary: '#c6c7c2'
  secondary: '#4b6700'
  on-secondary: '#ffffff'
  secondary-container: '#c6f26a'
  on-secondary-container: '#506e00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c17'
  on-tertiary-container: '#83857d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3e3dd'
  primary-fixed-dim: '#c6c7c2'
  on-primary-fixed: '#1a1c19'
  on-primary-fixed-variant: '#464743'
  secondary-fixed: '#c6f26a'
  secondary-fixed-dim: '#abd551'
  on-secondary-fixed: '#141f00'
  on-secondary-fixed-variant: '#374e00'
  tertiary-fixed: '#e2e3da'
  tertiary-fixed-dim: '#c6c7be'
  on-tertiary-fixed: '#1a1c17'
  on-tertiary-fixed-variant: '#454841'
  background: '#faf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e3e3de'
typography:
  display-hero:
    fontFamily: Barlow Condensed
    fontSize: 5rem
    fontWeight: '800'
    lineHeight: 4.75rem
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Barlow Condensed
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: 3.5rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.25rem
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Barlow Condensed
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: 0em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: 0.01em
  headline-sm:
    fontFamily: Barlow Condensed
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.04em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2.5rem
  margin-sm: 1rem
  margin-lg: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-performance sports-editorial aesthetic tailored for competitive cycling, curated community rides, and race registrations. It conveys discipline, velocity, and utilitarian luxury.

The visual style merges technical minimalism with the kinetic typography of European cycling culture. It avoids superficial ornament—there are no blurry glass effects, skeuomorphic bevels, or decorative drop shadows. Visual authority is achieved through razor-sharp grid structures, precise borders, ample negative space, and deliberate contrasts between heavy condensed letterforms and technical data markers.

## Colors

The palette is engineered for high legibility under direct sunlight and rapid mobile scanning during pre-race briefings and active ride sign-ups:

- **Primary (`#111310` - Deep Charcoal):** The anchor for primary display headlines, primary buttons, structural lines, and high-impact framing. Avoids pure digital black for an ink-on-matte-paper tactile finish.
- **Secondary (`#C7F36B` - Racing Lime):** The functional velocity accent. Used sparingly for interactive focal points, active metric badges, live race status pills, and crucial CTAs. Never used for long-form text or large background surfaces.
- **Tertiary (`#85877F` - Muted Slate):** Dedicated to technical metadata, stage profile captions, elevation counters, inactive states, and secondary telemetry tags.
- **Neutral (`#F5F4EF` - Velodrome Bone):** The default canvas background. Warm, non-fatiguing off-white that creates an editorial paper feel when contrasted with the crisp borders and charcoal typography.
- **Structural Borders:** Subtle, crisp 1px borders defined by `#E5E4DE` in light contexts and `#222521` in dark inverted contextual containers (such as race pass cards).

## Typography

Typography establishes an athletic and editorial hierarchy across three distinct roles:

1. **Display & Headings (Barlow Condensed):** Bold, compressed geometry evocative of European stage race jerseys, split-second course billboards, and cycling journals. Headlines use all-caps or aggressive title casing with tight negative letter-spacing for large sizes.
2. **Body & Interface Text (Hanken Grotesk):** Neutral, modern, highly legible sans-serif for long-form route dispatches, athlete bios, rules of engagement, and interface feedback.
3. **Telemetry & Data Markers (JetBrains Mono):** Precise monospaced styling for elevation gain, average wattage, segment timing, distance splits, GPS coordinates, and race bib IDs. Monospaced numerals guarantee alignment in comparative tables and stage leaderboards.

## Layout & Spacing

The layout is grounded in a disciplined 12-column fluid grid system on desktop, collapsing to 6 columns on tablet, and 2 or 4 columns on mobile:

- **Desktop (1024px+):** 12 columns, `1.5rem` gutters, and `4rem` outer margins. Content spreads with editorial cadence; race cards may occupy 4 columns (3-up per row) or full 12 columns for technical split-screens (interactive map on the left, telemetry list on the right).
- **Tablet (768px - 1023px):** 6 columns, `1.5rem` gutters, and `2.5rem` outer canvas margins.
- **Mobile (< 768px):** 2 or 4 columns, `1rem` gutters, and `1rem` outer canvas margins. Content reflows vertically into structured, stacked modules with uninterrupted horizontal separator lines.

A base-4 rhythmic module governs component spacing: tight `space-xs` and `space-sm` for inline badges and data clusters, `space-md` for internal component padding, and `space-lg` to `space-xl` for section separation.

## Elevation & Depth

This system intentionally rejects layered drop shadows, ambient blurs, and skeuomorphic surface depth. Instead, elevation and spatial hierarchy are achieved through **crisp structural outlines and architectural color blocking**:

- **Surface Tiers:** Layering is communicated via tonal switches. Surface base sits at `#F5F4EF` (Velodrome Bone); elevated cards and focal containers take pure `#FFFFFF` or invert completely to `#111310` (Deep Charcoal) for VIP tiers or nocturnal criterium cards.
- **Structural Outlines:** Every container, card, table cell, and interactive module is demarcated by a razor-thin 1px solid border (`#E5E4DE` on light surfaces, `#222521` on dark containers).
- **Hard Layering (Stickers / Floats):** If a component must physically separate from the plane (e.g., sticky race-day summary dock or elevated filter drawer), it uses a 1px solid border in `#111310` paired with an optional 2px offset solid drop (hard edge, zero blur, `#111310`), reinforcing the print/badge heritage of cycling race identification.

## Shapes

The design uses **Soft (`1`)** geometry, prioritizing architectural precision and mechanical authority over rounded softness:

- Standard components (buttons, input fields, cards, table headers) utilize a subtle `0.25rem` (4px) corner radius to soften sharp pixels without appearing casual or juvenile.
- Larger cards and dialog surfaces scale up moderately to `0.5rem` (8px).
- Pill shapes are reserved exclusively for live metric status capsules (e.g., "LIVE STAGE", "PACE CAR") and filter chips to distinguish operational states from structural frames.

## Components

### Buttons
- **Primary:** Solid `#111310` fill with `#F5F4EF` bold uppercase text (`Barlow Condensed`), `0.25rem` radius, `0.75rem 1.5rem` padding. On hover, background shifts to `#C7F36B` and text flips to `#111310` instantly (no lazy transitions).
- **Secondary:** Transparent fill with a 1px solid `#111310` border, charcoal text. On hover, inverts to solid `#111310` fill with `#F5F4EF` text.
- **Accent (Registration/Checkout):** Solid `#C7F36B` racing lime with `#111310` text for maximum kinetic urgency.

### Chips & Badges
- **Status Pills:** Compact `0.75rem` vertical height, `JetBrains Mono` 11px uppercase. Live status includes a solid `#C7F36B` dot indicator.
- **Category Filter Chips:** Subtle `#E5E4DE` 1px border on bone white. When active, fills with solid `#111310` with inverted text and a numeric route count in `#C7F36B`.

### Form Inputs
- Matte white background inside a 1px `#E5E4DE` boundary.
- Typography set in `Hanken Grotesk` regular.
- Focus state transforms border directly into 1.5px `#111310` with no soft glow rings. Error validation displays an immediate 1.5px red line accompanied by a mono warning code below the field.

### Event & Route Cards
- Defined by 1px `#E5E4DE` border on white canvas with `1.25rem` internal padding.
- Card header features condensed headline typography paired with right-aligned telemetry badges (Distance, Elevation, Category).
- Bottom edge features a structured, full-bleed 1px split border separating route metadata from registration action triggers.

### Checkboxes & Radios
- Crisp square boxes (`0.125rem` radius) with 1.5px `#111310` perimeter. Checked state delivers a solid `#111310` fill with a sharp white geometric checkmark.

### Domain-Specific Components
- **Stage Elevation Profile:** SVG wireline graph on a technical grid background with `#C7F36B` gradient stroke indicating incline severity, annotated with `JetBrains Mono` coordinates.
- **Race Bib Tag:** Monospaced rider number block styled like physical handlebar plates with punched-hole accents and black-and-lime color blocking.
- **Pace Group Meter:** Segmented step indicators reflecting ride tempo (Social / Tempo / Breakaway / Hammerfest) using filled tick-boxes.