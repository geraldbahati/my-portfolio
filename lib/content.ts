// lib/content.ts
import fs from "fs/promises";
import path from "path";
import GithubSlugger from "github-slugger";

export interface PrivacyHeading {
  id: string;
  title: string;
}

/**
 * Builds the quick-navigation list from the document's own `##` headings.
 *
 * `rehype-slug` derives heading IDs with github-slugger, so using the same
 * slugger here keeps the anchors in step with the rendered markup — hardcoding
 * them previously left every link in the table of contents pointing at an ID
 * that no longer existed.
 */
function extractHeadings(markdown: string): PrivacyHeading[] {
  const slugger = new GithubSlugger();
  const headings: PrivacyHeading[] = [];
  let inCodeFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) continue;

    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const title = match[1].replace(/\s*\{#[^}]*\}\s*$/, "").trim();
    if (title) {
      headings.push({ id: slugger.slug(title), title });
    }
  }

  return headings;
}

export async function getPrivacyContent() {
  try {
    // Try to read MDX file first, fallback to MD
    const contentPath = path.join(process.cwd(), "content", "privacy.mdx");
    const fallbackPath = path.join(process.cwd(), "content", "privacy.md");

    let content: string;

    try {
      content = await fs.readFile(contentPath, "utf8");
    } catch {
      try {
        content = await fs.readFile(fallbackPath, "utf8");
      } catch {
        // A missing policy document is a deploy fault, not a normal state —
        // make it visible rather than quietly serving the placeholder.
        console.error(
          "Privacy policy content missing: expected content/privacy.mdx or content/privacy.md",
        );
        return getDefaultPrivacyContent();
      }
    }

    // Parse frontmatter if present
    const { content: mdxContent, frontmatter } = parseFrontmatter(content);

    return {
      markdown: mdxContent,
      frontmatter,
      headings: extractHeadings(mdxContent),
    };
  } catch (error) {
    console.error("Error loading privacy content:", error);
    // Return default content if there's any error
    return getDefaultPrivacyContent();
  }
}

function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { content, frontmatter: {} };
  }

  const [, frontmatterStr, mainContent] = match;
  const frontmatter = frontmatterStr.split("\n").reduce(
    (acc, line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        acc[key.trim()] = valueParts.join(":").trim();
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return { content: mainContent, frontmatter };
}

/**
 * Rendered only when `content/privacy.md` cannot be read.
 *
 * This deliberately states no policy terms. It previously held a generic
 * template — newsletter subscriptions, "mergers, acquisitions, or asset sales",
 * corporate "we" voice — none of which describes this site, and all of which
 * contradicted the real policy. On a legal page, showing nothing beats showing
 * something untrue, so this now says only what is true: the document is
 * missing, and here is who to ask.
 */
function getDefaultPrivacyContent() {
  const notice = `# Privacy Policy

This privacy policy is temporarily unavailable because of a technical problem on my end.

Rather than risk showing you terms that may be inaccurate, no policy text is shown here. For the current policy — or to make any privacy request, including access, correction, deletion, or withdrawing consent — email [contact@geraldbahati.dev](mailto:contact@geraldbahati.dev) and I will respond directly.

Analytics stay switched off unless you have accepted them. You can change that choice using the controls below at any time.`;

  return {
    markdown: notice,
    frontmatter: {},
    headings: [] as PrivacyHeading[],
  };
}
