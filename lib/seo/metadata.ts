import type { Metadata } from "next";
import {
  PAGE_COPY,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  TWITTER_HANDLE,
} from "./constants";

const INDEXABLE_GOOGLE_BOT = {
  index: true,
  follow: true,
  "max-video-preview": -1,
  "max-image-preview": "large" as const,
  "max-snippet": -1,
};

type RobotsMode = "index" | "noindex";

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  /** Skip the "%s | Gerald Bahati" template. Default true — titles already carry the brand. */
  absoluteTitle?: boolean;
  robots?: RobotsMode;
  ogType?: "website" | "article" | "profile";
  publishedTime?: string;
  authors?: string[];
};

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  absoluteTitle = true,
  robots = "index",
  ogType = "website",
  publishedTime,
  authors,
}: PageMetadataInput): Metadata {
  const index = robots === "index";

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: {
      canonical: path === "/" ? SITE_URL : path,
      languages: {
        "en-KE": path,
        "x-default": path,
      },
    },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      url: path,
      ...(ogType === "article" && publishedTime ? { publishedTime } : {}),
      ...(ogType === "article" && authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index,
      follow: true,
      nocache: false,
      googleBot: index
        ? INDEXABLE_GOOGLE_BOT
        : { index: false, follow: true },
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Gerald Bahati",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: INDEXABLE_GOOGLE_BOT,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-KE": "/",
      "x-default": "/",
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "technology",
  other: {
    "color-scheme": "light only",
  },
};

export const homeMetadata = pageMetadata({
  ...PAGE_COPY.home,
  ogType: "profile",
});

export const projectsIndexMetadata = pageMetadata(PAGE_COPY.projects);

export const contactMetadata = pageMetadata(PAGE_COPY.contact);

export const privacyMetadata = pageMetadata({
  ...PAGE_COPY.privacy,
  robots: "noindex",
});

export const imprintMetadata = pageMetadata({
  ...PAGE_COPY.imprint,
  robots: "noindex",
});
