---
type: Page
title: Soundgrid Frontend Architecture
aliases: null
description: null
icon: null
createdAt: '2026-02-24T16:15:08.193Z'
creationDate: 2026-02-24 10:15
modificationDate: 2026-02-24 10:15
tags: []
coverImage: null
---

# SoundGrid — Frontend Architecture Specification

**Version:** 1.0
**Date:** February 24, 2026
**Status:** READY FOR ENGINEERING
**Owner:** Antonio Reid, Founder
**Prepared by:** Benjamin (Lead Engineer) + Ava (Architect) — Aigency Agile Squad

---

## Table of Contents

1. Overview & Guiding Principles

2. Monorepo Structure

3. Next.js App Router Architecture

4. Component Architecture

5. State Management Strategy

6. Data Fetching & Caching Strategy

7. Authentication & Session Architecture

8. Role-Based Access Control (RBAC) — Frontend

9. Form Architecture

10. AI Agent Frontend Integration

11. Real-Time & Streaming Architecture

12. File Upload Architecture

13. Routing & Navigation Architecture

14. Performance Strategy

15. Testing Strategy

16. Error Handling Architecture

17. Environment & Configuration Management

18. CI/CD & Deployment Architecture

19. Frontend Tooling & Developer Experience

20. Dependency Map & Version Locks

---

## 1. Overview & Guiding Principles

### 1.1 Frontend Stack Summary

| Layer             | Technology                            | Version   | Rationale                                                |
| :---------------- | :------------------------------------ | :-------- | :------------------------------------------------------- |
| Framework         | Next.js (App Router)                  | 14.x      | Full-stack React, SSR/SSG, Server Actions, Vercel-native |
| Language          | TypeScript                            | 5.x       | Strict mode, no `any` allowed                            |
| Styling           | Tailwind CSS                          | 3.x       | Utility-first, consistent with Shadcn                    |
| Component Library | Shadcn/ui + Radix UI                  | latest    | Unstyled primitives, fully customizable, accessible      |
| State (client)    | Zustand                               | 4.x       | Lightweight, no boilerplate, selector-based              |
| State (server)    | TanStack Query                        | 5.x       | Server state, caching, background refetch                |
| Forms             | React Hook Form + Zod                 | 7.x / 3.x | Type-safe validation, shared schemas                     |
| Rich Text         | Tiptap                                | 2.x       | ProseMirror-based, extensible                            |
| Maps              | Mapbox GL JS                          | 3.x       | TourMapper routing visualization                         |
| Animation         | Framer Motion                         | 11.x      | Production-safe animations, reduced-motion support       |
| Icons             | Lucide React                          | latest    | Consistent with Shadcn ecosystem                         |
| Date Handling     | date-fns                              | 3.x       | Lightweight, tree-shakeable (no Moment.js)               |
| AI Streaming      | Vercel AI SDK                         | 3.x       | Streaming responses, tool use, provider-agnostic         |
| PDF Rendering     | React PDF / @react-pdf/renderer       | 3.x       | ContractCraft document rendering                         |
| File Upload       | Uploadthing                           | 6.x       | Handles S3 presigned URL complexity                      |
| Email Templates   | React Email                           | latest    | Type-safe transactional email templates                  |
| Testing           | Vitest + Testing Library + Playwright | latest    | Unit + integration + E2E                                 |

### 1.2 Guiding Principles

**1. Server-first rendering.** Default to Server Components. Only add `"use client"` when interactivity, browser APIs, or React hooks are required. This keeps the JS bundle small and Time to First Byte fast.

**2. Co-located feature code.** Each feature module lives in its own directory with its own components, hooks, utils, types, and server actions. No global `components/` dumping ground.

**3. Type safety end-to-end.** Zod schemas defined once in `packages/db/src/schema/` or `packages/validators/` are imported in both frontend forms and API route validation. No duplicated type definitions.

**4. Zero** `any`**.** TypeScript strict mode. ESLint rule `@typescript-eslint/no-explicit-any` set to `error`. PRs with `any` are rejected.

**5. Bundle discipline.** Every new dependency requires justification. Bundle size is tracked in CI (bundlesize or Next.js bundle analyzer). No dependency added without checking for a lighter alternative.

**6. Accessibility is not optional.** axe-core automated checks run in CI. Every PR that touches UI must pass accessibility tests. WCAG 2.1 AA is the floor, not the ceiling.

---

## 2. Monorepo Structure

### 2.1 Turborepo Workspace Layout

```text
soundgrid/
  apps/
    web/                          # Main Next.js application
    email/                        # React Email templates (separate Next.js app for preview)
  packages/
    db/                           # Prisma schema, migrations, seed data, typed client
    validators/                   # Shared Zod schemas (used by web + API routes)
    agents/                       # AI agent logic, prompts, tool definitions
    contracts/                    # ContractCraft templates, PDF rendering logic
    ui/                           # Shared Shadcn/ui component overrides
    config/
      eslint/                     # Shared ESLint config
      typescript/                 # Shared tsconfig base
      tailwind/                   # Shared Tailwind base config
  tooling/
    scripts/                      # DB seed, data import, admin utilities
  .github/
    workflows/                    # CI/CD GitHub Actions
  turbo.json                      # Turborepo pipeline config
  package.json                    # Root workspace package.json
  pnpm-workspace.yaml             # pnpm workspaces definition
```

