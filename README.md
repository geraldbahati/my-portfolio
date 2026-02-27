# Gerald Bahati - Digital Portfolio

A modern, high-performance portfolio showcasing my software engineering experience, projects, and services. Built with Next.js 16, React 19, and Convex, featuring edge-first rendering and scroll-driven animations.

I specialize in building edge-first e-commerce and real-time systems, providing multi-layer caching, AI integrations, and M-Pesa payment implementations. My focus is on the intersection of performance, reliability, and user experience — building robust systems that are fast to use, fast to ship, and built to scale.

🌍 **Live Site:** [geraldbahati.dev](https://geraldbahati.dev)

## 🚀 Key Features

- **Modern Tech Stack:** Built with the latest Next.js 16 (App Router) features and React 19.
- **Performance First:** Edge rendering, optimized image delivery, and smooth animations (Framer Motion, Lenis).
- **Rich Interactivity:** Scroll-driven animations, interactive overlays, and dynamic background patterns.
- **Robust Backend:** Powered by Convex for real-time capabilities and type-safe database schemas.
- **SEO Optimized:** Comprehensive metadata, JSON-LD structured data, and accessible markup.

## 🛠️ Technology Stack

**Frontend Framework**

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

**Styling & UI**

- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/)
- [shadcn/ui](https://ui.shadcn.com/) (Components)
- [Lenis](https://lenis.darkroom.engineering/) (Smooth Scrolling)

**Backend & Data**

- [Convex](https://convex.dev/) (Backend-as-a-Service)
- [Clerk](https://clerk.com/) (Authentication - configured, ready for use)

**Analytics & Performance**

- [Vercel Analytics](https://vercel.com/analytics)
- [Vercel Speed Insights](https://vercel.com/speed-insights)

## 📁 Project Structure

```
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components (shadcn ui, custom elements)
├── sections/             # Core page sections (Hero, Info, Projects, Contact)
├── convex/               # Convex backend functions and schema
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and analytics setup
├── content/              # MDX files for rich content
└── public/               # Static assets (images, fonts)
```

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/geraldbahati/portfolio.git
    cd portfolio
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add the necessary environment variables. You can reference `.env.local.example` for the required keys.
    - **Convex:** Requires `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`.
    - **Clerk (Optional):** Requires basic Clerk public/secret keys depending on your auth requirements.

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This command concurrently starts the Next.js frontend and the Convex backend environment.

5.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
