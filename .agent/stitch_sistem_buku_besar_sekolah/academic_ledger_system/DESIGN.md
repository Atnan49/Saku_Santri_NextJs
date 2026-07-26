---
name: Academic Ledger System
colors:
  surface: '#fdf9f1'
  surface-dim: '#dddad2'
  surface-bright: '#fdf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3eb'
  surface-container: '#f1ede6'
  surface-container-high: '#ece8e0'
  surface-container-highest: '#e6e2da'
  on-surface: '#1c1c17'
  on-surface-variant: '#404945'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e8'
  outline: '#717975'
  outline-variant: '#c0c8c4'
  surface-tint: '#396759'
  primary: '#154539'
  on-primary: '#ffffff'
  primary-container: '#2f5d50'
  on-primary-container: '#a3d4c3'
  inverse-primary: '#a0d1c0'
  secondary: '#516071'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1f5'
  on-secondary-container: '#556475'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea62c'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceddc'
  primary-fixed-dim: '#a0d1c0'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#204f42'
  secondary-fixed: '#d4e4f8'
  secondary-fixed-dim: '#b8c8dc'
  on-secondary-fixed: '#0d1d2b'
  on-secondary-fixed-variant: '#394858'
  tertiary-fixed: '#ffe08e'
  tertiary-fixed-dim: '#ecc246'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#fdf9f1'
  on-background: '#1c1c17'
  surface-variant: '#e6e2da'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  number-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
  number-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is built upon the concept of the "Digital Ledger"—a bridge between the historical gravity of physical academic records and the efficiency of modern financial software. The brand personality is **authoritative, dependable, and meticulous**, designed to evoke the feeling of holding a high-quality certificate or an official school registry.

The design style follows a **Modern Institutional** approach. It rejects the trend of soft, pill-shaped UI in favor of structured, line-based layouts that prioritize clarity and information density. By combining the warmth of cream-toned "paper" surfaces with sharp, precise typography, the UI communicates a sense of permanence and trust essential for educational financial management.

Key aesthetic principles:
- **Academic Rigor:** Heavy use of vertical and horizontal lines to create clear data hierarchies.
- **Warm Authority:** A palette that avoids the coldness of pure white/blue in favor of traditional ink and paper tones.
- **Document-Centric:** Layouts often mimic the structure of physical forms, receipts, and ledger books.

## Colors

The color palette is derived from traditional bookkeeping materials. 

- **Ink Navy (#1C2B3A):** Used for primary text and structural UI elements. It provides higher legibility than pure black while feeling more sophisticated.
- **Paper Cream (#FAF6EE):** The primary background color. It reduces eye strain and reinforces the "physical document" metaphor.
- **Ledger Green (#2F5D50):** Used for primary actions and "in-credit" status. It represents financial health and institutional growth.
- **Stamp Gold (#C9A227):** Reserved for "Paid" statuses and significant milestones. It should feel like a foil stamp or an official seal.
- **Alert Rust (#B5482A):** Used for arrears, late payments, and errors. It is firm and visible without being aggressive.
- **Line Grey (#D8D2C4):** The foundational color for all borders, table dividers, and grid lines.

## Typography

This design system employs a tri-font strategy to balance institutional prestige with functional utility.

1.  **Headlines (Source Serif 4):** Used for page titles, section headers, and names. The serif typeface provides the "official" look of a school charter or diploma.
2.  **Body (IBM Plex Sans):** A neutral, highly legible sans-serif for descriptions, inputs, and general navigation. It ensures clarity in dense administrative tasks.
3.  **Data (JetBrains Mono):** All financial figures, dates, and ID numbers must use this monospaced font. The use of `tabular-nums` ensures that decimals and columns align perfectly in ledger tables, preventing accounting errors.

**Mobile Scaling:** Headlines larger than 24px should scale down by 20% on mobile devices to ensure they do not break across too many lines.

## Layout & Spacing

The layout is governed by a **Strict Grid System** that mimics the columns of a physical ledger book. 

- **Grid Model:** A 12-column fixed grid for desktop (1200px max width) and a fluid 4-column grid for mobile.
- **Rhythm:** An 8px base unit drives all spacing. 
- **Dividers:** Instead of using whitespace alone to separate content, use 1px `line-grey` borders. This creates the "cells" characteristic of a ledger.
- **Density:** Elements are packed with moderate density (`16px` padding) to allow for the viewing of large data sets without excessive scrolling.

## Elevation & Depth

This design system avoids the use of drop shadows and blur effects to maintain its flat, paper-like aesthetic. Depth is communicated through **Tonal Layering** and **Line Hierarchy**:

- **Level 0 (Base):** `paper-cream` background.
- **Level 1 (Cards/Tables):** White (#FFFFFF) surfaces with 1px `line-grey` borders.
- **Level 2 (Modals/Overlays):** White surfaces with a slightly thicker 2px `ink-navy` border to denote focus. No background dimming is required; instead, use a subtle 10% `ink-navy` tint over the background.
- **Contrast:** Elements never "float"; they are always contained within a border or separated by a ruled line.

## Shapes

The shape language is **geometric and restrained**. 

- **Corners:** A uniform `4px` radius (Soft) is applied to buttons, input fields, and containers. This provides just enough approachability to feel "warm" while maintaining the rigid structure of an official document.
- **Exceptions:** Status badges (Stamps) may use `0px` (Sharp) corners and can be rotated by -1 to -3 degrees to mimic a physical ink stamp applied to paper.
- **Pills:** Avoid pill-shaped elements entirely. They conflict with the institutional, document-driven nature of the system.

## Components

### Buttons
Primary buttons use `ledger-green` with white text. Secondary buttons use a `1px` `ink-navy` border with no fill. All buttons use `label-caps` typography for a professional, "form-action" feel.

### Stamp Badges
Unlike standard rounded chips, status indicators are rectangular with sharp corners. 
- **Paid:** `stamp-gold` background, white text, slightly rotated.
- **Overdue:** `alert-rust` background, white text.
- **Pending:** `line-grey` background, `ink-navy` text.

### Ledger Tables
Tables are the heart of the system. Use `1px` `line-grey` borders for every cell (vertical and horizontal). Header rows should have a subtle `paper-cream` tint. Financial columns must use `number-md` and be right-aligned.

### Digital Receipts
The signature element of the system. Receipts are rendered on a white container with a 1px dashed border (simulating a tear-off). They include:
- A light `ink-navy` watermark of the school seal in the center.
- A "Paid" stamp graphic in `stamp-gold`.
- A dedicated signature line at the bottom with `Source Serif 4` italicized labels.

### Input Fields
Inputs are white with `1px` `line-grey` borders. On focus, the border changes to `ledger-green` 2px. Labels always sit above the input in `label-caps`.