**Package manager:** pnpm (workspaces, fast installs, strict peer dependencies)

### 2.2 apps/web Internal Structure

```text
apps/web/
  src/
    app/                          # Next.js App Router
      (marketing)/                # Route group: unauthenticated marketing pages
        page.tsx                  # Landing page
        features/page.tsx
        pricing/page.tsx
        layout.tsx                # Marketing layout (no sidebar)
      (auth)/                     # Route group: auth flows
        sign-in/page.tsx
        sign-up/page.tsx
        onboarding/
          page.tsx
          _components/            # Onboarding-specific components
      (app)/                      # Route group: authenticated app
        layout.tsx                # App shell (sidebar, top bar, auth check)
        dashboard/page.tsx
        discover/
          venues/
            page.tsx              # Venue discovery
            [venue-id]/page.tsx   # Venue detail
          artists/
            page.tsx
            [artist-id]/page.tsx
        booking/
          page.tsx                # Booking pipeline
          [booking-id]/page.tsx
          outreach/page.tsx
          tour/page.tsx
        marketplace/
          page.tsx
          new/page.tsx
          [listing-id]/page.tsx
          my-listings/page.tsx
        contracts/
          page.tsx
          [contract-id]/page.tsx
          templates/page.tsx
        venue/                    # VenueIQ (venue role only)
          page.tsx
          calendar/page.tsx
          events/[event-id]/page.tsx
          artists/page.tsx
        connections/
          page.tsx
          submissions/page.tsx
          crm/page.tsx
        brands/                   # Brand portal (brand role only)
          page.tsx
          discover/page.tsx
          deals/page.tsx
        community/
          page.tsx
          [board]/
            page.tsx
            [thread-id]/page.tsx
          resources/page.tsx
        settings/
          profile/page.tsx
          billing/page.tsx
          notifications/page.tsx
          team/page.tsx
      api/                        # API routes (Next.js Route Handlers)
        webhooks/
          stripe/route.ts
          clerk/route.ts
        ai/
          [agent]/route.ts        # Streaming AI agent endpoints
        auth/
          [...clerk]/route.ts
      layout.tsx                  # Root layout (fonts, providers)
      not-found.tsx               # Global 404
      error.tsx                   # Global error boundary
    components/
      ui/                         # Shadcn/ui components (auto-generated, do not edit)
      custom/                     # Custom components built on top of ui/
        app-shell/                # Sidebar, TopBar, RoleSwitcher
        agent-chat/               # AI agent interaction shell
        contract-viewer/          # ContractCraft document viewer
        kanban/                   # Booking pipeline Kanban
        tour-map/                 # Mapbox TourMapper component
        epk-preview/              # EPK preview renderer
    features/                     # Feature-scoped modules
      discovery/
        components/
        hooks/
        actions.ts                # Server Actions for discovery
        types.ts
      booking/
        components/
        hooks/
        actions.ts
        types.ts
      marketplace/
        components/
        hooks/
        actions.ts
        types.ts
      contracts/
        components/
        hooks/
        actions.ts
        types.ts
      venue-iq/
        components/
        hooks/
        actions.ts
        types.ts
      brands/
        components/
        hooks/
        actions.ts
        types.ts
      community/
        components/
        hooks/
        actions.ts
        types.ts
      onboarding/
        components/
        hooks/
        actions.ts
        types.ts
    hooks/                        # Global custom React hooks
      use-role.ts                 # Active role detection
      use-permissions.ts          # Permission checks
      use-debounce.ts
      use-local-storage.ts
      use-media-query.ts
      use-command-palette.ts
    lib/                          # Shared utilities
      auth.ts                     # Clerk server-side auth helpers
      db.ts                       # Prisma client singleton
      redis.ts                    # Upstash Redis client
      s3.ts                       # AWS S3 helpers
      stripe.ts                   # Stripe client
      openai.ts                   # OpenAI client
      utils.ts                    # cn(), formatCurrency(), formatDate() etc.
      constants.ts                # Platform-wide constants
    middleware.ts                 # Next.js middleware (auth, rate limiting, role checks)
    styles/
      globals.css                 # Tailwind directives + CSS custom properties (design tokens)
      tokens.css                  # Design token definitions
  public/
    fonts/                        # Self-hosted Inter + JetBrains Mono
    images/                       # Static brand assets
    icons/                        # Favicon, PWA icons
  tests/
    unit/                         # Vitest unit tests
    integration/                  # Vitest + Testing Library integration tests
    e2e/                          # Playwright end-to-end tests
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
  .env.local                      # Local environment variables (never committed)
  .env.example                    # Template for required env vars
```

---

## 3. Next.js App Router Architecture

### 3.1 Route Group Strategy

Three route groups enforce distinct layout boundaries:

| Route Group   | Layout                             | Auth required | Description                            |
| :------------ | :--------------------------------- | :------------ | :------------------------------------- |
| `(marketing)` | Marketing layout (no sidebar)      | No            | Public landing, pricing, feature pages |
| `(auth)`      | Minimal centered layout            | No            | Sign in, sign up, onboarding           |
| `(app)`       | Full app shell (sidebar + top bar) | Yes           | All authenticated app routes           |

