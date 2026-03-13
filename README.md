# Gerald Bahati - Digital Portfolio

[![Vercel](https://img.shields.io/github/deployments/geraldbahati/my-portfolio/production?label=vercel&logo=vercel)](https://geraldbahati.dev)
[![CI](https://github.com/geraldbahati/my-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/geraldbahati/my-portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Lighthouse Performance](https://img.shields.io/badge/performance-99-brightgreen)](https://geraldbahati.dev)
[![Lighthouse Accessibility](https://img.shields.io/badge/accessibility-100-brightgreen)](https://geraldbahati.dev)
[![Lighthouse Best Practices](https://img.shields.io/badge/best%20practices-100-brightgreen)](https://geraldbahati.dev)
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100-brightgreen)](https://geraldbahati.dev)

A modern, high-performance portfolio showcasing my software engineering experience, projects, and services. Built with Next.js 16, React 19, and Convex, featuring edge-first rendering and scroll-driven animations.

**Live Site:** [geraldbahati.dev](https://geraldbahati.dev)

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion, shadcn/ui, Lenis |
| Backend | Convex, Clerk (Auth) |
| Analytics | Vercel Analytics, Vercel Speed Insights |

## Project Structure

```
app/           Next.js App Router pages and layouts
components/    Reusable UI components (shadcn/ui, custom)
sections/      Core page sections (Hero, Info, Projects, Contact)
convex/        Convex backend functions and schema
hooks/         Custom React hooks
lib/           Utility functions and analytics setup
content/       MDX files for rich content
public/        Static assets (images, fonts)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/geraldbahati/my-portfolio.git
    cd my-portfolio
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env.local` file in the root directory. You can reference `.env.local.example` for the required keys:
    - `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` (Convex)
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (Clerk, optional)

4. **Run the development server:**

    ```bash
    npm run dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
