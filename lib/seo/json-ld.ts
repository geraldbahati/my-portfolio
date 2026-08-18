import {
  PAGE_COPY,
  PERSON,
  PERSON_ID,
  PROFILE_PAGE_ID,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_PROFILES,
  WEBSITE_ID,
} from "./constants";
import { canonicalUrl, toAbsoluteSiteUrl } from "./urls";

export type JsonLdNode = Record<string, unknown>;

export type FaqEntry = {
  question: string;
  answer: string;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type ProjectWorkInput = {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  dateCreated?: number;
  dateModified?: number;
  keywords?: string[];
  genre?: string;
  videoUrl?: string;
  videoPoster?: string;
  testimonial?: {
    quote: string;
    authorName: string;
    authorRole?: string;
    authorCompany?: string;
  } | null;
};

function withContext(node: JsonLdNode): JsonLdNode {
  return {
    "@context": "https://schema.org",
    ...node,
  };
}

export function jsonLdGraph(nodes: JsonLdNode[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function generateStructuredData(data: JsonLdNode): JsonLdNode {
  return withContext(data);
}

export function personNode(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PERSON.name,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    url: SITE_URL,
    image: {
      "@type": "ImageObject",
      url: toAbsoluteSiteUrl(PERSON.imagePath),
      caption: `${PERSON.name}, ${PERSON.jobTitle} in ${PERSON.locality}`,
    },
    jobTitle: PERSON.jobTitle,
    description: SITE_DESCRIPTION,
    email: PERSON.email,
    knowsLanguage: [...PERSON.languages],
    knowsAbout: [...PERSON.knowsAbout],
    hasOccupation: {
      "@type": "Occupation",
      name: PERSON.jobTitle,
      occupationLocation: {
        "@type": "City",
        name: PERSON.locality,
        addressCountry: PERSON.countryCode,
      },
      skills: PERSON.knowsAbout.join(", "),
    },
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: PERSON.locality,
        addressCountry: PERSON.countryCode,
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: PERSON.locality,
      addressCountry: PERSON.countryCode,
    },
    sameAs: [...SOCIAL_PROFILES],
    mainEntityOfPage: { "@id": PROFILE_PAGE_ID },
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: "Gerald Bahati Portfolio",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
  };
}

export function profilePageNode(): JsonLdNode {
  return {
    "@type": "ProfilePage",
    "@id": PROFILE_PAGE_ID,
    url: SITE_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
  };
}

export function faqPageNode(faqs: readonly FaqEntry[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function homepageGraph(faqs: readonly FaqEntry[]): JsonLdNode {
  return jsonLdGraph([
    websiteNode(),
    profilePageNode(),
    personNode(),
    ...(faqs.length > 0 ? [faqPageNode(faqs)] : []),
  ]);
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdNode {
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function projectWorkNode(input: ProjectWorkInput): JsonLdNode {
  const url = canonicalUrl(`/projects/${input.slug}`);
  const image = input.image ? toAbsoluteSiteUrl(input.image) : undefined;
  const videoUrl = input.videoUrl
    ? toAbsoluteSiteUrl(input.videoUrl)
    : undefined;
  const videoPoster = input.videoPoster
    ? toAbsoluteSiteUrl(input.videoPoster)
    : image;

  const node: JsonLdNode = {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: input.name,
    description: input.description,
    url,
    inLanguage: SITE_LANGUAGE,
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(image
      ? {
          image: {
            "@type": "ImageObject",
            url: image,
          },
        }
      : {}),
    ...(input.genre ? { genre: input.genre } : {}),
    ...(input.keywords && input.keywords.length > 0
      ? { keywords: input.keywords.join(", ") }
      : {}),
    ...(input.dateCreated
      ? { dateCreated: new Date(input.dateCreated).toISOString() }
      : {}),
    ...(input.dateModified
      ? { dateModified: new Date(input.dateModified).toISOString() }
      : {}),
  };

  if (videoUrl) {
    node.video = {
      "@type": "VideoObject",
      name: input.name,
      description: input.description,
      contentUrl: videoUrl,
      thumbnailUrl: videoPoster,
      ...(input.dateCreated
        ? { uploadDate: new Date(input.dateCreated).toISOString() }
        : {}),
    };
  }

  if (input.testimonial?.quote) {
    node.review = {
      "@type": "Review",
      reviewBody: input.testimonial.quote,
      author: {
        "@type": "Person",
        name: input.testimonial.authorName,
        ...(input.testimonial.authorRole
          ? { jobTitle: input.testimonial.authorRole }
          : {}),
        ...(input.testimonial.authorCompany
          ? {
              worksFor: {
                "@type": "Organization",
                name: input.testimonial.authorCompany,
              },
            }
          : {}),
      },
      itemReviewed: { "@id": `${url}#work` },
    };
  }

  return withContext(node);
}

export function projectListNode(
  projects: Array<{
    id: string;
    title: string;
    description?: string;
    alt?: string;
    poster?: string;
    src?: string;
    badges?: Array<{ text: string }>;
  }>,
): JsonLdNode {
  return withContext({
    "@type": "ItemList",
    name: PAGE_COPY.projects.title,
    description: PAGE_COPY.projects.description,
    url: canonicalUrl("/projects"),
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        "@id": `${canonicalUrl(`/projects/${project.id}`)}#work`,
        name: project.title,
        description: project.description || project.alt,
        url: canonicalUrl(`/projects/${project.id}`),
        author: { "@id": PERSON_ID },
        ...(project.poster
          ? { image: toAbsoluteSiteUrl(project.poster) }
          : {}),
        ...(project.badges?.length
          ? { keywords: project.badges.map((badge) => badge.text).join(", ") }
          : {}),
      },
    })),
  });
}

export function contactPageNode(): JsonLdNode {
  return withContext({
    "@type": "ContactPage",
    "@id": `${canonicalUrl("/contact")}#page`,
    name: PAGE_COPY.contact.title,
    description: PAGE_COPY.contact.description,
    url: canonicalUrl("/contact"),
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@id": PERSON_ID,
      "@type": "Person",
      name: PERSON.name,
      url: SITE_URL,
      jobTitle: PERSON.jobTitle,
      email: PERSON.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: PERSON.locality,
        addressCountry: PERSON.countryCode,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: PERSON.telephone,
        email: PERSON.email,
        contactType: "customer support",
        availableLanguage: [...PERSON.languages],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          opens: "08:00",
          closes: "18:00",
        },
      },
    },
  });
}
