---
page: contract-list
---
Main App Shell: ContractGrid - Contract List view

**DESIGN SYSTEM (REQUIRED):**
# Design System: SoundGrid
**Project ID:** new

## 1. Visual Theme & Atmosphere
SoundGrid is a professional, high-authority platform for music industry experts. It utilizes a **Creator-Grade Aesthetic** characterized by a **Dark Mode Primary** theme, **Editorial Typography**, and **Utilitarian Density**. The "vibe" is clean, capable, and credible—designed to earn respect from professionals who value visual precision.

## 2. Color Palette & Roles
*   **Electric Indigo (#6C63FF):** Used for **Primary Actions**, CTA buttons, and brand identifiers. This color signals interactivity and core functionality.
*   **Teal Mint (#00D4AA):** Used for **Success States**, "Funds Secured" indicators, and signed/confirmed statuses. This color signals progress and trust.
*   **Coral (#FF6B6B):** Used for **Alerts**, overdue items, and urgent warnings. This color signals friction or items requiring immediate attention.
*   **Near-Black (#0F0F13):** The **Page Background** for the primary theme.
*   **Dark Surface (#1A1A24):** Used for **Cards, Panels, and Sidebar Elements** to create visual depth and hierarchy.
*   **Elevated Surface (#242434):** Used for **Modals, Dropdowns, and Overlays** to signify priority and temporary focus.

## 3. Typography Rules
*   **Outfit:** Used for both **Display/Headings** and **Body Text**. It provides a clean, neutral, and professional appearance with excellent readability at all weights.
*   **JetBrains Mono:** Used for **Contract Clauses, Metadata, and ISRC Fields**. It signifies technical precision and makes legal text more digestible.
*   **Hierarchy:** Utilizes a clear scale from 11px (Labels) to 38px (Display Headings), with generous line heights (e.g., 24px for body text) to maintain readability.

## 4. Component Stylings
*   **Buttons:**
    *   **Primary:** Solid Electric Indigo (#6C63FF) with rounded-md (8px) corners.
    *   **Secondary:** Transparent background with subtle border (#3D3D56).
    *   **Shape:** 8px rounded corners for MD/LG buttons; pill-shaped for badges.
*   **Cards/Containers:**
    *   **Base:** Dark Surface (#1A1A24) with subtle 1px border (#2A2A3D) and generous 12px rounded corners.
    *   **Shadow:** Medium depth (rgba(0,0,0,0.5)) to create separation from the background.
*   **Inputs/Forms:**
    *   **Background:** Elevated Surface (#242434) with 8px rounded corners.
    *   **Focus State:** Electric Indigo (#6C63FF) stroke with a subtle brand glow.

## 5. Layout Principles
*   **Mobile-First Strategy:** All core workflows (Sign, Release, Create) are designed for single-hand use with large hit areas and full-screen wizard steps.
*   **Whitespace:** Uses a base 4px grid. Standard spacing is 16px (mobile) to 24px (desktop) for layout gutters.
*   **Progressive Disclosure:** Minimum required information is presented first; complexity is hidden behind expandable sections or drawers.

**Page Structure:**
1. Bottom Tab Navigation (Active Tab: Contract).
2. Top Bar: Title "Contracts", Search/Filter inputs.
3. Contract List: Vertical list of contract cards.
4. Each card should show: Contract Title, Party Names, Date, and a Status Badge (using colors like Teal Mint for completed, Coral for action needed).
5. Quick Action FAB: [+] button to initiate a new contract.
