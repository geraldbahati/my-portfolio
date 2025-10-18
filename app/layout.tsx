import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://geraldbahati.com'),
  title: {
    default: 'Gerald Bahati - Full Stack Developer & Digital Creative',
    template: '%s | Gerald Bahati',
  },
  description: 'Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design. Building exceptional web applications with Next.js, React, TypeScript, and more.',
  keywords: [
    'Gerald Bahati',
    'full stack developer',
    'web developer',
    'digital creative',
    'Next.js developer',
    'React developer',
    'TypeScript',
    'web design',
    'Trier developer',
    'Germany web development',
  ],
  authors: [{ name: 'Gerald Bahati', url: 'https://geraldbahati.com' }],
  creator: 'Gerald Bahati',
  publisher: 'Gerald Bahati',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/convex.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://geraldbahati.com',
    siteName: 'Gerald Bahati Portfolio',
    title: 'Gerald Bahati - Full Stack Developer & Digital Creative',
    description: 'Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gerald Bahati - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gerald Bahati - Full Stack Developer & Digital Creative',
    description: 'Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design.',
    images: ['/og-image.png'],
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
    canonical: 'https://geraldbahati.com',
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
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <Navbar />
            {children}
            <Footer />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
