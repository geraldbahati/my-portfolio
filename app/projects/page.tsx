import { Metadata } from "next";
import { ProjectsGrid } from "@/components/projects-grid";
import { projects } from "./data";

// SSG configuration with ISR (revalidate every 60 seconds)
export const revalidate = 60;

// SEO Metadata
export const metadata: Metadata = {
  title: "Projects | Portfolio - Creative Digital Solutions",
  description:
    "Creative digital advancement  get to know my approach and style through a selection of my projects. Each project represents quality, well-thought-out structures, and sustainable digital solutions that deliver measurable results.",
  keywords: [
    "portfolio",
    "projects",
    "web development",
    "interactive design",
    "UI/UX",
    "digital solutions",
    "creative development",
  ],
  authors: [{ name: "Gerald Bahati" }],
  openGraph: {
    title: "Projects | Portfolio - Creative Digital Solutions",
    description:
      "Explore a curated selection of projects showcasing quality, well-thought-out structures, and sustainable digital solutions.",
    type: "website",
    url: "https://geraldbahati.com/projects",
    images: [
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Projects Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Portfolio - Creative Digital Solutions",
    description:
      "Explore a curated selection of projects showcasing quality digital solutions.",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    ],
  },
  alternates: {
    canonical: "https://geraldbahati.com/projects",
  },
};

/**
 * Projects Page - SSG with ISR
 *
 * This page is statically generated at build time and revalidated every 60 seconds.
 * All content is server-rendered for optimal SEO and performance.
 */
export default function ProjectsPage() {
  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio Projects",
    description:
      "A curated selection of projects showcasing creative digital solutions",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        "@id": `https://geraldbahati.com/projects#${project.id}`,
        name: project.title,
        description: project.description || project.alt,
        image: project.poster || project.src,
        url: `https://geraldbahati.com/projects#${project.id}`,
        keywords: project.badges?.map((b) => b.text).join(", "),
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-background">
        {/* Page Header */}
        <header className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
            Projects
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            Creative digital advancement  get to know my approach and style
            through a selection of my projects. Each project represents{" "}
            <strong className="font-semibold text-foreground">
              quality, well-thought-out structures, and sustainable digital
              solutions
            </strong>{" "}
            that deliver measurable results.
          </p>
        </header>

        {/* Separator Line */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <hr className="border-border mb-12" />
        </div>

        {/* Projects Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
          <ProjectsGrid projects={projects} />
        </section>
      </main>
    </>
  );
}
