# Legend of Valor - RPG Item Shop

## Overview

Legend of Valor is a fantasy RPG item shop web application where players can browse, purchase, and manage inventory items across multiple rarity tiers. The system supports two user roles: players who shop and manage their inventory, and admins who can manage items and give items to players. The application features a dark fantasy gaming aesthetic inspired by games like Diablo and Path of Exile.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context API for game state (accounts, inventory, gold), TanStack Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark fantasy theme, Cinzel font for headings, Inter for body text

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful JSON API with routes for accounts, inventory, and items
- **Validation**: Zod schemas for request/response validation
- **Build System**: Vite for frontend bundling, esbuild for server bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database tables and Zod schemas
- **Tables**: `accounts` (users with roles and gold), `inventory_items` (purchased items linked to accounts)
- **Items Data**: Static item definitions stored in `client/src/lib/items-data.ts` (not in database)

### Key Design Patterns
- **Shared Types**: The `shared/` directory contains schema definitions used by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared directory
- **Component Structure**: UI primitives in `components/ui/`, feature components at `components/` root
- **Page-based Routing**: Pages in `pages/` directory (landing, shop, inventory, admin)

### Item Tier System
Items are categorized into five rarity tiers with distinct visual styling:
- Normal (gray/green)
- Super Rare (purple)
- X-tier (gold)
- UMR (red)
- SSUMR (pink) - highest tier

### Authentication Model
Username and password authentication. New accounts are created on first login with the chosen password. Existing accounts require the correct password. The admin account has specific credentials (username: "Napoleon", password: "Iamadmin").

### Player Resources
Players have multiple resources tracked:
- **Gold**: Main currency for purchasing items
- **Rubies**: Premium currency
- **Soul Shards**: Crafting resource
- **Focused Shards**: Rare crafting resource  
- **Pets**: Collection of pet names (stored as array)

All resources can be modified by admins through the admin panel.

### Guild Dungeon System
Guilds have a two-phase dungeon system:
- **The Great Dungeon** (Floors 1-50): 10x NPC tower strength, no pets allowed, guild bank rewards
- **The Demon Lord's Dungeon** (Floors 51-100): 15x NPC tower strength, pets allowed, 3x rewards

### Guild Battles
Guilds can challenge other guilds to battles:
- Guild master selects fighters and order
- Admin judges each round, winner gets 1 point
- First fighter to win earns the point for their guild
- Guild wins are tracked on the leaderboard

### Player Challenges
- Players can challenge each other
- Pets are included in strength calculation
- Admin can see combined strength (stats + items + pet) when selecting winners

### Leaderboard Types
- Wins, Losses, NPC Progress, Rank, Guild Dungeon, Guild Wins

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express sessions

### UI Libraries
- **Radix UI**: Full suite of accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **embla-carousel-react**: Carousel functionality

### Development Tools
- **Vite**: Frontend dev server and bundler with HMR
- **Drizzle Kit**: Database migration and push tooling
- **TypeScript**: Full type coverage across client, server, and shared code

### Replit-specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator