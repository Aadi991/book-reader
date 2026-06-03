---
name: Paperback Neo
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414845'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#717975'
  outline-variant: '#c1c8c4'
  surface-tint: '#44655b'
  primary: '#44655b'
  on-primary: '#ffffff'
  primary-container: '#d1f5e8'
  on-primary-container: '#517167'
  inverse-primary: '#abcec2'
  secondary: '#625f4f'
  on-secondary: '#ffffff'
  secondary-container: '#e5e0cc'
  on-secondary-container: '#666353'
  tertiary: '#5e5c6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#efebff'
  on-tertiary-container: '#6b697b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6eadd'
  primary-fixed-dim: '#abcec2'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#2d4d44'
  secondary-fixed: '#e8e2cf'
  secondary-fixed-dim: '#ccc6b4'
  on-secondary-fixed: '#1e1c10'
  on-secondary-fixed-variant: '#4a4739'
  tertiary-fixed: '#e4e0f5'
  tertiary-fixed-dim: '#c8c4d8'
  on-tertiary-fixed: '#1b1a29'
  on-tertiary-fixed-variant: '#464555'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-reading:
    fontFamily: Literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 20px
  gutter-md: 16px
  card-padding: 24px
  section-gap: 32px
---

## Brand & Style

This design system establishes a premium, tactile, and playful environment for digital reading. It merges the structural clarity of **Neo-Brutalism** with the softness of contemporary lifestyle apps. The personality is curated, scholarly, and approachable, designed to reduce digital eye strain while maintaining a high-energy visual interest through layout.

**Core Aesthetics:**
- **Neo-Brutalist Light:** High-contrast 2px black borders and structural dividers paired with organic, ultra-rounded shapes.
- **Tactile Depth:** Elements appear as physical cards resting on a soft base layer, using a combination of hard outlines and soft ambient shadows.
- **Premium Utility:** A focus on generous whitespace and "breathable" layouts ensures that the complexity of PDF management feels effortless and inviting.

## Colors

The palette is built on a foundation of "Functional Pastels"—colors that categorize content without overwhelming the reader's focus.

- **Primary (Mint):** Used for primary actions, progress indicators, and active states.
- **Secondary (Cream):** The default background for card surfaces and reading panels to reduce blue-light harshness.
- **Tertiary (Lavender):** Reserved for organizational metadata, categories, and secondary tags.
- **Quaternary (Soft Rose):** Used for highlighting, bookmarks, and alerts.
- **Neutral (Ink Black):** Used for all structural borders (2px), primary text, and iconography to ensure maximum legibility.

**Dark Mode Strategy:**
In Dark Mode, the cream background shifts to deep charcoal (#121826). Pastels are desaturated by 20% and darkened slightly to maintain contrast while preserving the "tinted" personality of the brand. Borders remain prominent but shift from pure black to a high-contrast off-white or light grey.

## Typography

The system employs a dual-font strategy to separate the "Utility" of the app from the "Experience" of reading.

- **UI & Navigation:** **Plus Jakarta Sans** is used for all interface elements. Its geometric but soft nature matches the rounded corner language of the components. High weights (700-800) are used for headlines to maintain the Neo-Brutalist impact.
- **Reading Experience:** **Literata** is defined for long-form text and book metadata. As a serif designed specifically for digital screens, it provides the "Premium Book" feel requested, ensuring high legibility during extended reading sessions.
- **Scaling:** Mobile headlines scale down to a maximum of 28px for long book titles to prevent awkward wrapping.

## Layout & Spacing

The layout philosophy is "Spacious & Structured." It uses a **4px base grid** to ensure mathematical harmony across all components.

- **Mobile Layout:** A single-column vertical flow for the library, utilizing 20px side margins to prevent content from feeling cramped against the device edges.
- **The "Bento" Grid:** For the dashboard and discovery screens, use a 2-column layout with 16px gutters, where book cards occupy equal widths.
- **Safe Areas:** Bottom navigation is elevated with a 32px bottom offset (including safe area) to ensure "thumb-friendly" interaction.
- **Reading Mode:** Content follows a "Reading Well" layout—fixed maximum width of 600px centered on the screen, even on larger tablets, to maintain optimal line lengths.

## Elevation & Depth

This design system avoids traditional realistic shadows in favor of **Structural Stacking**.

- **Level 0 (Base):** The main background (Cream or Charcoal).
- **Level 1 (Cards/Buttons):** 2px solid Ink Black border. No shadow or a very slight "hard" shadow offset by 2px (Neo-Brutalist style).
- **Level 2 (Active/Floating):** When a card is pressed or an element is "active," it gains a 4px hard shadow offset (bottom-right) and a slight upward translation (-2px).
- **Overlays:** Modals and bottom sheets use a 40% opacity backdrop blur (Glassmorphism) behind the card to maintain context while focusing the user's attention.

## Shapes

The shape language is defined by **Extreme Rounding**, which softens the harshness of the Neo-Brutalist borders.

- **Standard Elements:** Buttons and input fields use `rounded-lg` (1rem/16px).
- **Container Elements:** Book cards and main layout containers use `rounded-xl` (1.5rem/24px) or higher (up to 32px for large dashboard cards).
- **Interactive Feedback:** Indicators (like page numbers or unread badges) are always pill-shaped to contrast against the more structured book cards.

## Components

### Buttons
- **Primary:** Primary Mint background, 2px Ink Black border, 4px hard shadow on hover/active. 
- **Ghost:** No background, 2px Ink Black border, Serif typography for a "literary" feel.

### Book Cards
- Vertical aspect ratio (approx 2:3).
- 2px border surrounding the cover image.
- Title and Author placed below the card in Serif typography.
- Progress bars are integrated as a thin 4px primary-colored line at the very bottom of the card border.

### Bottom Navigation
- Floating container style.
- Rounded-xl corners.
- 2px Ink Black border.
- Active state: The icon is enclosed in a pastel-colored circle (Primary Mint).

### Input Fields (Search/Annotations)
- Secondary Cream background.
- 2px Ink Black border.
- Placeholder text in UI Sans, 50% opacity.
- Focus state: Border thickness remains 2px but changes color to Primary Mint or adds a 2px offset "halo."

### Lists (Table of Contents)
- Separated by dashed 2px Ink Black lines.
- Generous vertical padding (16px) to allow for easy tapping on mobile.