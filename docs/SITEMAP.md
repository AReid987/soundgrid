# SoundGrid Lo-Fi Wireframe Sitemap (Mobile-First)

## 1. Authentication & Onboarding
- [x] **Sign Up/In**: Simple centered logo, social buttons, or email form.
- [x] **Role Selection**: Vertical stack of cards (Artist, Producer, Supervisor, Venue, Manager).
- **Profile Setup**: Avatar upload, display name, location, genre.
- **Welcome**: "You're all set" success screen with primary action ("Create first contract").

## 2. Main App Shell (Authenticated)
### Bottom Tab Navigation
- [Contract] | [Sync] | [Live] | [Profile]

### 2.1 Dashboard (Home)
- **Top Bar**: Logo, Notification Icon, Avatar.
- **Pending Actions**: Vertical stack of urgent cards (Overdue, Signature Required).
- **Stats Grid**: 2x2 grid of key metrics (In Escrow, Active, Pending, Completed).
- **Recent Activity**: Simple list of events.
- **Quick Action FAB**: [+] button for context-aware creation.

### 2.2 ContractGrid
- **Contract List**: Filterable list with status badges.
- **Contract Wizard**: Full-screen steps (Type -> Parties -> Terms -> Payment -> Review).
- **Contract Detail**: Status banner (Escrow info), Parties list, Timeline, Action buttons.

### 2.3 SyncGrid
- **Catalog**: Track list with "Sync Ready" status.
- **Marketplace**: Browse briefs with "Match %".
- **Metadata Editor**: Single-page form for ISRC, moods, ownership.

### 2.4 LiveGrid
- **Tour Planner**: Map-centric view with vertical stop list.
- **Venue Discovery**: Search/Filter list of venues with capacity/availability.

## 3. Settings
- **Profile/Billing**: Simple list-based navigation for account management.