### 3.2 Server vs. Client Components

**Rule: default to Server Components. Add** `"use client"` **only when necessary.**

`"use client"` required when:

- Using React hooks (`useState`, `useEffect`, `useContext`, `useReducer`)

- Using browser-only APIs (`window`, `document`, `localStorage`)

- Using event handlers (`onClick`, `onChange`, etc.)

- Using third-party libraries that require browser environment (Mapbox, Tiptap, Framer Motion)

**Pattern: "Push client down"**

- Page components: Server Components (fetch data, render shell)

- Interactive leaf components: Client Components (buttons, forms, dropdowns)

- Data fetching: In Server Components or Server Actions, never in `useEffect`

```tsx
// CORRECT: Server Component page fetches data, passes to client component
// app/(app)/booking/page.tsx
import { getBookings } from '@/features/booking/actions'
import { BookingPipeline } from '@/features/booking/components/BookingPipeline'
export default async function BookingPage() {
  const bookings = await getBookings() // server-side data fetch
  return <BookingPipeline initialBookings={bookings} /> // client component for interactivity
}
// WRONG: Never do this
// 'use client'
// useEffect(() => { fetch('/api/bookings').then(...) }, []) // client-side data fetch
```

### 3.3 Server Actions

Server Actions are the primary mutation mechanism. They replace API route handlers for form submissions and data mutations.

**Server Action conventions:**

- Defined in `features/[module]/actions.ts`

- Always use `"use server"` directive

- Always validate input with Zod before any DB operation

- Always return typed response: `{ success: true, data: T } | { success: false, error: string }`

- Never throw errors to the client — catch and return error objects

```typescript
// features/booking/actions.ts
"use server"
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createBookingSchema } from '@soundgrid/validators'
export async function createBooking(input: unknown) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }
  const parsed = createBookingSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.message }
  try {
    const booking = await db.booking.create({ data: { ...parsed.data, initiatedBy: userId } })
    return { success: true, data: booking }
  } catch (e) {
    return { success: false, error: 'Failed to create booking' }
  }
}
```

### 3.4 Loading & Suspense Strategy

- Every dynamic route has a `loading.tsx` that renders a skeleton screen

- Data-fetching components wrapped in `<Suspense fallback={<Skeleton />}>`

- Streaming used for AI agent responses (via Vercel AI SDK `useChat` / `streamText`)

- Page-level loading states use the `loading.tsx` convention (parallel routes)

```text
app/(app)/booking/
  page.tsx          # Booking pipeline page
  loading.tsx       # Skeleton shown during page data fetch
  error.tsx         # Error boundary for this route segment
```

### 3.5 Metadata & SEO

- Root `layout.tsx` defines base metadata (title template, og:image, description)

- Authenticated app pages: `noindex` meta tag (no public indexing of user dashboards)

- Marketing pages: Full SEO metadata with `generateMetadata()` per page

- Venue/Artist public profile pages: Full SEO (these are public-facing, indexed)

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```text
Level 1: Shadcn/ui primitives (packages/ui — never modified directly)
  └── Button, Input, Select, Dialog, Sheet, Table, etc.
Level 2: Custom base components (apps/web/src/components/custom/)
  └── Built on Level 1. Platform-specific but not feature-specific.
  └── Examples: StatusBadge, MatchScoreRing, AgentChatShell, ContractViewer
Level 3: Feature components (apps/web/src/features/[module]/components/)
  └── Built on Level 1 + 2. Feature-specific. Co-located with their feature.
  └── Examples: BookingCard, VenueProfileHeader, PitchForgeWizard
Level 4: Page compositions (apps/web/src/app/(app)/[route]/page.tsx)
  └── Assembles Level 2 + 3 components. Minimal logic — orchestration only.
```

### 4.2 Component File Conventions

```typescript
// Standard component file structure
// features/booking/components/BookingCard.tsx
import type { Booking } from '@soundgrid/db'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
// 1. Type definitions at top
interface BookingCardProps {
  booking: Booking
  onMove?: (bookingId: string, newStatus: string) => void
  className?: string
}
// 2. Component (named export, not default)
export function BookingCard({ booking, onMove, className }: BookingCardProps) {
  // 3. Hooks first
  // 4. Derived state / computed values
  // 5. Event handlers
  // 6. Return JSX
  return (
    <div className={cn('rounded-lg border bg-surface p-4', className)}>
      {/* ... */}
    </div>
  )
}
// Default exports only for Next.js page.tsx / layout.tsx files
// All components use named exports
```

### 4.3 The `cn()` Utility

All conditional classname logic uses the `cn()` utility (clsx + tailwind-merge):

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4.4 App Shell Components

**Sidebar (**`components/custom/app-shell/Sidebar.tsx`**)**

- Client Component (handles active state, role switcher interaction)

- Reads active role from Zustand `useRoleStore`

- Navigation items derived from `getNavItems(role)` util — returns role-appropriate items

- Clerk `<UserButton>` at bottom for profile/logout

**TopBar (**`components/custom/app-shell/TopBar.tsx`**)**

