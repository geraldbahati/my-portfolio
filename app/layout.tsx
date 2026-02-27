import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ConsoleFilter } from "@/components/console-filter";
import { IntersectObserver } from "@/components/IntersectObserver";
import { LenisProvider } from "@/components/LenisProvider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Show fallback font immediately while loading
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap", // Show fallback font immediately while loading
  preload: false, // Only preload if heavily used
});

export const metadata: Metadata = {
  metadataBase: new URL("https://geraldbahati.dev"),
  title: {
    default: "Gerald Bahati - Product Software Engineer | 2+ Years Experience",
    template: "%s | Gerald Bahati",
  },
  description:
    "Product Software Engineer with 2+ years shipping production e-commerce and fintech experiences. Specializing in React, Next.js, Spring Boot, Go, and real-time systems with measurable business impact.",
  applicationName: "Gerald Bahati Portfolio",
  keywords: [
    "Gerald Bahati",
    "product engineer",
    "software engineer",
    "full stack developer",
    "React developer",
    "Next.js expert",
    "Spring Boot developer",
    "Go developer",
    "TypeScript",
    "Node.js",
    "e-commerce developer",
    "fintech engineer",
    "real-time systems",
    "AI integration",
    "Kenya software engineer",
    "Nairobi developer",
  ],
  authors: [{ name: "Gerald Bahati", url: "https://geraldbahati.dev" }],
  creator: "Gerald Bahati",
  publisher: "Gerald Bahati",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://geraldbahati.dev",
    siteName: "Gerald Bahati Portfolio",
    title: "Gerald Bahati - Product Software Engineer | 2+ Years Experience",
    description:
      "Product Software Engineer with 2+ years shipping production e-commerce and fintech experiences. Specializing in React, Next.js, Spring Boot, Go, and real-time systems with measurable business impact.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerald Bahati - Product Software Engineer | 2+ Years Experience",
    description:
      "Product Software Engineer with 2+ years shipping production e-commerce and fintech experiences. Specializing in React, Next.js, Spring Boot, Go, and real-time systems.",
    creator: "@geraldbahati",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://geraldbahati.dev",
  },
  category: "technology",
  other: {
    "color-scheme": "light only",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${jetbrainsMono.variable} antialiased bg-background`}
      >
        {/*<ClerkProvider>*/}
        <ConvexClientProvider>
          <LenisProvider>
            <MotionProvider>
              <ConsoleFilter />
              <IntersectObserver />
              {children}
              <AnalyticsProvider />
            </MotionProvider>
          </LenisProvider>
        </ConvexClientProvider>
        {/*</ClerkProvider>*/}
      </body>
    </html>
  );
}
