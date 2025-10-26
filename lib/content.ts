// lib/content.ts
import fs from "fs/promises";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
        // If both files are missing, use default content
        return getDefaultPrivacyContent();
      }
    }

    // Parse frontmatter if present
    const { content: mdxContent, frontmatter } = parseFrontmatter(content);

    // Clean content to prevent MDX parsing errors
    const cleanedContent = cleanMDXContent(mdxContent);

    // Serialize MDX content with plugins
    const serialized = await serialize(cleanedContent, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          // Remove rehypePrism if causing issues
        ],
        development: process.env.NODE_ENV === 'development',
      },
      parseFrontmatter: false,
    });

    return {
      ...serialized,
      frontmatter,
    };
  } catch (error) {
    console.error("Error loading privacy content:", error);
    // Return default content if there's any error
    return getDefaultPrivacyContent();
  }
}

// Function to clean MDX content and escape problematic characters
function cleanMDXContent(content: string): string {
  // Replace standalone curly braces that aren't part of MDX expressions
  let cleaned = content
    // Escape single curly braces that might cause issues
    .replace(/(?<!\\)\{(?!{)/g, '\\{')
    .replace(/(?<!\\)\}(?!})/g, '\\}')
    // But preserve double curly braces for interpolation
    .replace(/\\{\\{/g, '{{')
    .replace(/\\}\\}/g, '}}');

  // Remove or escape other problematic MDX characters if needed
  // For example, if you have angle brackets that look like JSX
  cleaned = cleaned
    .replace(/<(?!\/?(a|p|div|span|h[1-6]|ul|ol|li|strong|em|code|pre|blockquote|img|table|thead|tbody|tr|td|th|br|hr)\b)/gi, '&lt;')
    .replace(/(?<!<[^>]*)>/g, (match, offset, str) => {
      // Only replace if it's not part of an HTML tag
      const beforeText = str.substring(Math.max(0, offset - 50), offset);
      if (beforeText.includes('<') && !beforeText.includes('>')) {
        return match;
      }
      return '&gt;';
    });

  return cleaned;
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

async function getCurrentDate() {
  "use cache";
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

async function getDefaultPrivacyContent() {
  const currentDate = await getCurrentDate();
  const defaultContent = `# Privacy Policy

Last updated: ${currentDate}

## Introduction {#introduction}

Welcome to our privacy policy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.

---

## Data Collection {#data-collection}

### Information We Collect

We collect and process the following types of data:

**Information you provide directly:**
- Contact form submissions
- Email communications
- Newsletter subscriptions
- User preferences and settings

**Information collected automatically:**
- IP address and location data
- Browser type and version
- Device information
- Pages visited and time spent
- Referring website information

**Cookies and tracking technologies:**
- Essential cookies for site functionality
- Analytics cookies (with your consent)
- Preference cookies for user experience

---

## How We Use Your Data {#data-usage}

### Primary Uses

We use your personal data for the following purposes:

**Service delivery:**
- To provide and maintain our services
- To process your requests and communications
- To send you important updates and notifications

**Improvement and analytics:**
- To understand how our website is used
- To improve our services and user experience
- To conduct research and analytics

**Legal compliance:**
- To comply with legal obligations
- To protect our rights and interests
- To prevent fraud and abuse

---

## Data Sharing {#data-sharing}

### Our Commitment

**We do not sell your personal data.** We may share your data only in these limited circumstances:

**Service providers:**
- Trusted third-party service providers who assist in operating our website
- All providers are bound by strict data protection agreements

**Legal requirements:**
- When required by law or legal process
- To protect our rights, property, or safety
- To prevent or investigate fraud

**Business transfers:**
- In connection with mergers, acquisitions, or asset sales
- You will be notified of any such change in ownership

---

## Your Rights {#your-rights}

### Data Protection Rights

Under applicable data protection laws, you have the following rights:

**Access and portability:**
- Right to access your personal data
- Right to receive your data in a portable format

**Correction and deletion:**
- Right to correct inaccurate personal data
- Right to request deletion of your personal data

**Control and restriction:**
- Right to restrict processing of your data
- Right to object to processing
- Right to withdraw consent at any time

**How to exercise your rights:**
Contact us using the information below, and we will respond within 30 days.

---

## Data Security

We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is ever fully secure or error-free.

---

## Contact Information {#contact}

### Privacy Inquiries

For any privacy-related questions or concerns, please contact us:

**Email:** [privacy@geralbahati.com](mailto:privacy@geralbahati.com)

**Response time:** We aim to respond to all privacy inquiries within 48 hours.

---

*This privacy policy is effective as of the date listed above and may be updated from time to time. We will notify you of any significant changes.*`;

  try {
    return serialize(defaultContent, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
        development: process.env.NODE_ENV === 'development',
      },
    });
  } catch (error) {
    console.error("Error serializing default content:", error);
    // If even the default content fails, return a very basic serialized result
    return {
      compiledSource: '',
      scope: {},
      frontmatter: {},
    };
  }
}

// Alternative: Use a simpler approach without MDX if you're having issues
export async function getPrivacyContentSimple() {
  try {
    const contentPath = path.join(process.cwd(), "content", "privacy.md");
    const content = await fs.readFile(contentPath, "utf8");

    // Just return the raw markdown content
    return {
      content,
      isMarkdown: true,
    };
  } catch {
    return {
      content: await getDefaultMarkdown(),
      isMarkdown: true,
    };
  }
}

async function getDefaultMarkdown() {
  const currentDate = await getCurrentDate();
  return `# Privacy Policy

Last updated: ${currentDate}

## Introduction

We respect your privacy and are committed to protecting your personal data.

## Data Collection

We collect information you provide directly and automatically collected information.

## Your Rights

You have rights to access, correct, and delete your personal data.

## Contact

Email: privacy@yoursite.com`;
}