- Breadcrumb (reads from Next.js `usePathname()`, maps to readable labels)

- Global search (CMD+K opens `<CommandPalette>` component)

- Notification bell (reads from TanStack Query `useNotifications()` hook)

**RoleSwitcher (**`components/custom/app-shell/RoleSwitcher.tsx`**)**

- Only renders if user has > 1 role

- Popover with role list, clicking updates Zustand `useRoleStore`

- Persists active role to `localStorage` (survives page refresh)

---

## 5. State Management Strategy

### 5.1 State Categories

| Category                 | Tool                      | Location          | Examples                                               |
| :----------------------- | :------------------------ | :---------------- | :----------------------------------------------------- |
| Server state (remote)    | TanStack Query            | Client Components | Bookings list, venue profiles, marketplace listings    |
| Client/UI state (global) | Zustand                   | Global stores     | Active role, sidebar open/closed, command palette open |
| Client/UI state (local)  | React `useState`          | Component         | Form step, accordion open, dropdown open               |
| Form state               | React Hook Form           | Form components   | All form fields, validation, submission state          |
| URL state                | Next.js `useSearchParams` | Page components   | Filters, search query, pagination                      |

### 5.2 Zustand Stores

All Zustand stores in `hooks/` as `use[StoreName].ts`:

`useRoleStore`

```typescript
interface RoleStore {
  activeRole: UserRole
  availableRoles: UserRole[]
  setActiveRole: (role: UserRole) => void
}
// Persisted to localStorage via zustand/middleware persist
```

`useUIStore`

```typescript
interface UIStore {
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
}
```

`useAgentStore`

```typescript
interface AgentStore {
  activeAgent: AgentType | null
  agentPanelOpen: boolean
  agentContext: Record<string, unknown>
  openAgent: (agent: AgentType, context?: Record<string, unknown>) => void
  closeAgent: () => void
}
```

**Rule:** No business logic in Zustand stores. Stores are UI state only. Business logic lives in Server Actions or TanStack Query query functions.

### 5.3 TanStack Query Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes stale time default
      gcTime: 1000 * 60 * 30,         // 30 minutes garbage collection
      retry: 1,                         // 1 retry on failure
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,                         // No retry on mutations
    },
  },
})
```

**Query key conventions:**

```typescript
// Consistent, hierarchical query keys
export const queryKeys = {
  bookings: {
    all: ['bookings'] as const,
    list: (filters: BookingFilters) => ['bookings', 'list', filters] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  venues: {
    all: ['venues'] as const,
    list: (filters: VenueFilters) => ['venues', 'list', filters] as const,
    detail: (id: string) => ['venues', 'detail', id] as const,
  },
  // ... etc per module
}
```

---

## 6. Data Fetching & Caching Strategy

### 6.1 Fetching Hierarchy

```text
1. Server Component (page.tsx)
   → Direct DB call via Prisma (fastest, no HTTP round-trip)
   → Use for: initial page data, SEO-critical content
2. Server Action
   → Called from Client Components via React 19 `useActionState` or direct call
   → Use for: mutations (create, update, delete)
3. TanStack Query (useQuery)
   → Calls internal API routes or Server Actions
   → Use for: client-side data that needs background refresh, optimistic updates, caching
   → Never for initial page data (use Server Components instead)
4. API Route Handler (/api/...)
   → Used only for: webhooks (Stripe, Clerk), streaming AI responses
   → Not used for standard CRUD — Server Actions handle that
```

### 6.2 Next.js Caching Layers

```typescript
// Opt-in to Next.js fetch cache for external API calls
const venues = await fetch('https://api.external.com/venues', {
  next: {
    revalidate: 3600, // Cache for 1 hour
    tags: ['venues'], // Tag for on-demand revalidation
  }
})
// Opt-out of cache for dynamic user data
const bookings = await fetch('/api/bookings', {
  cache: 'no-store' // Always fresh
})
// On-demand revalidation after mutations
import { revalidateTag } from 'next/cache'
await revalidateTag('venues') // Bust all venue-tagged cache entries
```

### 6.3 Optimistic Updates Pattern

```typescript
// features/booking/hooks/useUpdateBookingStatus.ts
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, status }: UpdateStatusInput) =>
      updateBookingStatus({ bookingId, status }),
    onMutate: async ({ bookingId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(bookingId) })
      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.bookings.detail(bookingId))
      // Optimistically update
      queryClient.setQueryData(queryKeys.bookings.detail(bookingId), (old: Booking) => ({
        ...old,
        status,
      }))
      return { previous }
    },
    onError: (_, __, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings.detail(_.bookingId), context.previous)
      }
    },
    onSettled: (_, __, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) })
    },
  })
}
```

---

## 7. Authentication & Session Architecture

### 7.1 Clerk Integration

```typescript
// middleware.ts — Auth enforcement at the edge
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher([
  '/',
  '/features(.*)',
  '/pricing(.*)',
  '/venues(.*)',       // Public venue directory
  '/artists(.*)',      // Public artist directory
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Webhooks must be public
])
export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})
export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

### 7.2 Server-Side Auth Helper

