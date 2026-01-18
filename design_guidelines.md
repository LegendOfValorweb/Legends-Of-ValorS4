# Legend of Valor - Design Guidelines

## Design Approach
**Reference-Based Gaming UI**: Drawing inspiration from modern RPG interfaces like Diablo, Path of Exile, and League of Legends item shops, combined with clean web design patterns from Discord and Steam for account management.

## Core Design Principles
1. **Fantasy RPG Aesthetic**: Dark, immersive gaming interface with metallic accents and tier-based visual hierarchy
2. **Stat Clarity**: Information-dense displays with clear visual indicators for item stats and attributes
3. **Rarity Distinction**: Strong visual differentiation between item tiers (Normal/Rare, Super Rare, X-tier)

## Typography
- **Primary Font**: "Cinzel" (Google Fonts) for headings - medieval/fantasy feel
- **Secondary Font**: "Inter" for body text and stats - maximum readability
- **Sizes**: h1: text-4xl/font-bold, h2: text-2xl/font-semibold, body: text-base, stats: text-sm/font-mono

## Layout System
**Spacing Units**: Consistent use of Tailwind units 4, 6, 8, 12 for padding/margins. Component gaps use 4-6, section spacing uses 8-12.

## Component Library

### Hero Section
Full-width dark gradient background with fantasy game artwork (ethereal warrior with glowing legendary weapon in mystical landscape). Hero text overlays with blurred-background buttons for "Start as Player" and "Admin Login".

### Item Cards
Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4) with distinct card treatments:
- **Border Colors by Rarity**: Normal/Rare (gray-500), Super Rare (purple-500), X-tier (gold-400)
- **Card Structure**: Item image/icon at top, item name with rarity badge, stat grid below, price footer with gold coin icon
- **Hover Effect**: Subtle scale and glow matching rarity color

### Navigation
Top horizontal bar with game logo left, account info (username, gold balance with coin icon) right. For player view: tabs for "Shop", "Inventory", "Account".

### Inventory Grid
Similar card grid as shop but with equipped items highlighted with green glow. Drag-and-drop visual indicators (dashed borders on hover).

### Stat Display
Horizontal stat bars for Str/Int/Spd/Luck with icon + value + colored fill bar. Use distinct colors: Str (red-500), Int (blue-500), Spd (green-500), Luck (yellow-500).

### Admin Panel
Clean table layout for item management with search/filter controls. Action buttons (Give Item, View Stats) aligned right per row.

### Modals
Purchase confirmation and item detail modals with darkened backdrop. Modal cards feature larger item preview, full stat breakdown, and special ability descriptions.

## Images
- **Hero Image**: Epic fantasy battle scene or legendary artifact showcase (full-width, 70vh)
- **Item Placeholders**: Fantasy weapon/armor/accessory icons or illustrations for each item
- **Background Texture**: Subtle dark leather or stone texture across main containers

## Visual Hierarchy
- **Primary Actions**: Large buttons with rarity-colored accents and blurred backgrounds when over images
- **Secondary Actions**: Outlined buttons in gray
- **Item Names**: Bold, larger text with rarity color accent
- **Stats**: Monospace font with icon prefixes, compact grid layout

## Responsive Behavior
- Desktop: 4-column item grid, side-by-side stat displays
- Tablet: 2-column grid, stacked stat bars
- Mobile: Single column, full-width cards with horizontal stat scroll