# Chation Design System Specification

This document details the complete design specification extracted from the **Chation** AI chatbot user interface design system. It is designed to be a comprehensive reference for frontend developers, UI designers, and design engineers implementing this visual language in web or mobile environments.

---

## 1. Visual Language & Token System

### 1.1 Color Palette

The system utilizes a dual-theme strategy (Light & Dark) anchored by deep charcoal/navy, warm gold, vibrant lavender, and soft pastel categorization accents.

| Category | Token Name | HEX Code | Usage Context |
| :--- | :--- | :--- | :--- |
| **Dark Theme** | `color-bg-dark` | `#141724` | Primary dark page backgrounds, heavy panels |
| | `color-panel-dark` | `#1E2235` | Inactive inputs, inner dark containers, secondary panels |
| | `color-text-dark-primary` | `#FFFFFF` | Headings and primary labels in dark mode |
| | `color-text-dark-secondary` | `#A5A9B8` | Subheadings, body copy, and muted descriptions |
| **Light Theme**| `color-bg-light` | `#F5F5F0` | Screen outer margins, canvas, backdrop |
| | `color-panel-light`| `#FFFFFF` | Cards, chat bubbles, white container backgrounds |
| | `color-text-light-primary`| `#141724` | Primary text, titles, text in light-mode cards |
| | `color-text-light-secondary`| `#7E8396`| Muted captions, inactive navigation links |
| **Accents** | `color-primary-yellow` | `#FED430` | Main buttons, active indicators, ratings, gold badges |
| | `color-accent-purple` | `#B89EFF` | Subscription details, "Love"/"Beauty" tags, active overlays |
| | `color-accent-pink` | `#FFACD8` | Badges, "Fashion"/"Learn" tags, warm background glow |
| | `color-accent-blue` | `#A8DADC` | "Music"/"Technology" tags, cool background highlights |
| | `color-accent-green` | `#2FD89B` | Verification badges, online status indicators, "Friend" tag |
| | `color-accent-orange`| `#FFB480` | "Education" tag, notification actions |
| | `color-accent-beige` | `#F0E5D8` | "Peace"/"Co" tags, soft secondary capsules |

### 1.2 Typography

The interface employs a modern, geometric sans-serif typeface (such as **Outfit**, **Poppins**, or **Inter**) with distinct style weights:

*   **Display Title**: Bold/Extra Bold (`font-weight: 800`), tight tracking (`letter-spacing: -0.02em`), compact line-height. Used for screen-level titles (e.g., "Choose your bot's categories", "Cooking with Tim").
*   **Card Header / Bot Name**: Bold (`font-weight: 700`), readable size (`16px` to `18px`).
*   **Body Copy**: Regular to Medium (`font-weight: 400` / `500`), line-height of `1.5em`, size `13px` to `15px`.
*   **Badges & Labels**: Semibold (`font-weight: 600`), uppercase/capitalized, compact tracking, small size (`10px` to `12px`).

### 1.3 Layout & Structural Accents

*   **Rounded Corners**:
    *   Primary Cards / Panels: `24px` border-radius (`rounded-3xl` equivalent).
    *   Interactive Pills / Tags / Buttons: Fully rounded capsules (`9999px`).
    *   Avatars: Circular (`50%` aspect ratio border-radius).
*   **Organic Curved Notch (Header Detail)**: 
    *   Transition between dark top panels and light page canvases is marked by a custom organic wave cutout / concave notch that curves smoothly downwards (visible in the "New Chat Instructions" and "Chation" dashboard screens).
*   **Shadows & Glows**:
    *   Subtle, warm-colored drop shadows (`rgba(20, 23, 36, 0.05)`) with broad blur radiuses (`16px`).
    *   Soft radial background gradients (pink-to-blue or pink-to-yellow) positioned behind cards to create depth without using borders.

---

## 2. Core UI Components

### 2.1 Buttons & Inputs

#### Primary Action Button (Yellow / Dark Theme)
*   **Background**: `color-primary-yellow` (`#FED430`).
*   **Text Color**: `color-bg-dark` (`#141724`), bold, centered.
*   **Shape**: Wide capsule, full width, padded vertically (`16px` padding top/bottom).
*   **Hover/Active State**: Scale-down translation (`scale(0.98)` on click), transition duration `150ms`.