```typescript
// lib/auth.ts
import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
export async function auth() {
  const { userId } = clerkAuth()
  return { userId }
}
export async function getCurrentUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  const user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      artistProfile: true,
      venueProfile: true,
      promoterProfile: true,
      brandProfile: true,
    }
  })
  return user
}
```

### 7.3 Onboarding Redirect

After Clerk sign-up, Clerk webhook fires → creates user record in DB → redirects to `/onboarding`. Onboarding completion sets `user.onboardingComplete = true`. Middleware checks this flag and redirects incomplete users to onboarding.

---

## 8. Role-Based Access Control — Frontend

### 8.1 Permission System

Permissions are checked at three layers:

1. **Middleware** — Route-level access (e.g., `/venue/*` requires `venue` role)

2. **Server Component / Server Action** — Data-level access (can this user see/modify this record?)

3. **UI layer** — Show/hide UI elements based on role (never rely on this alone for security)

### 8.2 Route-Level RBAC in Middleware

```typescript
// middleware.ts addition
const isVenueRoute = createRouteMatcher(['/app/venue(.*)'])
const isBrandRoute = createRouteMatcher(['/app/brands(.*)'])
clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = auth().protect()
    if (isVenueRoute(request)) {
      const user = await db.user.findUnique({ where: { clerkId: userId } })
      if (!user?.roles.includes('venue')) {
        return NextResponse.redirect(new URL('/app/dashboard', request.url))
      }
    }
  }
})
```

### 8.3 UI-Layer Permission Hook

```typescript
// hooks/use-permissions.ts
export function usePermissions() {
  const { activeRole } = useRoleStore()
  const { user } = useUser() // Clerk hook
  return {
    canAccessVenueIQ: user?.roles?.includes('venue') ?? false,
    canAccessBrandPortal: user?.roles?.includes('brand') ?? false,
    canCreateContracts: activeRole !== 'free' || user?.subscriptionTier === 'pro',
    canUsePitchForge: user?.subscriptionTier !== 'free',
    canViewContactInfo: user?.subscriptionTier !== 'free',
    isAdmin: user?.roles?.includes('admin') ?? false,
  }
}
// Usage in component:
// const { canUsePitchForge } = usePermissions()
// {canUsePitchForge ? <PitchForgeButton /> : <UpgradePrompt feature="PitchForge" />}
```

### 8.4 Subscription Gate Component

```typescript
// components/custom/SubscriptionGate.tsx
interface SubscriptionGateProps {
  requiredTier: 'pro' | 'enterprise'
  feature: string
  children: React.ReactNode
}
export function SubscriptionGate({ requiredTier, feature, children }: SubscriptionGateProps) {
  const { subscriptionTier } = useCurrentUser()
  if (tierLevel(subscriptionTier) < tierLevel(requiredTier)) {
    return <UpgradePrompt feature={feature} requiredTier={requiredTier} />
  }
  return <>{children}</>
}
```

---

## 9. Form Architecture

### 9.1 Form Stack

- **React Hook Form** — form state, field registration, submission handling

- **Zod** — schema validation (shared between frontend and server action)

- `@hookform/resolvers` — connects Zod schema to RHF

- **Shadcn/ui Form components** — `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormMessage>`

### 9.2 Standard Form Pattern

```typescript
// Shared schema in packages/validators/booking.ts
export const createBookingSchema = z.object({
  venueId: z.string().uuid(),
  showDate: z.date(),
  dealType: z.enum(['guarantee', 'door_split', 'vs_deal', 'flat_fee']),
  guaranteeAmount: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
})
export type CreateBookingInput = z.infer<typeof createBookingSchema>
```

```tsx
// Feature form component
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBookingSchema, type CreateBookingInput } from '@soundgrid/validators'
import { createBooking } from '../actions'
export function CreateBookingForm({ venueId }: { venueId: string }) {
  const form = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: { venueId, dealType: 'guarantee' },
  })
  async function onSubmit(data: CreateBookingInput) {
    const result = await createBooking(data)
    if (!result.success) {
      form.setError('root', { message: result.error })
      return
    }
    // handle success
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="showDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Show Date</FormLabel>
            <FormControl><DatePicker {...field} /></FormControl>
            <FormMessage /> {/* Auto-renders Zod error */}
          </FormItem>
        )} />
        {/* ... other fields */}
        <Button type="submit" loading={form.formState.isSubmitting}>
          Create Booking
        </Button>
      </form>
    </Form>
  )
}
```

### 9.3 Multi-Step Form Pattern (Onboarding, PitchForge Wizard)

- Step state managed in Zustand (persists across page refreshes for onboarding)

- Each step is an independent form with its own Zod schema

- Server Action called only on final step submission (all step data accumulated in store)

- Progress indicator driven by Zustand step index

---

## 10. AI Agent Frontend Integration

### 10.1 Vercel AI SDK Integration

All AI agent interactions use the Vercel AI SDK for streaming responses.

```typescript
// API route: app/api/ai/[agent]/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getAgentConfig } from '@soundgrid/agents'
export async function POST(req: Request, { params }: { params: { agent: string } }) {
  const { messages, context } = await req.json()
  const agentConfig = getAgentConfig(params.agent)
  const result = await streamText({
    model: openai('gpt-4o'),
    system: agentConfig.systemPrompt(context),
    messages,
    tools: agentConfig.tools,
    maxTokens: agentConfig.maxTokens,
  })
  return result.toDataStreamResponse()
}
```

