# Important Design Info: Liceo Resource Hub

## 1. Visual Identity
The platform is branded as "The Academic Curator," reflecting a premium, scholarly, and secure environment for Liceo de Cagayan University students.

## 2. Color Palette (Light Theme)
The theme uses a high-contrast **Maroon and Gold** scheme:
- **Primary (Maroon):** `#570000` — Used for main actions, brand identity, and headers.
- **Secondary (Academia Gold):** `#c5a021` — Used for labels, accents, and secondary actions.
- **Surface:** `#f8f9fa` — Light, clean background.
- **On-Surface:** `#191c1d` — Dark charcoal for high readability.

## 3. Premium Scholarly Obsidian (Dark Theme)
Implemented as a hardware-accelerated dark mode for low-light research:
- **Base (Obsidian):** `#0a0a0a` — Deep obsidian with subtle maroon radial gradients.
- **Primary (Coral Red):** `#ffb4a9` — Soft salmon red for accessibility in dark contexts.
- **Secondary (Academia Gold):** `#c5a021` — Shared institutional accent.
- **Container (Maroon-Deep):** `#570000` — Institutional grounding.

## 4. Typography
- **Headline Font:** `'Newsreader', serif`
  - Used for titles, branding, and emphasis.
  - Often used with `font-style: italic` for a sophisticated look.
- **Body Font:** `'Work Sans', sans-serif`
  - Used for content, inputs, and buttons.
  - Prioritizes clarity and secondary spacing.

## 5. UI Elements & Aesthetics
- **Radius:**
  - Small: `0.125rem` (Buttons/Pills)
  - Medium: `0.25rem` (Inputs)
  - Large: `0.5rem` (Cards/Modals)
- **Shadows:** Subtle, deep shadows for depth (`0px 8px 24px rgba(25, 28, 29, 0.06)`).
- **Performance:** Hardware-accelerated transitions and static overlays (non-blur) to maintain 60+ FPS on institutional hardware.
- **Transitions:** Standardized `0.2s` for most interactive elements.

## 6. Global Styles Location
The core design system is defined in:
`adet-fe-bsit22/src/styles/design-system.scss`
