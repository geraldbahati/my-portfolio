# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development mode (runs frontend and Convex backend in parallel)
- `npm run dev:frontend` - Start Next.js frontend only
- `npm run dev:backend` - Start Convex backend only
- `npm run build` - Build the Next.js application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

This is a portfolio website built with:

- **Next.js 15** - React framework with App Router
- **Convex** - Backend-as-a-service for database and server functions
- **Clerk** - Authentication provider (configured but commented out)
- **Tailwind CSS** - Styling framework
- **TypeScript** - Type safety

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components, including UI components from shadcn/ui
- `sections/` - Page section components (hero, bio, info, faq, etc.)
- `convex/` - Convex backend functions and schema
- `lib/` - Shared utilities

### Convex Backend Structure

The project uses Convex with:
- `convex/schema.ts` - Database schema definition (currently minimal with just a numbers table)
- `convex/myFunctions.ts` - Server functions
- `convex/auth.config.ts` - Authentication configuration (Clerk integration available but commented out)

### Component Architecture

The codebase follows a modular component structure:
- Main layout defined in `app/layout.tsx` with ClerkProvider and ConvexClientProvider
- Sections are organized as individual components in `sections/`
- UI components utilize shadcn/ui patterns in `components/ui/`
- Custom fonts: Syne (sans) and JetBrains Mono (mono)

### Authentication Setup

Clerk authentication is configured but currently disabled. To enable:
1. Uncomment the provider configuration in `convex/auth.config.ts`
2. Set up Clerk JWT template following the README instructions
3. Configure `CLERK_JWT_ISSUER_DOMAIN` environment variable

### Convex Development Guidelines

This project includes Cursor rules for Convex development (`/.cursor/rules/convex_rules.mdc`) that specify:
- Always use new Convex function syntax with explicit args and returns validators
- Proper use of query, mutation, action, and their internal variants
- Correct function reference usage with api/internal objects
- Schema and validator best practices

### Development Setup

1. Run `npm install` to install dependencies
2. Set up Convex deployment following README instructions
3. Use `npm run dev` to start both frontend and backend in development mode
4. The frontend will be available at localhost:3000
5. Convex dashboard will open automatically for backend management