### 10.2 Agent Chat Client Component

```typescript
// components/custom/agent-chat/AgentChat.tsx
'use client'
import { useChat } from 'ai/react'
interface AgentChatProps {
  agent: AgentType
  context: Record<string, unknown>
  onAction?: (action: AgentAction) => void
}
export function AgentChat({ agent, context, onAction }: AgentChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `/api/ai/${agent}`,
    body: { context },
    onFinish: (message) => {
      // Parse tool calls / action cards from message
    }
  })
  return (
    <div className="flex flex-col h-full">
      <AgentHeader agent={agent} />
      <AgentContextChip context={context} />
      <MessageThread messages={messages} onAction={onAction} />
      <AgentInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
```

### 10.3 Agent Action Cards

When the AI agent returns a structured action (generated pitch, contract draft, tour route), it is rendered as an **Action Card** — not plain text:

```typescript
// Action card types
type AgentActionCard =
  | { type: 'pitch'; content: string; venueId: string }
  | { type: 'contract_draft'; templateType: string; fields: Record<string, string> }
  | { type: 'tour_route'; stops: TourStop[]; totalMiles: number }
  | { type: 'epk_section'; section: string; content: string }
// Rendered as interactive card with Edit / Accept / Send actions
// Never auto-applied — always requires user confirmation
```

---

## 11. Real-Time & Streaming Architecture

### 11.1 Real-Time Requirements

| Feature                                | Mechanism                        | Justification                    |
| :------------------------------------- | :------------------------------- | :------------------------------- |
| AI agent streaming responses           | Vercel AI SDK `streamText`       | Native streaming, no polling     |
| Booking status updates (collaborative) | TanStack Query `refetchInterval` | Polling sufficient for Phase 1   |
| New booking inquiry notification       | Polling (30s interval) + Toast   | WebSockets deferred to Phase 2   |
| Contract signature events              | Webhook → DB → polling           | Clerk/Stripe pattern, sufficient |
| Community new replies                  | Polling (60s interval)           | Not latency-critical             |

**Decision:** No WebSockets in Phase 1. TanStack Query polling covers all real-time needs at MVP scale. WebSockets (via Supabase Realtime or Pusher) introduced in Phase 2 when booking activity demands it.

### 11.2 Contract PDF Streaming

ContractCraft PDF generation is a long-running operation:

1. Client submits contract data → Server Action

2. Server Action triggers background job (Inngest) for PDF generation

3. Returns `{ jobId }` immediately

4. Client polls `GET /api/contracts/[id]/pdf-status` every 2s via TanStack Query

5. When `status === 'ready'`, enables download button and shows preview

---

## 12. File Upload Architecture

### 12.1 Uploadthing Integration

All file uploads use Uploadthing to handle S3 presigned URL complexity:

```typescript
// lib/uploadthing.ts — file router definition
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/lib/auth'
const f = createUploadthing()
export const ourFileRouter = {
  profilePhoto: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('Unauthorized')
      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.user.update({
        where: { clerkId: metadata.userId },
        data: { profilePhotoUrl: file.url }
      })
    }),
  marketplacePhotos: f({ image: { maxFileSize: '8MB', maxFileCount: 10 } })
    .middleware(async () => { /* auth check */ })
    .onUploadComplete(async ({ file }) => { /* save to listing */ }),
  contractDocuments: f({ pdf: { maxFileSize: '16MB', maxFileCount: 1 } })
    .middleware(async () => { /* auth + subscription check */ })
    .onUploadComplete(async ({ file }) => { /* save to contract, trigger WORM lock */ }),
  audioSamples: f({ audio: { maxFileSize: '32MB', maxFileCount: 3 } })
    .middleware(async () => { /* auth check */ })
    .onUploadComplete(async ({ file }) => { /* save to artist profile */ }),
} satisfies FileRouter
```

---

## 13. Routing & Navigation Architecture

### 13.1 Programmatic Navigation

```typescript
// Always use typed routing via a route constants file
// lib/routes.ts
export const routes = {
  dashboard: '/app/dashboard',
  discover: {
    venues: '/app/discover/venues',
    venue: (id: string) => `/app/discover/venues/${id}`,
    artists: '/app/discover/artists',
    artist: (id: string) => `/app/discover/artists/${id}`,
  },
  booking: {
    pipeline: '/app/booking',
    detail: (id: string) => `/app/booking/${id}`,
    outreach: '/app/booking/outreach',
  },
  contracts: {
    list: '/app/contracts',
    detail: (id: string) => `/app/contracts/${id}`,
  },
  // ... etc
} as const
// Usage: router.push(routes.booking.detail(bookingId))
// Never: router.push(`/app/booking/${bookingId}`) — prevents typos
```

### 13.2 URL State for Filters

Discovery search filters, marketplace filters, and booking pipeline filters persist in URL search params for shareability and back-button support:

