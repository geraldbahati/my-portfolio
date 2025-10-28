import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AnalyticsProvider } from "@/components/analytics-provider";

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
  metadataBase: new URL("https://geraldbahati.com"),
  title: {
    default: "Gerald Bahati - Full Stack Developer & Digital Creative",
    template: "%s | Gerald Bahati",
  },
  description:
    "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design. Building exceptional web applications with Next.js, React, TypeScript, and more.",
  applicationName: "Gerald Bahati Portfolio",
  keywords: [
    "Gerald Bahati",
    "full stack developer",
    "web developer",
    "digital creative",
    "Next.js developer",
    "React developer",
    "TypeScript",
    "web design",
    "Trier developer",
    "Germany web development",
    "software engineer",
    "frontend developer",
    "backend developer",
  ],
  authors: [{ name: "Gerald Bahati", url: "https://geraldbahati.com" }],
  creator: "Gerald Bahati",
  publisher: "Gerald Bahati",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/convex.svg",
    apple: "/convex.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://geraldbahati.com",
    siteName: "Gerald Bahati Portfolio",
    title: "Gerald Bahati - Full Stack Developer & Digital Creative",
    description:
      "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design. Building exceptional web applications with Next.js, React, TypeScript, and more.",
    images: [
      {
        url: "https://geraldbahati.com/original.jpeg",
        width: 1200,
        height: 630,
        alt: "Gerald Bahati - Full Stack Developer & Digital Creative",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerald Bahati - Full Stack Developer & Digital Creative",
    description:
      "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design. Building exceptional web applications with Next.js, React, TypeScript, and more.",
    creator: "@geraldbahati",
    images: {
      url: "https://geraldbahati.com/original.jpeg",
      alt: "Gerald Bahati - Full Stack Developer & Digital Creative",
    },
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
    canonical: "https://geraldbahati.com",
  },
  category: "technology",
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
        <ConvexClientProvider>
          {children}
          <AnalyticsProvider />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
