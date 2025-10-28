# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development mode (runs frontend and Convex backend in parallel)
- `npm run dev:frontend` - Start Next.js frontend only
- `npm run dev:backend` - Start Convex backend only
- `npm run predev` - Initialize Convex deployment (runs automatically before dev)
- `npm run build` - Build the Next.js application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

This is a portfolio website built with:

- **Next.js 16** - React framework with App Router
- **React 19.2** - Latest React version
- **Convex** - Backend-as-a-service for database and server functions
- **Tailwind CSS 4** - Styling framework
- **TypeScript** - Type safety
- **Motion (Framer Motion)** - Animation library
- **Three.js** - 3D graphics library for effects

### Technology Stack Details

- **Font System**: Syne (sans-serif) and JetBrains Mono (monospace) from Google Fonts
- **Analytics**: Vercel Analytics and Speed Insights
- **Email**: Resend for contact form submissions
- **Rate Limiting**: Convex rate-limiter component (5 submissions per hour, capacity of 3)
- **MDX**: next-mdx-remote with rehype plugins for content rendering

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `sections/` - Page section components (hero, bio, info, faq, contact, projects)
- `components/` - Reusable React components
  - `components/ui/` - UI primitives and custom components
  - `components/ui/shadcn-io/` - Components from shadcn/ui registry
- `convex/` - Convex backend functions and schema
- `lib/` - Shared utilities
- `public/` - Static assets (images, favicon, sitemap, robots.txt)

### Page Structure and Lazy Loading

The main page (`app/page.tsx`) uses dynamic imports for performance optimization:
- **Above-the-fold**: `HeroBioOverlay` loads immediately
- **Below-the-fold**: `InfoSection`, `SectionDivider`, `CombinedProjectsFaqSection`, and `ContactSection` use dynamic imports with SSR enabled
- **Important**: Client components (using hooks, motion, etc.) should NOT use `ssr: true` in dynamic imports to avoid module factory errors in Next.js 16

### Section Components Architecture

- `hero-bio-overlay.tsx` - Combined hero and bio with scroll-triggered overlay effect
- `hero.tsx` - Hero section with background animations
- `bio.tsx` - Biography section with animations
- `info.tsx` - Services/information section with responsive backgrounds
- `horizontal-scroll-portfolio.tsx` - Horizontal scrolling project showcase
- `faq.tsx` - FAQ accordion component
- `combined-projects-faq.tsx` - Combined projects and FAQ sections
- `contact.tsx` - Contact form with Convex integration

### Convex Backend Structure

**Schema (`convex/schema.ts`):**
- `numbers` table - Example table with value field
- `contactSubmissions` table - Contact form submissions with fields:
  - `name`, `email`, `message`, `emailId`, `status`, `submittedAt`, `clientIP`, `userAgent`
  - Indexes: `by_email`, `by_status`, `by_submitted_at`

**Functions (`convex/contactForm.ts`):**
- `submitContactForm` (mutation) - Handles contact form submissions with rate limiting and email sending via Resend
- `getContactSubmissions` (query) - Retrieve submissions with optional filtering by status
- `getContactSubmission` (query) - Get single submission by ID
- `getContactStats` (query) - Get submission statistics (total, today, week, pending, failed)

**HTTP Endpoints (`convex/http.ts`):**
- `/resend-webhook` (POST) - Webhook for Resend email status updates

**Components:**
- Resend component for email sending
- Rate limiter component (5 requests per hour, capacity 3)

### Environment Variables

Required for full functionality:
- `CONVEX_DEPLOYMENT` - Convex deployment URL (auto-configured)
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL for client
- `SENDER_EMAIL` - Email address for sending contact form submissions (Resend)
- `RECIPIENT_EMAIL` - Email address to receive contact form submissions

### Component Patterns

**Client vs Server Components:**
- Components using hooks, motion animations, or browser APIs must have `"use client"` directive
- Server components should NOT import client components with `ssr: true` dynamic imports
- Use normal static imports for client components to let Next.js handle the boundary

**Custom UI Components:**
- `text-scramble.tsx` - Animated text scrambling effect
- `pixel-blast.tsx` / `pixel-blast-core.tsx` - Pixel explosion animation effects
- `sticky-scroll-reveal.tsx` - Scroll-based reveal animations
- `infinite-slider.tsx` - Infinite scrolling carousel
- `cutout-image-mask.tsx` - Image masking effects
- `cursor.tsx` - Custom cursor component
- `grid-pattern.tsx` - Animated grid background patterns

**Form Components:**
- Built using react-hook-form with zod validation
- Custom Field, Input, Textarea, Checkbox, and Button components
- Form submissions handled through Convex mutations

### Convex Development Guidelines

This project follows strict Convex best practices (defined in `.cursor/rules/convex_rules.mdc`):

**Function Syntax:**
- ALWAYS use new function syntax with explicit `args` and `returns` validators
- Use `query`, `mutation`, `action` for public functions
- Use `internalQuery`, `internalMutation`, `internalAction` for private functions
- All functions MUST include return validators (use `v.null()` if no return value)

**Function References:**
- Use `api` object for public function references (e.g., `api.contactForm.submitContactForm`)
- Use `internal` object for internal function references
- File-based routing: `convex/contactForm.ts` exports map to `api.contactForm.*`

**Database Queries:**
- Do NOT use `.filter()` - define indexes and use `.withIndex()` instead
- Queries do NOT support `.delete()` - collect results and iterate with `ctx.db.delete()`
- Use `.unique()` for single document queries (throws if multiple matches)
- Default order is ascending `_creationTime`

**Validators:**
- Use `v.null()` for null values (NOT undefined)
- Use `v.id(tableName)` for document IDs
- Use `v.record(keys, values)` for dynamic key objects
- Use `v.union()` for discriminated union types
- Use `v.literal()` with `as const` for string literals

**Schema Design:**
- Define all tables in `convex/schema.ts`
- System fields (`_id`, `_creationTime`) are auto-added
- Index naming: include all fields (e.g., `by_field1_and_field2`)
- Query index fields in the same order as defined

### Performance Optimizations

- Dynamic imports for below-the-fold content
- Page caching with `"use cache"` and `cacheLife("hours")`
- Font optimization with `display: "swap"` and selective preloading
- Image optimization through Next.js Image component
- Comprehensive SEO metadata with Open Graph and Twitter Card support

### SEO Configuration

- Sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- Comprehensive metadata in `app/layout.tsx` and individual pages
- Open Graph and Twitter Card images configured
- Canonical URLs set for all pages
- Structured metadata for improved search visibility

### Development Workflow

1. Run `npm install` to install dependencies
2. Convex will initialize on first `npm run dev`
3. Frontend runs on `localhost:3000`
4. Convex dashboard opens automatically for backend management
5. Hot reload enabled for both frontend and backend changes

### Important Notes

- **Next.js 16 Compatibility**: Client components with dynamic imports should use normal imports or `ssr: false`
- **React 19.2**: Uses latest React features with type overrides in package.json
- **Tailwind 4**: Uses new PostCSS-based architecture
- **Motion Library**: Formerly framer-motion, now using the `motion` package
- **Contact Form**: Includes rate limiting (5 per hour) and Resend email integration
- **Print Styles**: Custom print styles defined for privacy policy and other pages