```typescript
// features/discovery/hooks/useVenueFilters.ts
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
export function useVenueFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const filters = {
    genres: searchParams.getAll('genre'),
    city: searchParams.get('city') ?? '',
    radius: Number(searchParams.get('radius') ?? 100),
    capacityMin: Number(searchParams.get('capMin') ?? 0),
    capacityMax: Number(searchParams.get('capMax') ?? 5000),
  }
  function updateFilter(key: string, value: string | string[]) {
    const params = new URLSearchParams(searchParams)
    // update params...
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }
  return { filters, updateFilter }
}
```

---

## 14. Performance Strategy

### 14.1 Core Web Vitals Targets

| Metric                          | Target          | Measurement                   |
| :------------------------------ | :-------------- | :---------------------------- |
| LCP (Largest Contentful Paint)  | < 2.5s          | Vercel Analytics + Sentry     |
| INP (Interaction to Next Paint) | < 200ms         | Vercel Analytics              |
| CLS (Cumulative Layout Shift)   | < 0.1           | Vercel Analytics              |
| TTFB (Time to First Byte)       | < 800ms         | Vercel Analytics              |
| JS Bundle (initial load)        | < 150KB gzipped | Next.js bundle analyzer in CI |

### 14.2 Performance Techniques

**Code Splitting**

- Next.js automatic per-route code splitting

- Heavy libraries (Mapbox, Tiptap, React PDF) loaded with `dynamic()` import + `ssr: false`

- AI agent chat shell lazy-loaded on first open

```typescript
// Lazy load heavy components
const TourMap = dynamic(() => import('@/components/custom/tour-map/TourMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
})
const ContractPDFViewer = dynamic(() => import('@/components/custom/contract-viewer/PDFViewer'), {
  ssr: false,
  loading: () => <PDFSkeleton />
})
```

**Image Optimization**

- All images served via `next/image` (automatic WebP conversion, responsive srcset, lazy loading)

- Profile photos: stored at 800×800px max, served at appropriate size via `sizes` prop

- Venue hero photos: 1200×675px max

**Font Loading**

- Inter and JetBrains Mono self-hosted via `next/font/local` (no Google Fonts DNS lookup)

- `font-display: swap` for all fonts

- Only required font weights loaded (400, 500, 600, 700)

**React Optimization**

- `React.memo` for expensive list items (VenueCard, ArtistCard in large directories)

- `useMemo` for expensive computed values (filtered/sorted lists, match score calculations)

- `useCallback` for stable event handler references passed to memoized components

- Virtual scrolling (TanStack Virtual) for venue/artist directories > 100 items

---

## 15. Testing Strategy

### 15.1 Test Pyramid

```text
E2E Tests (Playwright) — ~20 critical user journeys
  ↓ Slow but high confidence. Run on every PR merge to main.
Integration Tests (Vitest + Testing Library) — ~150 component/feature tests
  ↓ Medium speed. Run on every PR.
Unit Tests (Vitest) — ~300 utility/schema/hook tests
  ↓ Fast. Run on every commit.
```

### 15.2 Unit Test Coverage Requirements

- All Zod schemas: 100% coverage (every valid + invalid input pattern)

- All Server Actions: 100% coverage (success path + all error paths)

- All utility functions (`lib/utils.ts`, `lib/auth.ts`): 100% coverage

- All Zustand stores: 100% coverage

- All permission checks: 100% coverage

### 15.3 Integration Test Priority

| Test                                          | Priority |
| :-------------------------------------------- | :------- |
| Onboarding flow (all 6 persona types)         | P0       |
| Create booking → sign contract flow           | P0       |
| PitchForge: generate + send pitch             | P0       |
| Marketplace: create listing → purchase        | P0       |
| ContractCraft: full signature flow            | P0       |
| Role switcher: all roles render correct nav   | P1       |
| Subscription gate: free vs pro feature access | P1       |

### 15.4 E2E Test Suite (Playwright)

Critical paths tested in real browser (Chromium + Firefox):

1. New musician signs up → completes onboarding → sends first booking pitch

2. New venue signs up → completes onboarding → posts open date → receives inquiry

3. Booking: inquiry → negotiation → contract generation → both parties sign

4. Marketplace: list a piece of gear → another user purchases → Stripe payment

5. PitchForge: bulk outreach to 5 venues, verify pitches appear in Pitched column

6. ContractCraft: email link → OTP verification → scroll → sign → download

### 15.5 Accessibility Testing

- `axe-core` integrated into Playwright tests — every E2E test includes axe scan

- `jest-axe` for component-level accessibility assertions in integration tests

- Manual keyboard navigation audit before each major release

---

## 16. Error Handling Architecture

### 16.1 Error Boundaries

```text
app/(app)/layout.tsx — catches errors in authenticated app shell
  ↓
app/(app)/[module]/error.tsx — catches errors in specific route segments
  ↓
Component-level try/catch — for recoverable errors (form submission)
```

### 16.2 Error Logging

```typescript
// lib/errors.ts
import * as Sentry from '@sentry/nextjs'
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  } else {
    console.error('Error:', error, context)
  }
}
// Usage in Server Actions:
// } catch (e) {
//   captureError(e, { action: 'createBooking', userId, input })
//   return { success: false, error: 'An unexpected error occurred' }
// }
```

### 16.3 User-Facing Error Messages