#### Secondary Action Button (Black / Light Theme)
*   **Background**: `color-bg-dark` (`#141724`).
*   **Text Color**: `#FFFFFF`, bold, centered.
*   **Shape**: Capsule, full width, same dimensions as yellow button.

#### Stop Generating Overlay Button
*   **Border/Outline**: `1.5px` solid `color-accent-purple` (`#B89EFF`).
*   **Background**: Soft gradient overlay / semi-transparent dark tint.
*   **Content**: A centered square stop icon and "Stop generating" text in matching lavender.

#### Chat Input Field
*   **Outer container**: Rounded capsule pill, colored in dark panel grey (`color-panel-dark` or secondary dark grey).
*   **Placeholder Text**: "Type your question..." in muted gray (`color-text-dark-secondary`).
*   **Send Trigger**: Circular button inside the input field on the right. Yellow background with a dark chevron/arrow pointing right (`>`).

### 2.2 Navigation Bar (Floating Bottom Dock)

*   **Structure**: Floating capsule bar anchored at the bottom center of the viewport with responsive inset padding.
*   **Background**: Solid dark charcoal (`#141724`).
*   **Items**:
    *   5 core navigation icons (Home, Search, Bot/Chat, Profiles, Settings).
    *   **Active Item**: Yellow filled circle (`color-primary-yellow`) enclosing a dark gray icon.
    *   **Inactive Items**: Muted white/grey icons spaced evenly.

### 2.3 Category & Tag Pills

*   **Tag Structure**: Inline capsule container with an optional icon on the left, label text, and variable-angle rotation.
*   **Dynamic Tag Cloud Layout**:
    *   Tags are stacked overlapping in a dynamic layout.
    *   **Physics-style angles**: The tags are tilted at angles (e.g. `5deg`, `-10deg`, `15deg`, `-15deg`, `45deg`, etc.) to create a playful visual stack.
    *   **Color coding**: Custom background colors corresponding to categories (e.g., Purple for Love, Beige for Friend, Blue for Technology, Pink for Fashion).

---

## 3. Screen-by-Screen Specifications

### Screen 1: New Chat Instructions (Light Theme Layout)
*   **Header**:
    *   Dark background top area.
    *   Back button: White `<` on a dark translucent circle.
    *   Title: "New Chat Instructions" in white.
    *   Base border is styled as a smooth concave wave cutting into the light main content.
*   **Body Content**:
    *   **Bot Identity Card**: 
        *   Centering a circular avatar of the chatbot (e.g., Chef Tim with a red hat) on a yellow background circle.
        *   Green checkmark verification badge floating on the top-right border of the avatar.
        *   Name: "Cooking with Tim" (Bold) alongside a star rating "★ 5.0" (Gold star, dark text).
        *   Subscription Label: Pink capsule badge reading `$15/month (Free 30 min trial)`.
        *   Muted tagline: `Learn cooking and ask anything`.
    *   **Instruction Card List**:
        *   Three stacked cards, each featuring light gray backgrounds with high-contrast text.
        *   Format: `[Index Number]. [Instruction Name]` as header, description below.
        *   Right-aligned circle icons corresponding to the instructions (e.g., goggles icon for "Short & Sweet", eye icon for "Be Specific", chat bubble for "Respectful Chat").
*   **Footer**: Floating "Continue" button on dark background with bottom-right corner pink radial glow.

### Screen 2: Choose Bot's Categories (Dark Theme Layout)
*   **Header**:
    *   Back button with a yellow chevron (`<`).
    *   Title: `Choose your bot's categories` in large bold white.
    *   Description: `To give you a personalized experience, let us choose categories.` in soft gray.
    *   **Progress Indicator**: A segmented horizontal bar split into four blocks. The active progress fills the first two blocks in bright yellow, leaving the remaining two in dark gray.
*   **Main Cloud**:
    *   Visual container with centered layout displaying categories overlapping in rotated capsules:
        *   **Love** (Purple, Heart Icon)
        *   **Friend** (Cream/Beige, Person Icon, rotated -45°)
        *   **Learn** (Pink, Book Icon)
        *   **Music** (White, Note Icon)
        *   **Beauty** (Dark Purple, Sparkling Star Icon)
        *   **Shopping** (Blue-purple, Shopping Cart Icon)
        *   **Art** (Light beige, Paint Palette Icon)
        *   **Education** (Pink, Pencil Icon, rotated 90°)
        *   **Co** (Cream/Beige, Building Icon)
        *   **Technology** (Blue-purple, Gear Icon)
        *   **Peace** (White, Smile Icon)
