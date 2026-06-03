---
type: Page
title: Soundgrid UI/UX Spec
aliases: null
description: null
icon: null
createdAt: '2026-02-24T16:13:24.438Z'
creationDate: 2026-02-24 10:13
modificationDate: 2026-02-24 10:13
tags: []
coverImage: null
---

# SoundGrid — UX/UI Design Specification v1

**Prepared:** February 24, 2026
**Author:** Phoenix "Pixel" Park — Lead UX/UI Designer
**Status:** APPROVED — Design Reference for Engineering
**Version:** 1.0

---

## Table of Contents

1. Design Philosophy (#1-design-philosophy)

2. Design System — Foundations (#2-design-system--foundations)

3. Component Library (#3-component-library)

4. Navigation & Global Shell (#4-navigation--global-shell)

5. Onboarding & Authentication Flows (#5-onboarding--authentication-flows)

6. Dashboard — Home (#6-dashboard--home)

7. ContractGrid — UX Flows (#7-contractgrid--ux-flows)

8. SyncGrid — UX Flows (#8-syncgrid--ux-flows)

9. LiveGrid — UX Flows (#9-livegrid--ux-flows)

10. Profile & Catalog (#10-profile--catalog)

11. Settings & Billing (#11-settings--billing)

12. Responsive Design (#12-responsive-design)

13. Accessibility (#13-accessibility)

14. Motion & Animation (#14-motion--animation)

15. Empty States & Error Handling (#15-empty-states--error-handling)

---

## 1. Design Philosophy

### 1.1 Core Design Principles

**1. Professional Confidence**
SoundGrid users are working music professionals — not hobbyists. The UI must convey authority, precision, and trust. Every screen communicates: *this is a serious tool for serious work.* No cartoon mascots, no overly playful copy. Clean, capable, credible.

**2. Workflow Momentum**
The product's job is to move work forward. UI friction kills deals. Every screen has a single clear primary action. Forms are short. Steps are numbered. Progress is always visible. The user should never wonder "what do I do next?"

**3. Escrow as Trust Signal**
The escrow badge and payment status are always visible when relevant. Green "Funds Secured" indicators, clear payment timelines, and audit trail access are design elements — not just features. Trust is communicated visually.

**4. Creator-Grade Aesthetics**
Music professionals have high visual taste. The UI must earn respect from people who make album art and stage productions. Dark mode is the primary theme. Typography is editorial. Iconography is precise. The product should feel like it was designed by someone who understands the music world.

**5. Progressive Disclosure**
ContractGrid has complex legal content. SyncGrid has metadata-dense catalog views. Present the minimum required information first; reveal complexity on demand. Advanced options behind expandable sections. Tooltips for legal terms. Never overwhelm.

### 1.2 Design Tone

- **Voice:** Direct, professional, empowering. Never condescending.

- **Microcopy:** Action-oriented. "Create Contract" not "Make a New Contract." "Release Payment" not "Click here to send money."

- **Error messages:** Specific and actionable. "Royalty percentages must total 100% — currently at 85%" not "Invalid input."

- **Empty states:** Inspiring, not apologetic. Show what's possible, not what's missing.

---

## 2. Design System — Foundations

### 2.1 Color System

#### Primary Palette

```text
--color-brand-primary:     #6C63FF   /* Electric indigo — primary actions, CTAs */
--color-brand-secondary:   #00D4AA   /* Teal mint — success states, escrow confirmed */
--color-brand-accent:      #FF6B6B   /* Coral — alerts, overdue, urgent */
```

#### Neutral Palette (Dark Mode Primary)

```text
--color-bg-base:           #0F0F13   /* Near-black — page background */
--color-bg-surface:        #1A1A24   /* Dark surface — cards, panels */
--color-bg-elevated:       #242434   /* Elevated surface — modals, dropdowns */
--color-bg-hover:          #2E2E42   /* Hover state on interactive elements */
--color-border-subtle:     #2A2A3D   /* Subtle dividers */
--color-border-default:    #3D3D56   /* Default borders */
--color-border-strong:     #5A5A78   /* Strong borders, focus rings */
```

#### Text Palette

```text
--color-text-primary:      #F0F0F8   /* Primary text — headings, labels */
--color-text-secondary:    #A0A0BC   /* Secondary text — descriptions, metadata */
--color-text-tertiary:     #6B6B88   /* Tertiary — placeholders, disabled */
--color-text-inverse:      #0F0F13   /* On light backgrounds */
--color-text-link:         #6C63FF   /* Links */
--color-text-link-hover:   #8B85FF   /* Link hover */
```

#### Semantic Colors

```text
--color-success:           #00D4AA   /* Signed, paid, confirmed */
--color-success-bg:        #00D4AA1A /* Success background tint */
--color-warning:           #FFB547   /* Pending, expiring soon */
--color-warning-bg:        #FFB5471A /* Warning background tint */
--color-error:             #FF6B6B   /* Overdue, failed, rejected */
--color-error-bg:          #FF6B6B1A /* Error background tint */
--color-info:              #4DA6FF   /* Informational, neutral notices */
--color-info-bg:           #4DA6FF1A /* Info background tint */
```

#### Light Mode (Secondary Theme — V2)

```text
--color-bg-base-light:     #F8F8FC
--color-bg-surface-light:  #FFFFFF
--color-text-primary-light:#12121F
--color-text-secondary-light:#5A5A78
```

### 2.2 Typography

**Font Stack:**

- **Display / Headings:** "Inter" (Variable) — clean, professional, excellent at all weights

- **Body:** "Inter" — consistent stack, excellent readability

- **Monospace (contract clauses, code):** "JetBrains Mono" — readable legal text, technical fields

- **Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Type Scale:**

```text
--text-xs:    11px / 16px line-height  / weight 400  — Labels, badges
--text-sm:    13px / 20px line-height  / weight 400  — Secondary text, metadata
--text-base:  15px / 24px line-height  / weight 400  — Body text
--text-md:    17px / 26px line-height  / weight 500  — Emphasized body
--text-lg:    20px / 30px line-height  / weight 600  — Section headers
--text-xl:    24px / 34px line-height  / weight 700  — Page titles
--text-2xl:   30px / 40px line-height  / weight 700  — Hero headings
--text-3xl:   38px / 48px line-height  / weight 800  — Display headings
```

**Contract Text (Legal Content):**

```text
Font:        JetBrains Mono
Size:        14px / 24px line-height
Weight:      400 (regular clauses) / 600 (headings within contract)
Color:       --color-text-primary
Background:  --color-bg-surface (slightly offset from page bg)
```

### 2.3 Spacing System

**Base unit: 4px**

```text
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

**Layout Grid:**

- Desktop: 12-column grid, 24px gutters, 80px side margins (max-width: 1440px)

- Tablet: 8-column grid, 20px gutters, 40px side margins

- Mobile: 4-column grid, 16px gutters, 16px side margins

### 2.4 Border Radius

```text
--radius-sm:   4px   — Badges, tags, small elements
--radius-md:   8px   — Inputs, buttons, small cards
--radius-lg:   12px  — Cards, panels
--radius-xl:   16px  — Modals, large cards
--radius-2xl:  24px  — Feature cards, hero elements
--radius-full: 9999px — Pills, avatars
```

### 2.5 Elevation & Shadows

```text
--shadow-sm:   0 1px 3px rgba(0,0,0,0.4)    — Subtle lift (inputs, small cards)
--shadow-md:   0 4px 12px rgba(0,0,0,0.5)   — Cards, panels
--shadow-lg:   0 8px 24px rgba(0,0,0,0.6)   — Modals, overlays
--shadow-xl:   0 16px 48px rgba(0,0,0,0.7)  — Floating elements, drawers
--shadow-brand: 0 0 20px rgba(108,99,255,0.3) — Brand glow (CTAs, active states)
```

### 2.6 Iconography

- **Library:** Phosphor Icons (consistent weight, 672 icons, React component)

- **Default weight:** Regular (24px default, 20px compact, 16px inline)

- **Active/selected:** Bold weight variant

- **Custom icons:** Music-specific icons (waveform, vinyl, microphone, contract scroll) — custom SVG set

---

## 3. Component Library

### 3.1 Buttons

**Variants:**

```text
Primary    — bg: --color-brand-primary, text: white, hover: +10% brightness
Secondary  — bg: transparent, border: --color-border-default, text: --color-text-primary
Destructive — bg: --color-error, text: white
Ghost      — bg: transparent, text: --color-brand-primary, no border
Link       — text: --color-text-link, underline on hover
```

**Sizes:**

```text
sm:  height 32px, padding 0 12px, text-sm, radius-md
md:  height 40px, padding 0 16px, text-base, radius-md  [default]
lg:  height 48px, padding 0 24px, text-md, radius-lg
xl:  height 56px, padding 0 32px, text-lg, radius-lg
```

**States:** Default → Hover → Focus (2px brand ring) → Active → Loading (spinner) → Disabled

**Loading state:** Inline spinner replaces label; button width locked (no layout shift)

### 3.2 Form Inputs

```text
Input Field:
  Background:  --color-bg-elevated
  Border:      1px solid --color-border-default
  Focus:       1px solid --color-brand-primary + --shadow-brand glow
  Error:       1px solid --color-error + error message below
  Placeholder: --color-text-tertiary
  Height:      44px (default), 36px (compact)
  Radius:      --radius-md
  Padding:     0 14px
Textarea:
  Same as Input + min-height 120px, resize: vertical
  Used for: contract clause free-text, message fields
Select / Dropdown:
  Same as Input + chevron icon right-aligned
  Custom dropdown panel: --color-bg-elevated, --shadow-lg
  Options: 44px height, hover: --color-bg-hover
Checkbox:
  16px × 16px, radius-sm
  Unchecked: --color-border-default border
  Checked: --color-brand-primary fill + white checkmark
  Intermediate: --color-brand-primary fill + white dash
Toggle Switch:
  Width: 44px, Height: 24px
  Off: --color-border-default track
  On: --color-brand-primary track
  Knob transitions: 200ms ease
```

### 3.3 Cards

```text
Base Card:
  Background:  --color-bg-surface
  Border:      1px solid --color-border-subtle
  Radius:      --radius-lg
  Shadow:      --shadow-md
  Padding:     --space-6
Interactive Card (clickable):
  Hover: border-color → --color-brand-primary (40% opacity)
         background → --color-bg-elevated
         translateY(-2px) + --shadow-lg
  Transition: 200ms ease
Contract Card:
  Left border accent: 4px solid (color varies by status)
    DRAFT:    --color-text-tertiary
    PENDING:  --color-warning
    SIGNED:   --color-success
    OVERDUE:  --color-error
  Contains: contract title, parties, type badge, status badge, date, actions
Status Badge:
  Pill shape (--radius-full)
  Height: 22px, padding: 0 10px, text-xs
  Background: semantic color at 15% opacity
  Text: semantic color (full)
```

### 3.4 Data Display

```text
Stats Card (Dashboard):
  Large number (--text-2xl, --color-text-primary)
  Label (--text-sm, --color-text-secondary)
  Trend indicator (arrow + %, green/red)
  Mini sparkline chart (optional)
Progress Bar:
  Track: --color-bg-elevated, height 6px, --radius-full
  Fill: --color-brand-primary (default), semantic color variants
  Animated fill on mount: 600ms ease-out
Table:
  Header: --color-bg-elevated, text-sm uppercase, --color-text-tertiary
  Row: 52px height, border-bottom: --color-border-subtle
  Hover row: --color-bg-hover
  Sticky header on scroll
Timeline (Contract Status):
  Vertical line: --color-border-default
  Completed step: --color-brand-secondary circle + checkmark
  Current step: --color-brand-primary circle (pulsing ring animation)
  Pending step: --color-border-default circle
```

### 3.5 Modals & Overlays

```text
Modal:
  Backdrop: rgba(0,0,0,0.75) blur(4px)
  Container: --color-bg-elevated, --radius-xl, --shadow-xl
  Width: 480px (sm), 640px (md), 800px (lg), 1000px (xl)
  Max-height: 90vh, overflow-y: auto
  Header: title + close button
  Footer: action buttons (right-aligned)
  Entry animation: scale(0.95) + opacity 0 → 300ms ease
Drawer (Side Panel):
  Width: 480px (desktop), 100vw (mobile)
  Position: right edge
  Used for: contract preview, negotiation thread, venue detail
  Entry: translateX(100%) → 350ms ease
Toast Notifications:
  Position: bottom-right, 16px from edges
  Width: 360px max
  Stacking: max 3 visible, older push up
  Auto-dismiss: 4 seconds (success/info), persistent (error)
  Variants: success (teal), warning (amber), error (coral), info (blue)
```

### 3.6 Contract-Specific Components

```text
Clause Block:
  Background: --color-bg-elevated
  Left border: 3px solid --color-border-subtle
  Padding: --space-4 --space-5
  Header: clause label (text-sm, uppercase, tertiary) + tooltip icon
  Content: JetBrains Mono, 14px
  Edit mode: border-color → --color-brand-primary
  AI flag: amber left border + "AI Review Suggested" banner
Redline Highlight:
  Addition: background #00D4AA26, text --color-success
  Deletion: background #FF6B6B26, text --color-error, text-decoration: line-through
  Unchanged: default text
Signature Field:
  Dashed border: --color-brand-primary
  Height: 60px
  Signed state: signature image + timestamp overlay
  Pending: "Awaiting [Name]'s signature" + reminder button
Escrow Status Banner:
  Full-width banner below contract header
  States:
    Pending funding:   amber background, "Payment not yet funded"
    Funds secured:     teal background, "Funds secured in escrow: $X,XXX"
    Payment released:  success background, "Payment of $X,XXX released"
    Disputed:          error background, "Payment disputed — under review"
```

---

## 4. Navigation & Global Shell

### 4.1 Layout Structure

```text
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR (64px)                                              │
│  [Logo]  [Pillar Tabs: Contract | Sync | Live]  [Notif] [Av]│
├──────────┬──────────────────────────────────────────────────┤
│          │                                                    │
│  SIDEBAR │  MAIN CONTENT AREA                                │
│  (240px) │  (fluid, max-width 1200px centered)               │
│          │                                                    │
│  Nav     │                                                    │
│  Items   │                                                    │
│          │                                                    │
│  ────    │                                                    │
│  Upgrade │                                                    │
│  Card    │                                                    │
│  (free   │                                                    │
│  users)  │                                                    │
└──────────┴──────────────────────────────────────────────────┘
```

### 4.2 Top Bar

- **Left:** SoundGrid wordmark + logo mark (SVG, links to Dashboard)

- **Center:** Pillar switcher tabs — "ContractGrid" | "SyncGrid" | "LiveGrid" (pill tabs, active = brand fill)

- **Right:** Notification bell (unread count badge) → Notification drawer | Avatar → Profile dropdown

**Profile Dropdown:**

```text
[Avatar + Name + Tier badge]
─────────────────────
My Profile
Account Settings
Billing & Subscription
Team Management (Collective+)
─────────────────────
Help & Support
Keyboard Shortcuts
─────────────────────
Sign Out
```

### 4.3 Sidebar Navigation

**ContractGrid context:**

```text
[+] Create Contract          ← Persistent CTA
────────────────────
Dashboard
My Contracts
  ↳ Active (12)
  ↳ Drafts (3)
  ↳ Completed (47)
  ↳ Disputed (1)
Templates
Negotiations (2)             ← Badge: unread count
Royalty Tracker
Payments & Escrow
```

**SyncGrid context:**

```text
[+] Submit Music             ← Persistent CTA
────────────────────
My Catalog
  ↳ Sync Ready (24)
  ↳ Needs Metadata (8)
Opportunities
  ↳ Open (15)
  ↳ Applied (6)
My Deals
Placement History
```

**LiveGrid context:**

```text
[+] Plan Tour                ← Persistent CTA
────────────────────
Tour Planner
Venue Discovery
My Bookings
  ↳ Upcoming (3)
  ↳ Completed (12)
Performance Agreements
Live Revenue
```

**Upgrade card (Free/Creator users):**

```text
┌────────────────────┐
│ ⚡ Upgrade to Pro  │
│ Unlock unlimited   │
│ contracts + sync   │
│ [Upgrade Now]      │
└────────────────────┘
```

### 4.4 Breadcrumb

- Present on all sub-pages: `ContractGrid > My Contracts > Producer Agreement — Jasmine × Marcus`

- Last item is current page (not linked)

---

## 5. Onboarding & Authentication Flows

### 5.1 Registration Flow

**Screen 1 — Sign Up:**

```text
[SoundGrid Logo — centered]
"Start protecting your music"
[Google Sign Up]    [Apple Sign Up]
────── or ──────
[Full Name input]
[Email input]
[Password input] + show/hide toggle
[Create Account →]
Already have an account? Sign In
Terms of Service | Privacy Policy
```

**Screen 2 — Role Selection (post-registration):**

```text
"How do you use SoundGrid?"
Subtitle: "We'll personalize your experience"
[Artist Card]           [Producer Card]
  Mic icon               Mixer icon
  "I release music"      "I create beats &
                          productions"
[Music Supervisor]      [Venue Operator]
  Film icon               Building icon
  "I license music       "I book artists
   for projects"          for shows"
[Manager / Publisher]
  Briefcase icon
  "I manage artists
   or a catalog"
[Continue →]  "You can change this later"
```

**Screen 3 — Profile Setup:**

```text
"Set up your profile"
[Avatar upload circle — click to upload]
[Display Name — pre-filled from registration]
[Location — city, state (optional)]
[Primary Genre — dropdown]
[Website / Social Link — optional]
[Complete Profile →]   [Skip for now]
```

**Screen 4 — Welcome + First Action Prompt:**

```text
[Animated checkmark]
"You're all set, [Name]!"
"What do you want to do first?"
[Create your first contract →]   [Explore the platform →]
```

### 5.2 Login Flow

```text
[SoundGrid Logo]
"Welcome back"
[Google]  [Apple]
────── or ──────
[Email]
[Password] + [Forgot password?]
[Sign In →]
2FA Screen (if enrolled):
"Enter your 6-digit code"
[_ _ _ _ _ _]  ← Auto-focus, auto-advance
[Use backup code]
```

### 5.3 Identity Verification Flow (Pre-Payout)

**Triggered when user first attempts to receive payment:**

```text
Screen 1 — Prompt:
[Shield icon]
"Verify your identity to receive payments"
"Required by financial regulations to protect
 all parties on SoundGrid."
[Verify Identity →]   [Learn more]
Screen 2 — Stripe Identity (embedded/redirect):
  Stripe Identity SDK handles:
  - Document type selection (passport/driver's license/ID)
  - Document capture (camera or upload)
  - Selfie capture
  - Review and confirm
Screen 3 — Success:
[Verified badge animation]
"Identity verified"
"You can now receive payments through SoundGrid"
[Go to Dashboard →]
```

---

## 6. Dashboard — Home

### 6.1 Layout

```text
┌──────────────────────────────────────────────────────────┐
│  Good morning, Marcus.            [+ Create Contract]     │
│  Tuesday, February 24, 2026                               │
├──────────────────────────────────────────────────────────┤
│  PENDING ACTIONS (urgent first)                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ ⚠ OVERDUE  "Jasmine × Marcus — Split Sheet"         │ │
│  │   Awaiting Jasmine's signature · 3 days overdue     │ │
│  │   [Send Reminder]  [View Contract]                   │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ 🔔 TODAY   "TerriVenue — Performance Agreement"     │ │
│  │   Your signature required                           │ │
│  │   [Sign Now]                                        │ │
│  └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  STATS ROW                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ $4,850   │ │   12     │ │   3      │ │   6      │   │
│  │ In Escrow│ │ Active   │ │ Pending  │ │ Completed│   │
│  │          │ │ Contracts│ │ Signature│ │ This Mo. │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├──────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                  QUICK ACTIONS          │
│  ┌──────────────────────────┐    ┌────────────────────┐ │
│  │ ✓ Contract signed        │    │ [+ New Contract]    │ │
│  │   Producer Agmt · 2h ago │    │ [+ Invite Collab]  │ │
│  ├──────────────────────────┤    │ [+ Submit to Sync] │ │
│  │ 💰 $1,500 released       │    │ [+ Book a Venue]   │ │
│  │   Beat License · 1d ago  │    └────────────────────┘ │
│  ├──────────────────────────┤                           │
│  │ 📝 Contract drafted      │    ESCROW BALANCE         │
│  │   Sync License · 2d ago  │    ┌────────────────────┐ │
│  └──────────────────────────┘    │ $4,850 pending     │ │
│                                  │ $12,400 received   │ │
│                                  │   this month       │ │
│                                  │ [View All]         │ │
│                                  └────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Pending Actions Design Rules

- Sort: OVERDUE (red) → DUE TODAY (amber) → THIS WEEK (default) → UPCOMING

- Max 5 actions shown; "See all X actions" link if more

- Each action: icon (status color) + contract title + what's needed + primary CTA button

- Overdue actions pulse subtly (CSS animation, 3s period, subtle)

---

## 7. ContractGrid — UX Flows

### 7.1 Contract List View

```text
┌──────────────────────────────────────────────────────────┐
│  My Contracts                    [+ Create Contract]      │
│                                                           │
│  [All ▾] [Active] [Drafts] [Completed] [Disputed]        │
│  [Search contracts...]          [Filter ▾] [Sort ▾]      │
├──────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐   │
│  │ ■ SIGNED  Producer Agreement                      │   │
│  │   With: Jasmine Carter    Created: Feb 20, 2026   │   │
│  │   $2,500 advance · 3% royalty · Escrow: FUNDED    │   │
│  │                      [View] [Download] [...]      │   │
│  ├───────────────────────────────────────────────────┤   │
│  │ ■ PENDING  Split Sheet                            │   │
│  │   With: DJ Kilo          Created: Feb 22, 2026    │   │
│  │   Awaiting 1 signature                            │   │
│  │                      [View] [Remind] [...]        │   │
│  ├───────────────────────────────────────────────────┤   │
│  │ ■ DRAFT   Beat License                            │   │
│  │   Incomplete · Last edited 1h ago                 │   │
│  │                      [Continue] [Delete]          │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Contract Creation Wizard

**Step Indicator (persistent top bar within wizard):**

```text
[1 Type] ──── [2 Parties] ──── [3 Terms] ──── [4 Payment] ──── [5 Review] ──── [6 Send]
  ●              ○               ○               ○               ○               ○
```

**Step 1 — Contract Type:**

```text
"What type of agreement do you need?"
[Producer Agreement]     [Split Sheet]
  Royalties + advance      Writing credits
[Sync License]           [Performance Agreement]
  TV, film, ad use         Live show booking
[Beat License]           [Featured Artist]
  Sell or license beats    Feature collaboration
[Management Agreement]   [Collaboration Agreement]
  Artist-manager           Co-write / co-produce
[Back]                                    [Next →]
```

*Each card: icon (60px), title, 1-line description. 2×4 grid. Hover: brand border.*

**Step 2 — Parties:**

```text
"Who is this agreement between?"
PARTY 1 (You)
  [Marcus Johnson]  [Producer]  ← pre-filled from profile
  [Edit]
PARTY 2
  [Search SoundGrid users...]
  ← Type name/email → autocomplete from collaborators list
  ← Or: [Invite by email] (guest signing)
  [+ Add Party 3]  ← up to 6 parties
[Back]                                    [Next →]
```

**Step 3 — Terms (Producer Agreement example):**

```text
"Define the terms"
PRODUCTION CREDIT                          [?]
  [Marcus Johnson]  will receive credit as
  ○ Producer  ● Executive Producer  ○ Co-Producer
ROYALTY SPLIT                              [?]
  Producer royalty: [  3  ]%
  ← Remaining: 97% available to artist
ADVANCE PAYMENT                            [?]
  ● Yes, include advance
  Amount: $[ 2,500 ]
  Payment timing: ● On signature  ○ On release  ○ Custom date
EXCLUSIVITY                                [?]
  ● Exclusive to this artist
  ○ Non-exclusive (I can sell to others)
TERRITORY                                  [?]
  ● Worldwide
  ○ Specific territories [+ Add]
──────────────────────────────────────────────
ADDITIONAL CLAUSES                     [expand]
  [+ Add custom clause]
AI SUGGESTIONS                         [expand]
  ⚡ "Consider adding a reversion clause if
     the song is not released within 18 months"
  [+ Add this clause]
[Back]                                    [Next →]
```

**Step 4 — Payment & Escrow:**

```text
"Set up payment protection"
                    ┌──────────────────────────┐
                    │  🔒 Escrow Protection    │
                    │  Your payment is held    │
                    │  securely until the      │
                    │  contract is signed      │
                    └──────────────────────────┘
PAYMENT AMOUNT
  $2,500.00 advance
PAYMENT TRIGGER
  ● Release when all parties sign
  ○ Release on specific date: [Feb 28, 2026]
  ○ Manual release (I'll confirm when to pay)
WHO PAYS
  ● Jasmine Carter pays Marcus Johnson
  ○ Marcus Johnson pays Jasmine Carter
SPLIT PAYMENT (if multiple recipients)
  [+ Add recipient]
PLATFORM FEE
  2.5% of $2,500 = $62.50
  Paid by: payer
  Total charge to payer: $2,562.50
[Back]                                    [Next →]
```

**Step 5 — Review:**

```text
"Review your agreement"
[CONTRACT PREVIEW — PDF viewer, scrollable]
  ← Full contract rendered in JetBrains Mono
  ← All terms visible, read-only
  ← "Edit Terms" link at top → back to Step 3
SUMMARY SIDEBAR:
  Parties: Marcus J. ↔ Jasmine C.
  Type: Producer Agreement
  Advance: $2,500 (escrow)
  Royalty: 3%
  Signing: Both parties required
  [Download Preview PDF]
[Back]                              [Send for Signature →]
```

**Step 6 — Send:**

```text
[Animated send icon — paper airplane]
"Agreement sent for signature"
Marcus Johnson          Jasmine Carter
[Your signature:        [Awaiting signature]
 added automatically]
  Email sent to: jasmine@example.com
─────────────────────────────────────
[View Contract]    [Create Another]
```

### 7.3 Contract Detail View

```text
┌──────────────────────────────────────────────────────────┐
│  ← My Contracts                                          │
│  Producer Agreement — Track: "Golden Hour"               │
│  Created Feb 20, 2026  ·  ● SIGNED                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  💰 FUNDS SECURED IN ESCROW: $2,500.00              │ │
│  │  Releases when: all parties have signed ✓           │ │
│  │  [Release Payment Now]                              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  PARTIES                                                  │
│  [Marcus J. Avatar] Marcus Johnson    ✓ Signed Feb 21    │
│  Producer · You                                          │
│                                                           │
│  [Jasmine C. Avatar] Jasmine Carter   ✓ Signed Feb 22    │
│  Artist                                                   │
│                                                           │
│  TIMELINE                                                 │
│  ✓ Created — Feb 20 · 2:14pm                            │
│  ✓ Sent for signature — Feb 20 · 2:15pm                 │
│  ✓ Jasmine signed — Feb 22 · 4:31pm                     │
│  ✓ Marcus signed — Feb 21 · 9:00am (auto)               │
│  ✓ Contract fully executed — Feb 22 · 4:31pm            │
│  ○ Payment release — Pending manual trigger              │
│                                                           │
│  [Download Signed PDF]  [View Audit Trail]  [...]        │
└──────────────────────────────────────────────────────────┘
```

### 7.4 Negotiation View

```text
┌──────────────────────────────────────────────────────────┐
│  Negotiation — Round 2                                    │
│  "Jasmine proposed changes on Feb 23"                     │
├───────────────────────────┬──────────────────────────────┤
│  CONTRACT TERMS           │  DISCUSSION                  │
│                           │                              │
│  ROYALTY SPLIT      [?]   │  Jasmine Carter  · 2h ago   │
│  ┌─────────────────────┐  │  "Can we adjust the         │
│  │ YOUR PROPOSAL: 3%   │  │   royalty to 4%? I have     │
│  │ ─────────────────── │  │   a lot riding on this."    │
│  │ THEIR PROPOSAL: 4%  │  │                              │
│  │ (highlighted green) │  │  Marcus Johnson  · 1h ago   │
│  └─────────────────────┘  │  "I can do 3.5% — final."  │
│  [✓ Accept] [✗ Reject]    │                              │
│  [Counter: [3.5]%]        │  [Type a message...]        │
│                           │  [Send]                      │
│  ADVANCE PAYMENT    [?]   │                              │
│  No changes proposed      │                              │
│  (unchanged)              │                              │
│                           │                              │
│  [Accept All Changes]     │                              │
│  [Reject All Changes]     │                              │
└───────────────────────────┴──────────────────────────────┘
```

---

## 8. SyncGrid — UX Flows

### 8.1 Catalog View

```text
┌──────────────────────────────────────────────────────────┐
│  My Catalog                           [+ Upload Track]    │
│                                                           │
│  [All (32)] [Sync Ready (24)] [Needs Metadata (8)]       │
│  [Search tracks...]                    [Filter ▾]        │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐    │
│  │  [▶] "Golden Hour (feat. Jasmine)"               │    │
│  │      R&B · 94 BPM · 3:42                         │    │
│  │      Mood: Nostalgic, Warm, Hopeful              │    │
│  │      Sync Score: ████████░░ 82%  ● SYNC READY   │    │
│  │      [Submit to Opportunity] [Edit Metadata] [▾] │    │
│  ├──────────────────────────────────────────────────┤    │
│  │  [▶] "Midnight Drive"                            │    │
│  │      Electronic · 128 BPM · 4:15                 │    │
│  │      Sync Score: ████░░░░░░ 45%  ⚠ NEEDS WORK   │    │
│  │      Missing: ISRC, sample clearance status      │    │
│  │      [Complete Metadata →]                       │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 8.2 Track Metadata Editor

```text
┌──────────────────────────────────────────────────────────┐
│  ← My Catalog  /  Edit Metadata                          │
│  "Midnight Drive"                    Sync Score: 45%     │
├──────────────────────────────────────────────────────────┤
│  REQUIRED FOR SYNC READY                                  │
│                                                           │
│  ISRC                                              [?]   │
│  [US-ABC-26-00123]  ← auto-generated  [Generate ISRC]   │
│                                                           │
│  SAMPLE CLEARANCE STATUS                           [?]   │
│  ○ No samples used   ● Samples cleared   ○ Pending       │
│                                                           │
│  OWNERSHIP SPLITS                                  [?]   │
│  Master Owner:  [Jasmine Carter ────────────── 100%]     │
│  Songwriter:    [Jasmine Carter ──── 60%] [Marcus J. 40%]│
│  Producer:      [Marcus Johnson ───────────── 100%]      │
│  Publisher:     ● Self-published  ○ [Publisher name]     │
│                                                           │
│  MOOD TAGS (min 3 required)                       [?]   │
│  [Nostalgic ×] [Dark ×] [+ Add mood]                    │
│  AI Suggestions: [Cinematic] [Tense] [Atmospheric]      │
│                                                           │
│  ──────────────────────────────────────────────────      │
│  OPTIONAL ENHANCEMENTS                            [▼]   │
│                                                           │
│  [Save Changes]          Sync Score preview: 78%         │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Opportunities Marketplace

```text
┌──────────────────────────────────────────────────────────┐
│  Sync Opportunities                                       │
│  15 open briefs matching your catalog                     │
│                                                           │
│  [All] [Best Match] [Film & TV] [Advertising] [Trailer]  │
│  [Budget: Any ▾]  [Deadline ▾]  [Territory ▾]            │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐    │
│  │  ★ 94% MATCH                     Deadline: 3 days│    │
│  │  Netflix Documentary Series                       │    │
│  │  Mood: Nostalgic, Hopeful · Non-exclusive        │    │
│  │  Budget: $2,000 – $5,000 · Worldwide             │    │
│  │  Posted by: Verified Supervisor                   │    │
│  │  Matching tracks: "Golden Hour" (82% sync score) │    │
│  │                              [Submit Track →]    │    │
│  ├──────────────────────────────────────────────────┤    │
│  │  ★ 78% MATCH                     Deadline: 5 days│    │
│  │  Automotive Commercial — Online/Broadcast        │    │
│  │  Mood: Energetic, Modern · Exclusive (6 months)  │    │
│  │  Budget: $8,000 – $15,000 · North America only   │    │
│  │                              [Submit Track →]    │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Submit to Opportunity Flow

```text
Modal — "Submit to Netflix Documentary"
SELECT TRACK
  ● "Golden Hour (feat. Jasmine)"  82% sync score ✓
  ○ "Blue Morning"                 71% sync score
  ○ "Midnight Drive"               45% ⚠ Not sync ready
MESSAGE TO SUPERVISOR (optional)
  [This track was recorded in 2025 and all samples are cleared...]
LICENSE TERMS
  The brief requests: Non-exclusive · $2,000–$5,000 · Worldwide
  Your asking price: $[    ] (leave blank to accept brief range)
[Cancel]                          [Submit Track →]
```

---

## 9. LiveGrid — UX Flows

### 9.1 Tour Planner

```text
┌──────────────────────────────────────────────────────────┐
│  Tour Planner                          [+ New Tour]       │
│                                                           │
│  "Southeast Spring Run 2026"                 [Active]     │
│  Apr 1 – Apr 15, 2026 · 8 dates · 6 cities              │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │  MAP VIEW                                      │      │
│  │  [Interactive map showing route]               │      │
│  │  Atlanta → Nashville → Louisville →            │      │
│  │  Columbus → Pittsburgh → Baltimore             │      │
│  │  ↑ Venue pins + confirmed (green)/pending(grey)│      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  TOUR STOPS                                               │
│  ✓ Apr 1  Atlanta, GA      Smith's Olde Bar   [Booked]  │
│  ○ Apr 3  Nashville, TN    Exit/In            [Pending] │
│  ✓ Apr 5  Louisville, KY   Zanzabar           [Booked]  │
│  ○ Apr 7  Columbus, OH     [Find Venue →]               │
│  ✓ Apr 9  Pittsburgh, PA   Mr. Small's        [Booked]  │
│  ✓ Apr 11 Baltimore, MD    Ottobar            [Booked]  │
│                                                           │
│  TOUR SUMMARY                                             │
│  Revenue (confirmed): $6,200  Pending: $1,500            │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Venue Discovery

```text
┌──────────────────────────────────────────────────────────┐
│  Find Venues                                              │
│                                                           │
│  [City: Columbus, OH ×]  [Capacity: 100-500 ▾]           │
│  [Genre: Rock/Alt ▾]     [Date Available: Apr 7 ▾]       │
│                          [Map View ⊞]  [List View ≡]     │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐    │
│  │  [Photo]  Ace of Cups                            │    │
│  │           Columbus, OH · Cap: 175                │    │
│  │           Rock, Alt, Indie · ★★★★☆ 4.2 (18)    │    │
│  │           Typical fee: $300–$800 door deal       │    │
│  │           Apr 7: Available                       │    │
│  │                           [View] [Inquire →]    │    │
│  ├──────────────────────────────────────────────────┤    │
│  │  [Photo]  Spacebar                               │    │
│  │           Columbus, OH · Cap: 220                │    │
│  │           Electronic, Hip-Hop · ★★★★★ 4.8 (31) │    │
│  │           Typical fee: $500–$1,200 guarantee     │    │
│  │           Apr 7: Available                       │    │
│  │                           [View] [Inquire →]    │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Profile & Catalog

### 10.1 Public Profile

```text
┌──────────────────────────────────────────────────────────┐
│  [Cover gradient — brand colors]                         │
│                                                           │
│  [Avatar 96px]  Marcus Johnson                           │
│                 Producer · Atlanta, GA                   │
│                 [Verified ✓] [Professional tier]         │
│                                                           │
│  [Spotify ↗] [Instagram ↗] [SoundCloud ↗] [Website ↗]  │
│                                                           │
│  Bio: "Producer and beatmaker based in Atlanta..."       │
│                                                           │
│  ──────────────────────────────────────────────────      │
│  FEATURED TRACKS                                          │
│  [▶ Golden Hour]  [▶ Midnight Drive]  [▶ Sunrise]        │
│                                                           │
│  WORK WITH ME                                             │
│  [Send Contract Invite]    [View Full Catalog]           │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Settings & Billing

### 11.1 Billing Screen

```text
CURRENT PLAN
┌──────────────────────────────────────────────────────────┐
│  Professional Plan  · $79/month                          │
│  Renews March 24, 2026                                   │
│  [Manage Plan]  [Cancel]                                 │
└──────────────────────────────────────────────────────────┘
USAGE THIS MONTH
  Contracts created:   ████████████ Unlimited ✓
  Sync submissions:    ████░░░░░░░░ Unlimited ✓
  Team seats:          N/A (upgrade to Collective for teams)
UPGRADE TO COLLECTIVE
  [+ Add Team Members — $149/mo for 5 seats]
PAYMENT METHOD
  Visa •••• 4242   Expires 06/27   [Update]
BILLING HISTORY
  Feb 24, 2026  $79.00  Professional  [Receipt ↗]
  Jan 24, 2026  $79.00  Professional  [Receipt ↗]
```

---

## 12. Responsive Design

### 12.1 Breakpoints

```text
--breakpoint-sm:   640px   (large phones landscape)
--breakpoint-md:   768px   (tablet portrait)
--breakpoint-lg:   1024px  (tablet landscape / small desktop)
--breakpoint-xl:   1280px  (desktop)
--breakpoint-2xl:  1440px  (large desktop)
```

### 12.2 Mobile Adaptations (< 768px)

**Navigation:** Sidebar collapses to bottom tab bar

```text
[Contract] [Sync] [Live] [Profile]
   ●           ○       ○       ○
```

**Top Bar:** Logo + notification bell + avatar only (pillar tabs move to bottom)

**Contract Wizard:** Steps go full-screen (one step per screen, swipe-to-navigate)

**Contract List:** Cards stack full-width; action buttons collapse to "..." overflow menu

**Dashboard:** Stats row scrolls horizontally (2 cards visible at a time); pending actions full-width

**Key mobile principle:** Every critical action (create contract, sign, release payment) must be achievable on mobile in the same number of steps as desktop.

---

## 13. Accessibility

### 13.1 Standards Target

- WCAG 2.1 Level AA compliance

- ARIA 1.2 for all interactive components

- Keyboard navigation for all core workflows

### 13.2 Implementation Requirements

**Color Contrast:**

- Body text on dark bg: minimum 7:1 ratio (exceeds AA)

- Secondary text: minimum 4.5:1

- Interactive elements: minimum 3:1 for UI component boundaries

**Keyboard Navigation:**

- All forms fully keyboard navigable (Tab, Shift+Tab, Enter, Space, Escape)

- Custom dropdowns: Arrow key navigation, Enter to select, Escape to close

- Modal: Focus trapped within modal; Escape closes; returns focus to trigger

- Contract wizard: Left/right arrows advance/retreat steps

**Screen Reader Support:**

- All form inputs: `aria-label` or `aria-labelledby`

- Status badges: `aria-label="Contract status: Signed"`

- Progress indicators: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

- Live regions: `aria-live="polite"` for toast notifications, form validation

- Iconography: Decorative icons `aria-hidden="true"`; functional icons have visible or sr-only labels

**Focus Management:**

- Visible focus ring: 2px solid `--color-brand-primary` + 2px offset (never `outline: none` without replacement)

- After modal close: focus returns to trigger element

- After form submit: focus moves to confirmation message

---

## 14. Motion & Animation

### 14.1 Animation Principles

- **Purposeful:** Motion communicates state change, not decoration

- **Fast:** Micro-interactions ≤200ms; page transitions ≤350ms

- **Respects preference:** All animations disabled when `prefers-reduced-motion: reduce`

### 14.2 Transition Library

```css
/* Standard transitions */
--transition-fast:    100ms ease
--transition-base:    200ms ease
--transition-slow:    350ms ease
--transition-spring:  400ms cubic-bezier(0.34, 1.56, 0.64, 1)
/* Page-level */
Page enter:       opacity 0 → 1, translateY(8px) → 0, 300ms ease
Page exit:        opacity 1 → 0, 200ms ease
/* Modals */
Backdrop:         opacity 0 → 0.75, blur(0) → blur(4px), 300ms
Container:        scale(0.95) → scale(1), opacity 0 → 1, 300ms spring
/* Cards on hover */
Transform:        translateY(0) → translateY(-2px), 200ms ease
Shadow:           --shadow-md → --shadow-lg, 200ms ease
/* Escrow funded banner */
Entry:            slideDown + fadeIn, 400ms spring
Glow pulse:       box-shadow 0 0 0px → 0 0 20px brand-color, 2s infinite
/* Status badge transitions */
Color change:     background-color, 300ms ease (e.g., pending → signed)
/* Contract wizard step transition */
Exit step:        translateX(0) → translateX(-40px) + opacity 0, 250ms
Enter step:       translateX(40px) → translateX(0) + opacity 0 → 1, 300ms
```

---

## 15. Empty States & Error Handling

### 15.1 Empty States

**My Contracts (new user):**

```text
[Contract scroll illustration — 120px]
"No contracts yet"
"Create your first agreement to protect your music and get paid on time."
[+ Create Your First Contract]
```

**SyncGrid Opportunities (no matches):**

```text
[Waveform illustration]
"No matching opportunities right now"
"Complete your catalog metadata to improve your match score, or check back soon."
[Complete My Catalog →]  [View All Opportunities]
```

**LiveGrid Venue Search (no results):**

```text
[Map pin illustration]
"No venues found for Columbus, OH on Apr 7"
"Try adjusting your capacity range or date."
[Expand Search Radius]  [Change Date]
```

### 15.2 Error States

**Form validation (inline):**

```text
[Input field — red border]
⚠ Royalty percentages must total 100% — currently at 85%
```

**Payment failure:**

```text
[Alert modal]
"Payment could not be processed"
"Your card ending in 4242 was declined. Please update your payment method and try again."
[Update Payment Method]  [Try Again]
```

**Contract signature expired:**

```text
[Banner on contract]
⚠ Signature request expired on Feb 28, 2026
This contract can no longer be signed. Create a new contract to continue.
[Create New Contract]  [Archive This]
```

**API/network error (global):**

```text
[Toast — bottom right]
"Something went wrong. Your work has been saved."
[Retry]
```

### 15.3 Loading States

- **Skeleton screens** for all list/table views (never spinners for full-page loads)

- **Inline spinners** for button actions (button-width locked, no layout shift)

- **Progress indicators** for file uploads (% complete + file name)

- **Contract PDF generation:** "Generating your contract..." with animated progress bar

---

*Document Status: APPROVED*
*Next: SoundGrid Frontend Architecture v1 (Benjamin "Build" Park)*

