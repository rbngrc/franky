---
name: Franky
version: alpha
colors:
  primary: "#1565C0"
  primary-dark: "#0D47A1"
  primary-light: "#42A5F5"
  error: "#E53935"
  error-light: "#FF6F60"
  accent: "#FFD700"
  accent-light: "#FFF176"
  neutral: "#607D8B"
  neutral-light: "#90A4AE"
  neutral-dark: "#37474F"
  success: "#2E7D32"
  success-bg: "#E8F5E9"
  warning: "#F57F17"
  warning-bg: "#FFF8E1"
  error-bg: "#FFEBEE"
  background: "#E8EDF2"
  surface: "#F5F7FA"
  white: "#FFFFFF"
  on-surface: "#1A1A2E"
  on-surface-secondary: "#546E7A"
  border: "#CFD8DC"
  border-light: "#E8EDF2"
typography:
  heading:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: 2.5rem
    fontWeight: 400
    letterSpacing: 2px
    lineHeight: 1.1
  heading-section:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: 1.3rem
    fontWeight: 400
    letterSpacing: 1px
    lineHeight: 1.1
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 0.95rem
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.85rem
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.9rem
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace"
    fontSize: 0.85rem
    fontWeight: 400
    lineHeight: 1.4
  badge:
    fontFamily: "Inter, sans-serif"
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.2
rounded:
  none: 0
  sm: 6px
  md: 8px
  lg: 12px
  full: 20px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  xxl: 3rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0.6rem 1.2rem
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    border: 1px solid "{colors.border}"
    rounded: "{rounded.md}"
    padding: 0.6rem 1.2rem
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    border: 1px solid "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 0.6rem 1.2rem
  button-danger:
    backgroundColor: none
    textColor: "{colors.error}"
    typography: "{typography.label}"
    padding: 0
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    border: 1px solid "{colors.border-light}"
    padding: "{spacing.lg}"
    shadow: 0 2px 8px rgba(0,0,0,0.04)
  input:
    backgroundColor: "{colors.white}"
    border: 1px solid "{colors.border}"
    rounded: "{rounded.sm}"
    padding: 0.5rem 0.75rem
    typography: "{typography.body}"
  input-focus:
    borderColor: "{colors.primary}"
    shadow: 0 0 0 3px rgba(21, 101, 192, 0.12)
  badge:
    rounded: "{rounded.full}"
    padding: 0.2rem 0.6rem
    typography: "{typography.badge}"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
  badge-danger:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error}"
  table-th:
    typography: "{typography.label}"
    textColor: "{colors.on-surface-secondary}"
    borderBottom: 2px solid "{colors.border}"
    padding: 10px
  table-td:
    borderBottom: 1px solid "{colors.border-light}"
    padding: 10px
  tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm} {rounded.sm} 0 0"
    padding: 10px 20px
  tab-inactive:
    backgroundColor: "#e0e0e0"
    textColor: "#333"
    rounded: "{rounded.sm} {rounded.sm} 0 0"
    padding: 10px 20px
  compliance-bar:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    border: 1px solid "{colors.border-light}"
    padding: 1.25rem 1.5rem
  compliance-bar-fill:
    rounded: "{rounded.lg}"
    textColor: "{colors.white}"
    typography: "{typography.badge}"
    letterSpacing: 1px
---

# Design System: Franky — EUDR Compliance App

## 1. Overview

Franky es una aplicación de gestión forestal centrada en el cumplimiento EUDR. Su identidad visual combina **profesionalidad industrial** con **claridad administrativa**. La paleta azul-mate transmite confianza y solvencia técnica, mientras que el dorado aporta un toque distintivo ("the golden touch") en elementos decorativos como la estrella Franky y badges de cumplimiento.

La UI es **limpia, funcional y orientada a datos** — tablas, formularios y tarjetas de detalle son los bloques fundamentales. El diseño prioriza la legibilidad de la información sobre el ornamento, con una jerarquía tipográfica clara: titulares llamativos en Bebas Neue y cuerpo funcional en Inter.

## 2. Colors

### Brand Palette

| Token | Hex | Role |
|-------|-----|------|
| `--franky-blue` | `#1565C0` | Primary — CTAs, links, acentos activos, tab activa |
| `--franky-blue-dark` | `#0D47A1` | Hover states, títulos, gradiente primary |
| `--franky-blue-light` | `#42A5F5` | Acentos secundarios, hover suave |
| `--franky-red` | `#E53935` | Error, peligro, incumplimiento EUDR |
| `--franky-red-light` | `#FF6F60` | Variante error suave |
| `--franky-gold` | `#FFD700` | Accent — estrella Franky, badges decorativos |
| `--franky-gold-light` | `#FFF176` | Variante gold suave |

### Neutral Palette

| Token | Hex | Role |
|-------|-----|------|
| `--franky-metal` | `#607D8B` | Neutral base |
| `--franky-metal-light` | `#90A4AE` | Secondary text, metadatos |
| `--franky-metal-dark` | `#37474F` | Neutral oscuro |