**Never expose:**

- Database error messages

- Stack traces

- Internal IDs or technical details

**Always show:**

- What went wrong (plain language)

- What the user can do about it

- A way to contact support if it persists

---

## 17. Environment & Configuration Management

### 17.1 Environment Variables

```bash
# .env.example — committed to repo (no secrets)
# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
# Database (Neon PostgreSQL)
DATABASE_URL=
DATABASE_URL_UNPOOLED=
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_S3_CONTRACTS_BUCKET=
AWS_REGION=
# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# AI (OpenAI)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
# Vector DB (Pinecone)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
# File Upload (Uploadthing)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
# Error Tracking (Sentry)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
# Background Jobs (Inngest)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
# Maps (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=
# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

### 17.2 Environment Tiers

| Tier         | Database                      | Description                     |
| :----------- | :---------------------------- | :------------------------------ |
| `local`      | Neon dev branch               | Local development               |
| `preview`    | Neon PR branch (auto-created) | Every PR gets its own DB branch |
| `staging`    | Neon staging branch           | Pre-production testing          |
| `production` | Neon main branch              | Live production                 |

---

## 18. CI/CD & Deployment Architecture

### 18.1 GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm typecheck
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm lint
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v4
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - run: pnpm test:integration
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm build
      - uses: andresz1/size-limit-action@v1
  e2e-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - run: pnpm test:e2e
```

### 18.2 Vercel Deployment

| Branch           | Environment | Auto-deploy | URL                                    |
| :--------------- | :---------- | :---------- | :------------------------------------- |
| `main`           | Production  | On merge    | `soundgrid.com`                        |
| `develop`        | Staging     | On push     | `staging.soundgrid.com`                |
| `feat/*` `fix/*` | Preview     | On push     | `soundgrid-[branch]-[hash].vercel.app` |

**Preview deployments:** Every PR gets a Vercel preview URL + its own Neon database branch. Engineers can test against real data without affecting staging or production.

### 18.3 Database Migration Strategy

```bash
# Workflow for schema changes:
# 1. Create migration
pnpm prisma migrate dev --name add_booking_hold_system
# 2. Migration runs automatically in CI against test DB
# 3. On merge to main, Vercel build step runs:
pnpm prisma migrate deploy  # applies pending migrations to production
# Schema change review checklist:
# - Is the migration reversible?
# - Does it require downtime? (adding columns is safe, renaming is not)
# - Does it break existing queries?
# - Is there a seed/backfill needed?
```

---

## 19. Frontend Tooling & Developer Experience

### 19.1 ESLint Configuration

```javascript
// packages/config/eslint/index.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/no-array-index-key': 'warn',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-labels': 'error',
  }
}
```

### 19.2 Git Hooks (Husky + lint-staged)

```json
// .husky/pre-commit
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### 19.3 VS Code Workspace Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### 19.4 Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@soundgrid/db": ["../../packages/db/src"],
      "@soundgrid/validators": ["../../packages/validators/src"],
      "@soundgrid/agents": ["../../packages/agents/src"],
      "@soundgrid/ui": ["../../packages/ui/src"]
    }
  }
}
```

---

## 20. Dependency Map & Version Locks

### 20.1 Core Dependencies (apps/web)

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "18.3.x",
    "react-dom": "18.3.x",
    "typescript": "5.4.x",
    "@clerk/nextjs": "5.x",
    "@prisma/client": "5.x",
    "tailwindcss": "3.4.x",
    "zustand": "4.5.x",
    "@tanstack/react-query": "5.x",
    "react-hook-form": "7.x",
    "zod": "3.x",
    "@hookform/resolvers": "3.x",
    "ai": "3.x",
    "@ai-sdk/openai": "0.x",
    "framer-motion": "11.x",
    "lucide-react": "latest",
    "@tiptap/react": "2.x",
    "mapbox-gl": "3.x",
    "date-fns": "3.x",
    "uploadthing": "6.x",
    "@upstash/redis": "1.x",
    "stripe": "14.x",
    "@sentry/nextjs": "8.x",
    "sonner": "1.x",
    "@tanstack/react-virtual": "3.x",
    "clsx": "2.x",
    "tailwind-merge": "2.x",
    "class-variance-authority": "0.7.x"
  },
  "devDependencies": {
    "vitest": "1.x",
    "@testing-library/react": "15.x",
    "@testing-library/user-event": "14.x",
    "playwright": "1.x",
    "eslint": "8.x",
    "prettier": "3.x",
    "husky": "9.x",
    "lint-staged": "15.x",
    "@next/bundle-analyzer": "14.x"
  }
}
```

### 20.2 Dependency Update Policy

- **Security patches:** Apply immediately (automated via Dependabot)

- **Minor updates:** Review weekly, apply if no breaking changes

- **Major updates:** Quarterly review with dedicated testing sprint

- **Next.js major updates:** Evaluate 30 days after stable release

---

*Document prepared by Benjamin (Lead Engineer) + Ava (Systems Architect) — Aigency Agile Squad*
*Grounded in SoundGrid PRD v1.0, Architecture v1.0, and UX Spec v1.0*
*Handoff target: Engineering sprint planning with Fiona (Scrum Master)*

