# Important Design Info: Liceo Resource Hub

## 1. Visual Identity
The platform is branded as "The Academic Curator," reflecting a premium, scholarly, and secure environment for Liceo de Cagayan University students.

## 2. Color Palette
The theme uses a high-contrast **Maroon and Gold** scheme:
- **Primary (Maroon):** `#570000` — Used for main actions, brand identity, and headers.
- **Primary Container:** `#800000`
- **Secondary (Pleasant Gold):** `#9c7c00` — Used for labels, accents, and secondary actions.
- **Secondary Container (Gold):** `#fed65b` — Used for highlights and active states.
- **Surface:** `#f8f9fa` — Light, clean background.
- **On-Surface:** `#191c1d` — Dark charcoal for high readability.

## 3. Typography
- **Headline Font:** `'Newsreader', serif`
  - Used for titles, branding, and emphasis.
  - Often used with `font-style: italic` for a sophisticated look.
- **Body Font:** `'Work Sans', sans-serif`
  - Used for content, inputs, and buttons.
  - Prioritizes clarity and secondary spacing.

## 4. UI Elements & Aesthetics
- **Radius:**
  - Small: `0.125rem`
  - Medium: `0.25rem`
  - Large (Cards/Modals): `0.5rem`
  - Full (Circular): `0.75rem`
- **Shadows:** Subtle, deep shadows for depth (`0px 8px 24px rgba(25, 28, 29, 0.06)`).
- **Effects:** Heavy use of Backdrop Blurs (`backdrop-filter: blur(20px)`) for the Navigation Bar and Modals to create a modern "Glassmorphism" effect.
- **Transitions:** Standardized `0.3s ease` or `0.2s` for most interactive elements.

## 5. Global Styles Location
The core design system is defined in:
`adet-fe-bsit22/src/styles/design-system.scss`
