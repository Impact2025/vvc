# Design System Strategy: The Kinetic Minimalist

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Gallery."** 

Youth sports photography and live data are inherently high-energy. To achieve a premium "Apple meets Linear" feel, we must counteract that chaos with a highly structured, gallery-like environment. We avoid the "amateur sports app" trap by utilizing expansive whitespace and a rigid adherence to thin-stroke geometry. The experience should feel like a high-end editorial lookbook for the next generation of athletes—crisp, authoritative, and frictionless.

We break the "template" look through **intentional asymmetry**: large, left-aligned display type balanced by significant negative space on the right, and "breaking the container" where action photography slightly overlaps its containing bounds to create a sense of forward motion.

---

## 2. Colors & Surface Architecture
This system relies on a high-contrast, clinical palette. The brilliance comes from the restraint shown in the application of the primary accents.

### Palette Roles
- **Primary (`#9a4600` / `#f47920`):** The "Pulse." Use exclusively for critical action (CTAs), live match indicators, and hero statistics. It is a beacon, not a background.
- **Secondary (`#1a3e8f`):** The "Anchor." Used for headlines and navigation states to provide a sense of established authority.
- **Surface Strategy:** 
    - `surface_container_lowest` (#ffffff): Use for the primary page background to maximize "breathability."
    - `surface_container_low` (#f6f3f2): Use for subtle sectioning.
    - `surface_container_highest` (#e5e2e1): Use for recessed areas like search bars or inactive card states.

### The "No-Line" Rule
While the original brief mentions borders, as a Senior Director, I am implementing the **"Logical Boundary"** rule. Do not use borders to section off large areas of the app. Instead, use a shift from `surface_container_lowest` to `surface_container_low`. Use the `outline_variant` (#dec0b1) at a 20% opacity only when two elements of the exact same color must sit adjacent to one another.

### Signature Texture
To ensure the PWA feels premium rather than "flat," use the `surface_variant` (#e5e2e1) as a very subtle 1px "inner stroke" on cards. This mimics the physical edge of a high-quality printed card without using outdated drop shadows.

---

## 3. Typography
We use a dual-typeface system to balance modern geometry with high-readability utility.

*   **Headings (Plus Jakarta Sans):** Our "Voice." Bold, geometric, and spacious. Use `display-lg` for hero headlines with a -0.02em letter-spacing to create a "tight," professional editorial look.
*   **Body (Manrope):** Our "Utility." Manrope provides a more technical, functional feel than standard sans-serifs, perfect for player stats and match reports.
*   **Stylistic Instruction:** 
    - **Scores:** Use `headline-lg` in Bold weight. 
    - **Labels/Chips:** Use `label-md` in **ALL CAPS** with a +0.05em letter-spacing. This is our signature for secondary metadata.

---

## 4. Elevation & Depth
In a "Flat & Crisp" philosophy, depth is achieved through **Tonal Layering** rather than shadows.

*   **The Layering Principle:** Treat the UI as a series of stacked sheets. 
    - Background: `surface`
    - Content Card: `surface_container_lowest` (White)
    - Nested Item (e.g., a player stat inside a card): `surface_container_low`
*   **The Ghost Border:** For floating elements like Modals or Popovers, do not use a heavy shadow. Use a 1px border using `outline_variant` (#dec0b1) at 15% opacity and a "Micro-Shadow": `0px 4px 12px rgba(13, 13, 13, 0.04)`.
*   **Flat Crispness:** All containers must use the `md` (0.375rem) or `lg` (0.5rem) roundedness scale. Avoid `full` rounding except for status chips to maintain a sophisticated, architectural feel.

---

## 5. Components

### Buttons
- **Primary:** Background: `primary_container` (#f47920), Text: `on_primary_container`. No shadow. Sharp corners (`md` scale).
- **Secondary:** Background: Transparent, Border: 1px solid `secondary` (#1a3e8f), Text: `secondary`.
- **Tertiary:** Text only, `on_surface_variant`, all caps, bold.

### Chips (Status & Filters)
- **Live Match Chip:** Background: `primary` (#9a4600), Text: White, All Caps.
- **Filter Chip:** Background: `surface_container_high`, Border: None. When active: Background: `secondary`, Text: White.

### Input Fields
- **Default State:** Background: `surface_container_lowest`, Border: 1px solid `outline_variant` (#dec0b1). 
- **Focus State:** Border color shifts to `secondary` (#1a3e8f). No glow.

### Cards (The "Scoreboard" Variant)
- No dividers. Separate the home team from the away team using a 24px vertical gutter and a subtle background shift (`surface_container_low`) on the "Match Details" footer of the card.
- Use `headline-lg` for scores, centered, with the `primary` color only used for the winning score.

### Match Timeline (Additional Component)
- A vertical line using `outline_variant` at 0.5px width. Events (Goals, Cards) are marked with 8x8px geometric shapes (squares for goals, triangles for subs) rather than rounded circles to maintain the "Linear" aesthetic.

---

## 6. Do's and Don'ts

### Do
- **DO** use excessive whitespace. If a section feels "full," add 16px of padding.
- **DO** use thin-outlined icons (1px or 1.5px stroke).
- **DO** align all text to a strict 8px baseline grid to ensure the "Linear" level of precision.
- **DO** use "VVC Orange" only for things that are happening *now* (Live scores, active buttons).

### Don't
- **DON'T** use 100% black text. Use `Text Primary` (#0D0D0D) to keep the contrast high but sophisticated.
- **DON'T** use "Glassmorphism" or blurs. This system is about "Paper and Ink" precision.
- **DON'T** use rounded buttons (pill shapes). Use the `md` corner radius for a more professional, "Pro-Tools" appearance.
- **DON'T** use divider lines between list items. Use 12px of vertical space instead.