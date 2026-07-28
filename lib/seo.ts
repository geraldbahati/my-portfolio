export const SITE_URL = "https://www.geraldbahati.dev";
export const SITE_NAME = "Gerald Bahati";
export const SITE_TITLE =
  "Gerald Bahati | Full-Stack Software Engineer in Nairobi";
export const SITE_DESCRIPTION =
  "Gerald Bahati is a full-stack software engineer in Nairobi building fast e-commerce platforms, real-time systems, and modern web products.";
export const PERSON_ID = `${SITE_URL}/#gerald-bahati`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PROFILE_PAGE_ID = `${SITE_URL}/#profile-page`;

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/geraldbahati/",
  "https://github.com/geraldbahati",
  "https://www.instagram.com/ace._gb/",
  "https://x.com/gerald_baha",
] as const;

export function generateStructuredData(data: Record<string, unknown>) {
  const baseSchema = {
    "@context": "https://schema.org",
    ...data,
  };

  return baseSchema;
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