### Surface & Text

| Token | Hex | Role |
|-------|-----|------|
| `--color-background` | `#E8EDF2` | Page background |
| `--color-surface` | `#F5F7FA` | Card/surface backgrounds |
| `--color-white` | `#FFFFFF` | Pure white cards, inputs |
| `--color-text-primary` | `#1A1A2E` | Body text, headings |
| `--color-text-secondary` | `#546E7A` | Secondary text, labels muted |
| `--color-border` | `#CFD8DC` | Borders generales |
| `#E8EDF2` | — | Border sutil (cards, tablas) |

### Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| Success | `#2E7D32` | EUDR cumplimiento, estados OK |
| Success bg | `#E8F5E9` | Badge success background |
| Warning | `#F57F17` | Cumplimiento parcial |
| Warning bg | `#FFF8E1` | Badge warning background |
| Error bg | `#FFEBEE` | Badge error / error box background |

### Gradients

- **Button primary**: `linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)`

## 3. Typography

### Font Stack

| Usage | Font | Fallback |
|-------|------|----------|
| **Headings** (h1-h4) | `Bebas Neue` | `sans-serif` |
| **Body / UI** | `Inter` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| **Code / Trazabilidad** | `SFMono-Regular` | `Consolas, 'Liberation Mono', Menlo, monospace` |

### Type Scale

| Element | Font | Size | Weight | Letter-spacing | Line-height |
|---------|------|------|--------|----------------|-------------|
| Page title (`.page-title`) | Bebas Neue | `2.5rem` | 400 | `2px` | `1.1` |
| Section title (`.section-title`) | Bebas Neue | `1.3rem` | 400 | `1px` | `1.1` |
| Body | Inter | `0.95rem` | 400 | normal | `1.6` |
| Small body | Inter | `0.85rem` | 400 | normal | `1.4` |
| Labels / Table headers | Inter | `0.9rem` | 600 | normal | `1.4` |
| Buttons | Inter | `0.9rem` | 600 | normal | `1.4` |
| Detail values | Inter | `0.95rem` | 400 | normal | `1.8` |
| Detail labels | Inter | `0.85rem` | 600 | normal | `1.8` |
| Badges | Inter | `0.75rem` | 700 | normal | `1.2` |
| Monospace code | SFMono | `0.85rem` | 400 | normal | `1.4` |
| Empty state | Inter | `1.1rem` | 400 | normal | — |
| Loading text | Inter | `1.2rem` | 400 | normal | — |

### Text Utilities

| Class | Usage |
|-------|-------|
| `.text-muted` | Secondary text color |
| `.text-success` | `#2E7D32` |
| `.text-danger` | `#E53935` |
| `.text-warning` | `#F57F17` |
| `.text-bold` | Font weight 600 |
| `.text-mono` | Monospace font stack |

## 4. Layout

### Page Structure

| Property | Value |
|----------|-------|
| Max width | `1200px` |
| Page padding | `1rem` |
| Margin | `0 auto` (centered) |
| Width | `100%` |

### Grid Systems

| Class | Template | Gap | Breakpoint |
|-------|----------|-----|------------|
| `.stats-grid` | `repeat(auto-fit, minmax(200px, 1fr))` | `1.25rem` | — |
| `.two-col-grid` | `1fr 1fr` → `1fr` at 768px | `1.5rem` | `768px` |
| `.detail-grid` | `1fr 1fr` → `1fr` at 768px | `0.75rem` | `768px` |

### Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| `768px` | Two-col → single column; page title `2rem` |

### Spacing Scale

| Token | rem | px (approx) |
|-------|-----|-------------|
| xs | `0.25rem` | 4px |
| sm | `0.5rem` | 8px |
| md | `1rem` | 16px |
| lg | `1.5rem` | 24px |
| xl | `2rem` | 32px |
| xxl | `3rem` | 48px |

## 5. Elevation & Depth

| Element | Shadow |
|---------|--------|
| Card (`.card`) | `0 2px 8px rgba(0,0,0,0.04)` |
| Button primary | `0 2px 8px rgba(21, 101, 192, 0.2)` |
| Button primary hover | `0 4px 14px rgba(21, 101, 192, 0.3)` |
| Map container | `0 2px 12px rgba(0,0,0,0.1)` |
| Compliance bar card | `0 2px 8px rgba(0,0,0,0.04)` |

### Animation

| Element | Property | Duration | Curve |
|---------|----------|----------|-------|
| Buttons hover | `transform translateY(-1px)` | `0.25s` | ease |
| Buttons active | `transform translateY(0)` | `0.25s` | ease |
| Links hover | `color` | `0.2s` | ease |
| Quick link hover | `transform translateX(4px)` | `0.2s` | ease |
| Compliance bar fill | `width` | `1s` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Input focus | `border-color, box-shadow` | `0.2s` | ease |
| Loading bar | `transform translateX` | `1s` | `ease-in-out infinite` |

