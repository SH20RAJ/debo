# 🦉 Duolingo Design System — Complete Reference

> **Source**: [design.duolingo.com](https://design.duolingo.com/) + extensive research
> **Last Updated**: May 2025
> **Internal Codename**: "Hoo-Dini" / DDS (Duolingo Design System)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Buttons](#4-buttons)
5. [Components](#5-components)
6. [Illustration & Iconography](#6-illustration--iconography)
7. [Motion & Animation](#7-motion--animation)
8. [Logo & Brand Identity](#8-logo--brand-identity)
9. [Photography](#9-photography)
10. [Brand Voice & Tone](#10-brand-voice--tone)
11. [Accessibility](#11-accessibility)
12. [CSS Reference Implementation](#12-css-reference-implementation)

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Playful & Engaging** | Gamification drives engagement — streaks, leaderboards, achievements |
| **Friendly & Approachable** | Rounded shapes, warm colors, no sharp edges |
| **Simple & Clear** | Minimal cognitive load, learning content is the focal point |
| **Rewarding & Motivating** | Immediate feedback loops for every interaction |

### Shape Language

Duolingo illustrations use **only three geometric shapes**:

- ✅ **Rounded Rectangle**
- ✅ **Circle**
- ✅ **Rounded Triangle**
- ❌ No pointy/sharp edges — ever

### Atomic Design Structure

| Level | Examples |
|-------|---------|
| **Atoms** | Colors, typography, icons, spacing tokens |
| **Molecules** | Buttons, input fields, badges |
| **Organisms** | Cards, headers, progress trackers, lesson screens |

---

## 2. Color System

### Core Brand Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Feather Green** | `#58CC02` | `rgb(88, 204, 2)` | Primary brand color, CTAs, success states |
| **Mask Green** | `#89E219` | `rgb(137, 226, 25)` | Secondary green, mascot, layering |

### Secondary Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Macaw** (Blue) | `#1CB0F6` | `rgb(28, 176, 246)` | Info states, links, highlights |
| **Cardinal** (Red) | `#FF4B4B` | `rgb(255, 75, 75)` | Error states, hearts/lives, alerts |
| **Bee** (Yellow) | `#FFC800` | `rgb(255, 200, 0)` | Warnings, streaks, celebrations |
| **Fox** (Orange) | `#FF9600` | `rgb(255, 150, 0)` | Accents, notifications, warmth |
| **Beetle** (Purple) | `#CE82FF` | `rgb(206, 130, 255)` | Premium, special features |
| **Humpback** (Deep Blue) | `#2B70C9` | `rgb(43, 112, 201)` | Secondary info, depth |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Eel** | `#4B4B4B` | `rgb(75, 75, 75)` | Primary text, headings |
| **Wolf** | `#777777` | `rgb(119, 119, 119)` | Secondary text |
| **Hare** | `#AFAFAF` | `rgb(175, 175, 175)` | Placeholder text, disabled |
| **Swan** | `#E5E5E5` | `rgb(229, 229, 229)` | Borders, dividers |
| **Polar** | `#F7F7F7` | `rgb(247, 247, 247)` | Subtle backgrounds |
| **Snow** | `#FFFFFF` | `rgb(255, 255, 255)` | Primary background |

### Duo Mascot Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Wing Overlay** | `#43C000` | Wing shadow/overlay |
| **Beak Inner** | `#B66E28` | Inside of beak |
| **Beak Lower / Feet** | `#F49000` | Lower beak, feet |
| **Beak Upper** | `#FFC200` | Upper beak |
| **Beak Highlight** | `#FFDE00` | Beak shine |
| **Tongue Pink** | `#FFCAFF` | Tongue |

### Color Usage Rules

- ❌ **Never use pure gray** — considered "lifeless"
- ✅ **Snow** (`#FFFFFF`) is the primary background
- ✅ Use **Feather Green** for all primary actions
- ✅ Secondary colors add "splashes of delight"
- ✅ **Eel** for all primary typography

### Button Color Mapping

| Button Type | Background | Shadow/Border | Text |
|-------------|-----------|---------------|------|
| Primary (Green) | `#58CC02` | `#46A302` | `#FFFFFF` |
| Danger (Red) | `#FF4B4B` | `#E53535` | `#FFFFFF` |
| Info (Blue) | `#1CB0F6` | `#1899D6` | `#FFFFFF` |
| Secondary | `#FFFFFF` | `#E5E5E5` | `#4B4B4B` |
| Disabled | `#E5E5E5` | none | `#AFAFAF` |

---

## 3. Typography

### Font Families

#### Feather Bold (Display / Headlines)

- **Type**: Custom bespoke typeface
- **Designer**: Krista Radoeva at Fontsmith (now Monotype), 2019
- **Collaboration**: Johnson Banks agency
- **Availability**: ❌ Proprietary — not publicly available
- **Inspired by**: Duo the owl's feathered forms, rounded terminals
- **Free Alternative**: [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts)

#### DIN Next Rounded (UI / Body)

- **Type**: Commercial geometric sans-serif (Monotype)
- **Character**: Friendly, softened, highly readable
- **Free Alternative**: [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) or [Varela Round](https://fonts.google.com/specimen/Varela+Round)

### Feather Bold Specifications

| Property | Value |
|----------|-------|
| **Usage** | Headlines, short statements (≤10 words) |
| **Case** | Always lowercase (capitalize only proper nouns) |
| **Alignment** | Always left-aligned, never justified |
| **Line Height** | 100–110% |
| **Tracking** | -20 |
| **Kerning** | 0, optical |
| **Min Size (Print)** | 30pt |
| **Min Size (Screen)** | 30px |

### DIN Next Rounded Specifications

| Property | Value |
|----------|-------|
| **Usage** | Body copy, subheadings, UI text, long headlines (>10 words) |
| **Line Height** | 140% |
| **Tracking** | 0 |
| **Kerning** | 0, optical |
| **Min Size (Print)** | 14pt |
| **Min Size (Screen)** | 14px |

### Combining Typefaces

| Rule | Detail |
|------|--------|
| **Size Ratio** | Feather Bold should be ~150% larger than DIN Next Rounded |
| **Same Sentence** | ❌ Never combine both fonts in the same sentence |
| **Hierarchy** | DIN Next Rounded must never be larger than Feather Bold |
| **Separator** | Use colons or periods between heading and body |
| **Leading** | Use equal leading throughout a block when combining |

### Suggested Type Scale (Web Implementation)

```
Display:    48px / line-height: 1.05  (Feather Bold)
H1:         40px / line-height: 1.1   (Feather Bold)
H2:         32px / line-height: 1.1   (Feather Bold)
H3:         24px / line-height: 1.2   (DIN Next Rounded Bold)
H4:         20px / line-height: 1.3   (DIN Next Rounded Bold)
Body:       16px / line-height: 1.4   (DIN Next Rounded)
Body Small: 14px / line-height: 1.4   (DIN Next Rounded)
Caption:    12px / line-height: 1.4   (DIN Next Rounded)
```

---

## 4. Buttons

### Signature 3D Button Effect

The hallmark of Duolingo's UI — pill-shaped buttons with a tactile, raised appearance.

#### Structure

```
┌─────────────────────────┐
│                         │  ← Background color
│      BUTTON TEXT        │
│                         │
└─────────────────────────┘
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← box-shadow (darker shade, 4-6px)
```

#### CSS Implementation

```css
/* === PRIMARY BUTTON === */
.btn-primary {
  padding: 13px 24px;
  border: none;
  border-radius: 16px;           /* Pill shape */
  background-color: #58CC02;     /* Feather Green */
  color: #FFFFFF;
  font-family: 'DIN Next Rounded', 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 5px 0 #46A302;  /* 3D edge — darker green */
  transition: transform 0.1s, box-shadow 0.1s;
  user-select: none;
}

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-primary:active {
  transform: translateY(5px);    /* Press down */
  box-shadow: none;              /* Remove edge */
}

.btn-primary:disabled {
  background-color: #E5E5E5;
  color: #AFAFAF;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
```

### Button Variants

#### Secondary Button
```css
.btn-secondary {
  padding: 13px 24px;
  border: 2px solid #E5E5E5;
  border-radius: 16px;
  background-color: #FFFFFF;
  color: #4B4B4B;
  font-weight: 800;
  box-shadow: 0 5px 0 #E5E5E5;
  transition: transform 0.1s, box-shadow 0.1s;
}
.btn-secondary:hover { background-color: #F7F7F7; }
.btn-secondary:active {
  transform: translateY(5px);
  box-shadow: none;
}
```

#### Danger Button
```css
.btn-danger {
  background-color: #FF4B4B;
  color: #FFFFFF;
  box-shadow: 0 5px 0 #E53535;
  border-radius: 16px;
  border: none;
  padding: 13px 24px;
  font-weight: 800;
}
```

#### Ghost / Outline Button
```css
.btn-ghost {
  background: transparent;
  color: #1CB0F6;
  border: 2px solid #1CB0F6;
  border-radius: 16px;
  padding: 13px 24px;
  font-weight: 800;
  box-shadow: none;
}
.btn-ghost:hover { background-color: #EEF9FF; }
```

### Button State Matrix

| State | Transform | Shadow | Background | Cursor |
|-------|-----------|--------|------------|--------|
| Default | `none` | `0 5px 0 [darker]` | Brand color | `pointer` |
| Hover | `none` | `0 5px 0 [darker]` | `brightness(1.05)` | `pointer` |
| Active | `translateY(5px)` | `none` | Brand color | `pointer` |
| Focus | `none` | `0 5px 0 [darker]` + outline ring | Brand color | `pointer` |
| Disabled | `none` | `none` | `#E5E5E5` | `not-allowed` |

---

## 5. Components

### Cards
```css
.duo-card {
  background: #FFFFFF;
  border: 2px solid #E5E5E5;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 0 #E5E5E5;
}
```

### Progress Bar
```css
.progress-track {
  background: #E5E5E5;
  border-radius: 999px;
  height: 16px;
  overflow: hidden;
}
.progress-fill {
  background: linear-gradient(to right, #58CC02, #89E219);
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}
```

### Input Fields
```css
.duo-input {
  padding: 14px 16px;
  border: 2px solid #E5E5E5;
  border-radius: 16px;
  font-family: 'DIN Next Rounded', 'Nunito', sans-serif;
  font-size: 16px;
  color: #4B4B4B;
  background: #FFFFFF;
  transition: border-color 0.2s;
}
.duo-input:focus {
  border-color: #1CB0F6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(28, 176, 246, 0.2);
}
.duo-input::placeholder { color: #AFAFAF; }
```

### Toggle Switch
```css
.duo-toggle {
  width: 48px; height: 28px;
  background: #E5E5E5;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.duo-toggle.active { background: #58CC02; }
.duo-toggle-knob {
  width: 24px; height: 24px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px; left: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}
.duo-toggle.active .duo-toggle-knob {
  transform: translateX(20px);
}
```

### Badges / XP Chips
```css
.duo-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  background: #FFC800;
  color: #4B4B4B;
}
```

### Streak Counter
```css
.duo-streak {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #FF9600;
  font-weight: 800;
  font-size: 17px;
}
.duo-streak-flame { font-size: 24px; }
```

### Gamification Elements

| Element | Icon | Color | Purpose |
|---------|------|-------|---------|
| **Streak** | 🔥 Flame | `#FF9600` Fox | Daily retention |
| **XP** | ⭐ Star | `#FFC800` Bee | Progress reward |
| **Hearts** | ❤️ Heart | `#FF4B4B` Cardinal | Lives/mistakes |
| **Gems** | 💎 Diamond | `#1CB0F6` Macaw | Currency |
| **Crown** | 👑 Crown | `#FFC800` Bee | Mastery level |

---

## 6. Illustration & Iconography

### Construction Rules

| Rule | Detail |
|------|--------|
| **Shapes Used** | Rounded rectangle, circle, rounded triangle only |
| **Target** | ~15 shapes per illustration |
| **Edges** | Always rounded — never pointy |
| **Perspective** | Flat — depth via line of sight, not 3D |
| **Shadows** | Pill-shaped shadows only |
| **Simplicity** | Use fewest shapes to communicate the idea |
| **Rhythm** | Vary size and placement to avoid predictability |

### Duo Mascot Proportions

- Body aligns with the loop of the "g" in the logotype
- Head aligns with the top of the "l"
- Wings, mask, feet follow specific proportion guides
- Modular construction allows thousands of unique poses

### Icon Style

- Geometric, rounded construction matching illustration language
- Solid fill preferred over outlined
- Consistent stroke width when outline is used
- Minimum touch target: 44×44px

---

## 7. Motion & Animation

### Principles

| Principle | Description |
|-----------|-------------|
| **State-Driven** | Animations respond to app state (progress, success, failure) |
| **Functional** | Every animation serves a purpose — feedback, guidance, celebration |
| **Performant** | Lightweight vector animations, no pre-rendered video |
| **Behavioral** | Logic-driven (idle, active, encouragement) not hardcoded sequences |

### Implementation: Rive

Duolingo uses **Rive** (rive.app) for all character animations:
- State Machine logic for interactive, real-time responses
- Additive blend states for lip-syncing
- Single lightweight runtime file ships directly in app
- No design-to-engineering handoff friction

### Timing Guidelines

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Button press | 100ms | `ease` |
| Page transition | 300ms | `ease-in-out` |
| Progress fill | 600ms | `ease` |
| Celebration | 800-1200ms | `ease-out` |
| Micro-feedback | 150-200ms | `ease` |

---

## 8. Logo & Brand Identity

### Logo Colors

The logotype can appear in only three colors:
- **Feather Green** (`#58CC02`)
- **White** (`#FFFFFF`)
- **Gray** (neutral)

### Clear Space

- Clear space = **½ × x-height** between Duo and logotype
- Duo's body bottom aligns with the "g" loop
- Duo's head side aligns with top of "l"

### Minimum Sizes

| Medium | Minimum Size |
|--------|-------------|
| **Screen** | 100px wide |
| **Print** | 35mm (1.375") |

### Placement Rules

- Place in one of four corners OR centered on vertical axis
- Should be at least ⅓ of canvas width
- Default orientation: horizontal (0° rotation)
- ❌ Never fill logo with images or gradients
- ❌ Never place over busy backgrounds

---

## 9. Photography

### Style Guidelines

| Aspect | Guideline |
|--------|-----------|
| **Subject** | Authentic, diverse, real people |
| **Setting** | Real-life environments (commuting, traveling, socializing) |
| **Color** | Include Duolingo green in clothing/environment when possible |
| **Purpose** | Bridge between illustration world and reality |
| **Role** | Supporting — illustration is the primary visual language |

---

## 10. Brand Voice & Tone

### Four Voice Pillars

| Pillar | Description | Do | Don't |
|--------|-------------|-----|-------|
| **Expressive** | Simple, direct, active language | Brief, excited | Long-winded, passive |
| **Playful** | Creative energy and fun | Friendly, clever | Sarcastic, smug, mean |
| **Embracing** | User's #1 cheerleader | Supportive, use contractions | Condescending |
| **Worldly** | Broad, knowledgeable perspective | Interested, inclusive | Stereotyping |

### Duo's Personality

- **Is**: Helpful, motivating, persistent, positive, slightly awkward, melodramatic
- **Is NOT**: Threatening, truly angry, violent, overly creepy
- Acts as a "clingy cheerleader" — users don't want to disappoint him
- Thrives on tension between charming and "mildly menacing"

### Notification Style

- Goal-oriented: form routines, protect streaks
- Self-aware: references the fact that they are notifications
- "Reasonable balance between nice and mean"
- Examples:
  - *"Your Spanish lessons won't take themselves."*
  - *"These reminders don't seem to be working. We'll stop sending them."*
  - *"You made Duo sad."*

### Tone Adaptation

| Context | Tone |
|---------|------|
| **Milestone** | Exuberant, exclamation points, emojis |
| **Error/Failure** | Encouraging, safe, "try again" |
| **Serious Topics** | Empathetic, respectful, toned down |
| **Daily Reminder** | Playful guilt, persistent |

---

## 11. Accessibility

### Standards

| Area | Approach |
|------|----------|
| **Touch Targets** | Minimum 44×44px |
| **Color Contrast** | High contrast between text and background |
| **Text Scaling** | UI scales with user font size preferences |
| **Exercise Options** | Users can disable listening or speaking exercises |
| **Focus States** | Visible focus rings on all interactive elements |
| **Feedback** | Failure feels safe — encouraging, not punishing |

### Ongoing Focus Areas

- Enhanced WCAG compliance for color contrast
- Improved screen reader compatibility
- Text/UI component scalability

---

## 12. CSS Reference Implementation

### Complete Design Tokens

```css
:root {
  /* === CORE BRAND === */
  --duo-feather:    #58CC02;
  --duo-mask:       #89E219;

  /* === SECONDARY === */
  --duo-macaw:      #1CB0F6;
  --duo-cardinal:   #FF4B4B;
  --duo-bee:        #FFC800;
  --duo-fox:        #FF9600;
  --duo-beetle:     #CE82FF;
  --duo-humpback:   #2B70C9;

  /* === NEUTRALS === */
  --duo-eel:        #4B4B4B;
  --duo-wolf:       #777777;
  --duo-hare:       #AFAFAF;
  --duo-swan:       #E5E5E5;
  --duo-polar:      #F7F7F7;
  --duo-snow:       #FFFFFF;

  /* === SHADOW COLORS (darkened variants) === */
  --duo-feather-shadow:   #46A302;
  --duo-macaw-shadow:     #1899D6;
  --duo-cardinal-shadow:  #E53535;
  --duo-bee-shadow:       #E6B400;
  --duo-fox-shadow:       #E68600;
  --duo-beetle-shadow:    #B86CE6;

  /* === TYPOGRAPHY === */
  --font-display:   'Feather Bold', 'Nunito', sans-serif;
  --font-body:      'DIN Next Rounded', 'Nunito Sans', 'Varela Round', sans-serif;

  /* === SPACING === */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;

  /* === BORDER RADIUS === */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-pill: 999px;

  /* === SHADOWS === */
  --shadow-btn:    0 5px 0;
  --shadow-card:   0 2px 0;
  --shadow-subtle: 0 1px 3px rgba(0,0,0,0.1);

  /* === TRANSITIONS === */
  --ease-btn:   transform 0.1s ease, box-shadow 0.1s ease;
  --ease-fast:  all 0.15s ease;
  --ease-med:   all 0.3s ease-in-out;
  --ease-slow:  all 0.6s ease;
}
```

### Full Button System

```css
.duo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 24px;
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  transition: var(--ease-btn);
  -webkit-tap-highlight-color: transparent;
}

/* Variants */
.duo-btn--primary   { background: var(--duo-feather);  color: #fff; box-shadow: var(--shadow-btn) var(--duo-feather-shadow); }
.duo-btn--danger    { background: var(--duo-cardinal);  color: #fff; box-shadow: var(--shadow-btn) var(--duo-cardinal-shadow); }
.duo-btn--info      { background: var(--duo-macaw);     color: #fff; box-shadow: var(--shadow-btn) var(--duo-macaw-shadow); }
.duo-btn--premium   { background: var(--duo-beetle);    color: #fff; box-shadow: var(--shadow-btn) var(--duo-beetle-shadow); }
.duo-btn--secondary { background: var(--duo-snow); color: var(--duo-eel); border: 2px solid var(--duo-swan); box-shadow: var(--shadow-btn) var(--duo-swan); }
.duo-btn--ghost     { background: transparent; color: var(--duo-macaw); border: 2px solid var(--duo-macaw); box-shadow: none; }

/* States */
.duo-btn:hover          { filter: brightness(1.05); }
.duo-btn:active         { transform: translateY(5px); box-shadow: none !important; }
.duo-btn:focus-visible  { outline: 3px solid var(--duo-macaw); outline-offset: 2px; }
.duo-btn:disabled       { background: var(--duo-swan); color: var(--duo-hare); box-shadow: none; cursor: not-allowed; transform: none; filter: none; }
```

---

## Quick Reference Card

```
┌────────────────────────────────────────────────┐
│  DUOLINGO DESIGN QUICK REFERENCE               │
├────────────────────────────────────────────────┤
│  Primary Green:  #58CC02                        │
│  Blue:           #1CB0F6                        │
│  Red:            #FF4B4B                        │
│  Yellow:         #FFC800                        │
│  Orange:         #FF9600                        │
│  Purple:         #CE82FF                        │
│  Text:           #4B4B4B                        │
│  Background:     #FFFFFF                        │
│  Border:         #E5E5E5                        │
├────────────────────────────────────────────────┤
│  Display Font:   Feather Bold (Nunito alt)      │
│  Body Font:      DIN Next Rounded (Nunito Sans) │
│  Border Radius:  16px (buttons) / 999px (pills) │
│  Button Shadow:  0 5px 0 [darker-shade]         │
│  Button Press:   translateY(5px) + no shadow    │
│  Min Touch:      44×44px                        │
└────────────────────────────────────────────────┘
```

---

> **Note**: Feather Bold is a proprietary typeface. For personal/open-source projects, use **Nunito** (display) and **Nunito Sans** or **Varela Round** (body) from Google Fonts as close alternatives.
