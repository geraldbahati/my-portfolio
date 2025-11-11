import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import HelloMarquee from "@/components/HelloMarquee";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { ContactLinks } from "@/components/ContactLinks";
import { PageAnalytics } from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Contact - Request a Project",
  description:
    "Get in touch with Gerald for your next digital project. Contact form, phone, and WhatsApp available. Every message is 100% received and guaranteed to be answered within 24 hours.",
  keywords: [
    "contact gerald",
    "request project",
    "digital designer contact",
    "web developer contact",
    "project inquiry",
    "freelancer contact",
    "trier developer",
    "germany web design"
  ],
  openGraph: {
    title: "Contact Gerald - Request a Project",
    description: "Get in touch with Gerald for your next digital project. Available via contact form, phone, and WhatsApp.",
    type: "website",
    locale: "en_US",
    siteName: "Gerald Bahati Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Gerald - Request a Project",
    description: "Get in touch with Gerald for your next digital project. Available via contact form, phone, and WhatsApp.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Gerald Bahati",
    "description": "Get in touch with Gerald for your next digital project",
    "url": "/contact",
    "mainEntity": {
      "@type": "Person",
      "name": "Gerald Bahati",
      "jobTitle": "Digital Designer & Developer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Trier",
        "postalCode": "54295",
        "addressCountry": "DE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+49-651-17089399",
        "contactType": "customer service",
        "availableLanguage": ["English", "German"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Friday"],
          "opens": "08:00",
          "closes": "18:00"
        }
      }
    }
  };

  return (
    <>
      <PageAnalytics trackPageView trackTime />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-white pt-[96px] sm:pt-[104px] md:pt-[104px] lg:pt-[112px] xl:pt-[128px]">
        {/* Hello Marquee */}
        <HelloMarquee />

        {/* Content Section with Grid Background */}
        <section className="relative" aria-labelledby="contact-heading">
          {/* Interactive Grid Background - only on content area */}
          <GridPattern
            className="absolute inset-0 pointer-events-none"
            gridClassName="stroke-current/20"
            width={32}
            height={32}
            surroundingCells={4}
            surroundingRadius={1}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              {/* Left column - Contact info */}
              <header className="space-y-12">
                {/* Header */}
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                    CONTACT
                  </p>
                  <h1
                    id="contact-heading"
                    className="text-4xl lg:text-5xl font-bold text-black mb-6"
                    style={{ fontSize: "2.25rem" }}
                  >
                    Request a project
                  </h1>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Every message is 100% received and guaranteed to be answered.
                    If you can&apos;t reach me, please leave a request for a
                    callback.
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-32 pointer-events-auto grid-interaction-blocked">
                  {/* Office hours */}
                  <div itemScope itemType="https://schema.org/OpeningHoursSpecification">
                    <h2 className="text-lg font-semibold text-black mb-4">
                      Office hours
                    </h2>
                    <div className="space-y-2">
                      <p className="text-gray-600">Monday & Friday:</p>
                      <p className="text-gray-800 font-medium">
                        <time itemProp="opens" dateTime="08:00">8:00 a.m.</time> - <time itemProp="closes" dateTime="18:00">6:00 p.m.</time>
                      </p>
                    </div>
                  </div>

                  {/* Direct contact */}
                  <address className="not-italic" itemScope itemType="https://schema.org/ContactPoint">
                    <h2 className="text-lg font-semibold text-black mb-4">
                      Direct contact
                    </h2>
                    <ContactLinks />
                  </address>
                </div>
              </header>

              {/* Right column - Contact form */}
              <aside className="lg:pl-8" aria-labelledby="contact-form-heading">
                <div className="bg-white">
                  <h2 id="contact-form-heading" className="sr-only">Contact Form</h2>
                  <ContactForm />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
