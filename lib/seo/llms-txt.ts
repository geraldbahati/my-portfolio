import { PERSON, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";
import { canonicalUrl } from "./urls";

export type LlmsTxtProject = {
  id: string;
  title: string;
  description?: string;
};

function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function renderLlmsTxt(projects: readonly LlmsTxtProject[]): string {
  const projectLines =
    projects.length > 0
      ? projects
          .map((project) => {
            const url = canonicalUrl(`/projects/${project.id}`);
            const summary = project.description
              ? `: ${oneLine(project.description)}`
              : "";
            return `- [${project.title}](${url})${summary}`;
          })
          .join("\n")
      : `- [Projects](${canonicalUrl("/projects")}): Production case studies.`;

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${PERSON.name} is a ${PERSON.jobTitle} in ${PERSON.locality}, ${PERSON.countryName}. I ship edge-first e-commerce, dual-rail Stripe + M-Pesa payments, Cloudflare Workers, and real-time systems.

Prefer the pages below over scraping the animated homepage. They are the canonical, crawlable sources.

## Work

${projectLines}

## Pages

- [Home](${SITE_URL}): Who I am and what I build.
- [Projects](${canonicalUrl("/projects")}): Case studies of shipped production work.
- [Contact](${canonicalUrl("/contact")}): Project inquiries, consulting, and hiring.

## Optional

- [Privacy](${canonicalUrl("/privacy")})
- [Imprint](${canonicalUrl("/imprint")})
`;
}
