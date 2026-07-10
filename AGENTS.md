# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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
  - `app/(root)/` - Public-facing pages (home, contact, projects, privacy)
  - `app/(admin)/` - Admin dashboard pages (contacts, projects, FAQs management)
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
  - Uses Framer Motion's `useScroll` hook with scroll progress tracking
  - 200vh container provides animation distance and buffer
  - Hero stays fixed while bio slides up from bottom based on scroll position
  - Animation runs from scroll 0-100vh, bio stays visible 100-200vh
- `hero.tsx` - Hero section with background animations
- `bio.tsx` - Biography section with animations
- `bio-overlay.tsx` - Bio component that receives scroll progress for overlay animation
- `info.tsx` - Services/information section with responsive backgrounds
- `horizontal-scroll-portfolio.tsx` - Horizontal scrolling project showcase
- `faq.tsx` - FAQ accordion component
- `combined-projects-faq.tsx` - Combined projects and FAQ sections
- `combined-projects-faq-wrapper.tsx` - Client wrapper for combined section
- `contact.tsx` - Contact form with Convex integration

### Convex Backend Structure

**Schema (`convex/schema.ts`):**
- `numbers` table - Example table with value field
- `contactSubmissions` table - Contact form submissions with fields:
  - `name`, `email`, `message`, `emailId`, `status`, `submittedAt`, `clientIP`, `userAgent`
  - Indexes: `by_email`, `by_status`, `by_submitted_at`
- `projects` table - Portfolio projects with fields:
  - `id`, `title`, `description`, `src`, `type`, `poster`, `alt`, `badges`, `aspectRatio`, `order`, `isPublished`, `createdAt`, `updatedAt`
  - Indexes: `by_order`, `by_published`, `by_project_id`
- `faqs` table - Frequently asked questions with fields:
  - `question`, `answer`, `order`, `isPublished`, `createdAt`, `updatedAt`
  - Indexes: `by_order`, `by_published`

**Functions:**

*Contact Form (`convex/contactForm.ts`):*
- `submitContactForm` (mutation) - Handles contact form submissions with rate limiting and email sending via Resend
- `getContactSubmissions` (query) - Retrieve submissions with optional filtering by status
- `getContactSubmission` (query) - Get single submission by ID
- `getContactStats` (query) - Get submission statistics (total, today, week, pending, failed)

*Projects (`convex/projects.ts`):*
- `getPublishedProjects` (query) - Get all published projects ordered by display order
- `getProjectById` (query) - Get a single project by its ID

*FAQs (`convex/faqs.ts`):*
- `getPublishedFaqs` (query) - Get all published FAQs ordered by display order

*Admin Functions (`convex/adminProjects.ts`, `convex/adminFaqs.ts`):*
- Internal mutations for managing projects and FAQs (create, update, delete, reorder)
- These are internal-only functions for admin management

**HTTP Endpoints (`convex/http.ts`):**
- `/resend-webhook` (POST) - Webhook for Resend email status updates

**Components:**
- Resend component for email sending
- Rate limiter component (5 requests per hour, capacity 3)

### Authentication

This project uses **Clerk** for authentication integrated with Convex.

**Setup:**
- Authentication configuration: `convex/auth.config.ts`
- Clerk providers: Wrapped in `app/layout.tsx` (ClerkProvider > ConvexClientProvider)
- Route protection: Proxy at `proxy.ts` protects all `/admin` routes (Next.js 16 renamed middleware to proxy)
- Client provider: `components/ConvexClientProvider.tsx` uses `ConvexProviderWithClerk`
- Auth helpers: `convex/auth.ts` provides `requireAuth()`, `requireAdmin()`, and `isAdmin()` utilities

**Protected Routes:**
- `/admin/*` - Admin dashboard routes (DEVELOPMENT ONLY)
  - Blocked in production via proxy middleware
  - Requires authentication AND admin role in development

**Admin Role Setup:**
To make a user an admin, you need to set their role in Clerk Dashboard:

1. Go to Clerk Dashboard → Users
2. Select the user you want to make an admin
3. Scroll to "Metadata" section
4. Click "Edit" on "Public metadata"
5. Add the following JSON:
```json
{
  "role": "admin"
}
```
6. Save changes

The user will now have admin access to `/admin` routes.

**Authentication Flow:**
1. User attempts to access protected route
2. Clerk proxy checks if user is authenticated
3. For `/admin` routes, proxy also checks if user has `role: "admin"` in public metadata
4. If not admin, user is redirected to home page
5. Convex queries/mutations can access user identity via `ctx.auth.getUserIdentity()`

**Using Authentication in Convex Functions:**
```typescript
import { requireAuth, requireAdmin, isAdmin } from "./auth";

// Require any authenticated user
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);
    // User is authenticated
  },
});

// Require admin user
export const adminMutation = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAdmin(ctx);
    // User is authenticated AND is an admin
  },
});

// Check if user is admin (returns boolean)
export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userIsAdmin = await isAdmin(ctx);
    return { isAdmin: userIsAdmin };
  },
});
```

**Client-side Authentication:**
- Use `useConvexAuth()` from `convex/react` to check auth state (NOT Clerk's `useAuth()`)
- Use `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` from `convex/react`
- Use Clerk's `useUser()` hook for user profile information
- Use Clerk's `<UserButton />` for user menu/sign out

### Environment Variables

**Convex Dashboard (Development deployment only):**
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain
- `ENABLE_ADMIN` - Set to `true` to enable admin access (DEV ONLY - never set in production)

**Local .env.local:**
- `CONVEX_DEPLOYMENT` - Convex deployment URL (auto-configured)
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL for client
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
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
- **Animation Libraries**: Project uses both `framer-motion` (imported from `framer-motion`) and the newer `motion` package
- **Contact Form**: Includes rate limiting (5 per hour) and Resend email integration
- **Print Styles**: Custom print styles defined for privacy policy and other pages
- **Admin Dashboard**: Located at `/admin` route with pages for managing contacts, projects, and FAQs
