import { describe, expect, it } from "vitest";
import {
  contactPageNode,
  faqPageNode,
  generateBreadcrumbSchema,
  homepageGraph,
  projectWorkNode,
} from "./json-ld";
import { renderLlmsTxt } from "./llms-txt";
import { pageMetadata } from "./metadata";
import { PERSON_ID, SITE_NAME, SITE_TITLE, SITE_URL } from "./constants";

describe("homepageGraph", () => {
  it("emits Person, ProfilePage, WebSite, and FAQPage on one graph", () => {
    const graph = homepageGraph([
      {
        question: "ARE YOU OPEN TO REMOTE ROLES?",
        answer: "Yes. I work remotely from Nairobi.",
      },
    ]);
    const serialized = JSON.stringify(graph);

    expect(serialized).toContain('"@type":"WebSite"');
    expect(serialized).toContain('"@type":"ProfilePage"');
    expect(serialized).toContain('"@type":"Person"');
    expect(serialized).toContain('"@type":"FAQPage"');
    expect(serialized).toContain(`"@id":"${PERSON_ID}"`);
    expect(serialized).toContain('"givenName":"Gerald"');
    expect(serialized).toContain("M-Pesa");
  });
});

describe("projectWorkNode", () => {
  it("nests a Review only when a testimonial exists", () => {
    const withoutReview = JSON.stringify(
      projectWorkNode({
        slug: "rapid-gmbh",
        name: "Rapid GmbH",
        description: "Recruiting site",
      }),
    );
    expect(withoutReview).not.toContain('"@type":"Review"');

    const withReview = JSON.stringify(
      projectWorkNode({
        slug: "rapid-gmbh",
        name: "Rapid GmbH",
        description: "Recruiting site",
        image: "/projects/rapid.webp",
        testimonial: {
          quote: "Gerald shipped the platform on time.",
          authorName: "Klaus Hering",
          authorRole: "Sales Management",
          authorCompany: "Rapid GmbH",
        },
      }),
    );
    expect(withReview).toContain('"@type":"Review"');
    expect(withReview).toContain("Gerald shipped the platform on time.");
    expect(withReview).toContain(`${SITE_URL}/projects/rapid.webp`);
    expect(withReview).not.toContain("aggregateRating");
  });
});

describe("faqPageNode", () => {
  it("maps questions to acceptedAnswer text", () => {
    const node = faqPageNode([
      { question: "WHAT IS YOUR STACK?", answer: "TypeScript, Go, Java." },
    ]);
    expect(node.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "WHAT IS YOUR STACK?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TypeScript, Go, Java.",
        },
      },
    ]);
  });
});

describe("generateBreadcrumbSchema", () => {
  it("numbers items from 1", () => {
    const schema = generateBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Projects", url: `${SITE_URL}/projects` },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ position: 1, name: "Home" }),
        expect.objectContaining({ position: 2, name: "Projects" }),
      ]),
    );
  });
});

describe("contactPageNode", () => {
  it("points the ContactPage at the Person entity", () => {
    const serialized = JSON.stringify(contactPageNode());
    expect(serialized).toContain('"@type":"ContactPage"');
    expect(serialized).toContain(PERSON_ID);
    expect(serialized).toContain("contact@geraldbahati.dev");
  });
});

describe("pageMetadata", () => {
  it("keeps branded titles absolute and noindexes legal pages", () => {
    const indexed = pageMetadata({
      title: SITE_TITLE,
      description: "desc",
      path: "/",
    });
    expect(indexed.title).toEqual({ absolute: SITE_TITLE });
    expect(indexed.alternates?.canonical).toBe(SITE_URL);

    const legal = pageMetadata({
      title: "Privacy Policy",
      description: "desc",
      path: "/privacy",
      robots: "noindex",
    });
    expect(legal.robots).toMatchObject({ index: false, follow: true });
  });
});

describe("renderLlmsTxt", () => {
  it("lists published projects and the crawlable pages", () => {
    const body = renderLlmsTxt([
      {
        id: "webline",
        title: "Webline Technologies",
        description: "E-commerce with M-Pesa.",
      },
    ]);
    expect(body.startsWith(`# ${SITE_NAME}`)).toBe(true);
    expect(body).toContain(`${SITE_URL}/projects/webline`);
    expect(body).toContain("E-commerce with M-Pesa.");
    expect(body).toContain("/contact");
    expect(body).not.toContain("/admin");
  });
});