## 6. Shapes

| Token | Value | Applied to |
|-------|-------|------------|
| `rounded.none` | `0` | — |
| `rounded.sm` | `6px` | Inputs, selects, error boxes |
| `rounded.md` | `8px` | Buttons, quick links |
| `rounded.lg` | `12px` | Cards, compliance bar, map container |
| `rounded.full` | `20px` | Badges, compliance bar fill |

## 7. Components

### Buttons

**`.btn` base**: inline-flex, gap 0.4rem, Inter 600, no border, white-space nowrap, transition 0.25s.

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| `.btn-primary` | `linear-gradient(135deg, #1565C0 → #0D47A1)` | White | — | Shadow intensifies |
| `.btn-secondary` | `var(--color-surface)` | On-surface | `1px solid var(--color-border)` | `#E8EDF2` bg |
| `.btn-outline` | White | Primary blue | `1px solid #1565C0` | `rgba(21, 101, 192, 0.06)` bg |
| `.btn-danger` | None | Error red | None (text-only) | Underline |
| `.btn-sm` | — | — | — | Padding 0.4rem 0.8rem, font 0.85rem |

**States**: hover → translateY(-1px); active → translateY(0); disabled → opacity 0.6, cursor not-allowed.

### Cards (`.card`)

White background, 12px radius, 1px `#E8EDF2` border, subtle shadow, 1.5rem padding.

### Tables

| Element | Style |
|---------|-------|
| Wrapper | `overflow-x: auto` |
| Min width | `600px` |
| Header | Bottom border 2px `#CFD8DC`, label style, secondary text |
| Cells | Padding 10px, bottom border 1px `#E8EDF2` |
| Row hover | `rgba(21, 101, 192, 0.03)` |
| Links in table | Primary blue, no underline → underline on hover |

### Badges

Pill shape (20px radius), 0.75rem bold, inline-block.

| Variant | Background | Text |
|---------|-----------|------|
| `.badge-success` | `#E8F5E9` | `#2E7D32` |
| `.badge-warning` | `#FFF8E1` | `#F57F17` |
| `.badge-danger` | `#FFEBEE` | `#D32F2F` |

### Forms

| Element | Style |
|---------|-------|
| `.form-card` | Max-width 600px, flex column, gap 1rem, card styling |
| `.form-label` | 0.9rem, weight 500 |
| `.form-input / .form-select` | Full width, 0.5rem 0.75rem padding, 6px radius, Inter, transition |
| `:focus` | Blue border + 3px rgba(21, 101, 192, 0.12) ring |
| `.error` | Red border |
| `.form-error` | 0.8rem, red |
| `.form-actions` | Flex row, gap 0.5rem |

### Tabs

| Element | Style |
|---------|-------|
| `.tab-bar` | Flex row, no gap |
| `.tab` | 10px 20px padding, 6px radius top only, Inter 600 |
| `.tab-active` | Primary blue bg, white text |
| `.tab-inactive` | `#e0e0e0` bg, `#333` text, hover → `#d0d0d0` |
| `.tab-content` | 1.5rem padding, 1px `#e0e0e0` border, no top border, radius bottom |

### Compliance Bar

Card-like container with a horizontal progress bar. Fill has gradient-like animation (1s cubic-bezier), white text centered, 12px radius overflow hidden.

### States

| Component | Style |
|-----------|-------|
| Empty state | Centered text, 3rem padding, secondary text color, icon 3rem |
| Loading | Centered, 2rem padding, animated bar (blue fill sliding on gray bg) |
| Error box | Red left border (4px), `#FFEBEE` bg, red text, 6px radius |

### Quick Links

Block links with 8px radius, primary blue, hover → light blue bg + translateX(4px).

## 8. Do's and Don'ts

### Do
- Usar **Bebas Neue** exclusivamente para títulos (page-title, section-title) — no para body text
- Usar **Inter** para todo el texto funcional (tablas, formularios, labels, botones)
- Aplicar el **gradiente azul** en botones primary para mantener coherencia visual
- Usar **badges** para indicar estado de cumplimiento EUDR/PEFC/SURE
- Mantener tablas responsive con `overflow-x: auto`
- Usar `AbortController` en hooks para evitar race conditions
- Usar `ErrorBoundary` por página (no global, excepto raíz)

### Don't
- No usar gold (`#FFD700`) como color funcional — es decorativo (estrella Franky)
- No mezclar Bebas Neue con Inter en el mismo bloque de texto
- No aplicar sombras excesivas — mantener elevación sutil
- No usar inline styles — usar los módulos CSS (`src/styles/*.module.css`) y las variables `--franky-*` / `--color-*`
- No usar CORS en producción si se puede usar el proxy Vite
- No generar QR ni CSV desde backend — hacerlo client-side