*   **Footer**: Large yellow capsule button with "Continue" in dark gray.

### Screen 3: Chation Dashboard (Light Theme Layout)
*   **Header**:
    *   A grid/dashboard icon on the left, notification bell with red notification dot on the right.
    *   Center Logo: `Chation` with a robot icon.
*   **Hero Subscription Banner**:
    *   A large, dark rounded-corner card.
    *   Left side text: `AI Chat bots on subscription` in white bold, with a purple button underneath reading `Unlock $25/year`.
    *   Right side asset: A detailed 3D illustration of a yellow robot waving its hand.
*   **Horizontal Features**:
    *   Three micro-cards side-by-side: `Custom Chat Bots` (plug icon), `Encrypted Conversation` (shield icon), and `Multi Lingual Support` (globe icon).
*   **Unlock Chatbots Section**:
    *   Tab Switcher:
        *   Active: **Top Chatbots** (Yellow background capsule, black text).
        *   Inactive: **New Chatbots** (Light gray background capsule, dark text).
    *   **Chatbot Cards Grid** (horizontal flex list with gradient backdrops):
        *   *AI Bestie*: Avatar with blue cap, description `Virtual AI friend`, rating `★ 4.9`, pricing `$0.2/m`.
        *   *Tui Tui Bot*: Yellow robot avatar, description `Anything anytime`, rating `★ 5`, pricing `$0.48/m`.
*   **Footer**: Floating bottom navigation bar (Dark capsule dock).

### Screen 4: Cooking with Tim Chat Thread (Dark Theme Layout)
*   **Header**:
    *   Yellow back chevron `<`. Title `Cooking with Tim` in white. Three-dot options menu icon (`...`) on the right.
*   **Conversation Stream**:
    *   **User Message**: 
        *   Aligned to the right with user avatar.
        *   Message text: "What can I whip up instantly with some tomato?" on a transparent or dark panel bubble.
        *   A reload/refresh circular arrow icon is aligned to the right of the bubble.
    *   **Bot Message**:
        *   Left-aligned with Chef Tim avatar.
        *   Large white rounded card message bubble with dark gray text.
        *   Contains formatted headers, bold texts, and bullet descriptions of recipes (Soup, Bruschetta).
        *   Feedback indicators at the bottom left: outline Thumbs Up (👍) and Thumbs Down (👎) icons.
    *   **Active Generation State**:
        *   While generating, an overlay containing a purple-outlined "Stop generating" pill button covers the space just above the input field.
*   **Input Bar**: Anchored to the bottom. Capsule shape, text input, with a yellow circular arrow send button.

---

## 4. UI Patterns & Interaction Details

### 4.1 Chat Thread Structure & States
*   **User Avatar Position**: Appears above or next to the user query with a refresh/regenerate icon on the right edge.
*   **Assistant Message Bubble**: Clean white background with generous padding (`20px`). The typography is formatted using bold titles and spaced lists to prevent walls of text.
*   **Feedback Controls**: Simple outline thumbs up/down icons inside the message bubble boundary to collect quality ratings.

### 4.2 Floating Notification Toast (Ani AI)
*   A custom floating banner used to highlight active notifications/updates:
    *   Left side: Circular avatar (pink hair, headphones) on a soft background.
    *   Middle: Title `News with Ani AI` and subtitle `News updates with AI`.
    *   Right side: Pink circle enclosing a speaker icon, with a label `Unlocked` and a small unlocked padlock icon.
    *   Design: Strong drop shadow to stand out as an independent layer floating above background views.

### 4.3 Chatbot Card Schema
Each chatbot profile card follows a standardized grid and information layout:
```
+------------------------------------------+
|  [Avatar Circle (w/ Green Checkmark)]    |
|                                          |
|  [Chatbot Name]                          |
|  [Chatbot Role/Subtitle Description]     |
|                                          |
|  [Star Rating ★ X.X]      [Price /m]     |
+------------------------------------------+
```
*   **Rating Alignment**: Left-aligned at the bottom row.
*   **Price Alignment**: Right-aligned at the bottom row.
*   **Price Label**: Uses custom indicators like `Free` or `$X.XX/m`.
