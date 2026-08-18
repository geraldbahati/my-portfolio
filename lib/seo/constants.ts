export const SITE_URL = "https://www.geraldbahati.dev";
export const SITE_NAME = "Gerald Bahati";
export const SITE_LOCALE = "en_KE";
export const SITE_LANGUAGE = "en-KE";
export const TWITTER_HANDLE = "@gerald_baha";

export const PERSON_ID = `${SITE_URL}/#gerald-bahati`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PROFILE_PAGE_ID = `${SITE_URL}/#profile-page`;

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/geraldbahati/",
  "https://github.com/geraldbahati",
  "https://www.instagram.com/ace._gb/",
  "https://x.com/gerald_baha",
] as const;

export const PERSON = {
  givenName: "Gerald",
  familyName: "Bahati",
  name: SITE_NAME,
  jobTitle: "Full-Stack Software Engineer",
  email: "contact@geraldbahati.dev",
  telephone: "+254-704-713-070",
  imagePath: "/hero-image.webp",
  locality: "Nairobi",
  countryCode: "KE",
  countryName: "Kenya",
  languages: ["English", "Swahili"],
  knowsAbout: [
    "Full-stack software engineering",
    "E-commerce platforms",
    "M-Pesa payment integrations",
    "Cloudflare Workers",
    "Edge computing",
    "Real-time systems",
    "React",
    "Next.js",
    "TypeScript",
    "Go",
    "Java",
  ],
} as const;

/**
 * Document title: brand + first-person hook + the keywords people actually
 * search alongside the name. Keep it in the 50–60 character band.
 */
export const SITE_TITLE =
  "I Build Fast E-Commerce With M-Pesa | Gerald Bahati";

export const SITE_DESCRIPTION =
  "I'm Gerald Bahati, a software engineer in Nairobi. I've shipped production e-commerce with Stripe and M-Pesa, Cloudflare edge caching, and real-time systems. Here's the work.";

export const SITE_KEYWORDS = [
  "Gerald Bahati",
  "Gerald Bahati software engineer",
  "Nairobi software engineer",
  "Kenya software engineer",
  "M-Pesa developer",
  "e-commerce software engineer",
  "Cloudflare Workers",
  "full-stack software engineer",
  "React",
  "Next.js",
  "TypeScript",
  "Go",
  "real-time systems",
] as const;

export const PAGE_COPY = {
  home: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: SITE_KEYWORDS,
  },
  projects: {
    title: "Projects I Shipped: E-Commerce, M-Pesa & Real-Time",
    description:
      "Case studies of production work I've shipped — e-commerce with Stripe and M-Pesa, real-time systems, and edge-first web products.",
    path: "/projects",
    keywords: [
      "Gerald Bahati projects",
      "e-commerce case study",
      "M-Pesa integration",
      "real-time systems",
      "Next.js portfolio",
    ],
  },
  contact: {
    title: "Work With Me — I Build E-Commerce From Nairobi",
    description:
      "I'm Gerald Bahati. Use the form for a project, consulting, or a hiring conversation. I work remotely from Nairobi with EU and US East overlap.",
    path: "/contact",
    keywords: [
      "hire Gerald Bahati",
      "Nairobi software engineer contact",
      "e-commerce developer Kenya",
      "M-Pesa developer",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How I collect, use, and protect personal information on geraldbahati.dev — including analytics consent, contact form data, and GDPR/Kenya DPA rights.",
    path: "/privacy",
    keywords: ["privacy policy", "data protection", "GDPR", "Kenya DPA"],
  },
  imprint: {
    title: "Imprint",
    description:
      "Legal notice for Gerald Bahati — business contact details and the person responsible for this site's content.",
    path: "/imprint",
    keywords: ["imprint", "legal notice", "Gerald Bahati"],
  },
} as const;
