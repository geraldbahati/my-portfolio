import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { AnalyticsPreferences } from "./analytics-preferences";
import { PrivacyPolicyActions } from "./PrivacyPolicyActions";
import type { PrivacyHeading } from "@/lib/content";

export interface PrivacyPolicyProps {
  markdown: string;
  /** Derived from the document's own headings so anchors can't go stale. */
  headings?: PrivacyHeading[];
  className?: string;
}

// Custom MDX components for styling
const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="text-4xl font-bold mb-6 mt-8 text-foreground print:text-black"
      style={{ fontSize: "2.25rem" }}
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="text-3xl font-semibold mb-4 mt-6 text-foreground print:text-black"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="text-2xl font-medium mb-3 mt-4 text-foreground print:text-black"
      {...props}
    />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4
      className="text-xl font-medium mb-2 mt-3 text-muted-foreground print:text-black"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p
      className="mb-4 leading-relaxed text-muted-foreground print:text-black print:leading-normal"
      {...props}
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground print:text-black"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-2 text-muted-foreground print:text-black"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => (
    <li className="pl-2 text-muted-foreground print:text-black" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 print:text-black"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-4 border-border pl-4 italic my-4 text-muted-foreground print:border-gray-500"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="bg-muted rounded px-1 py-0.5 text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="bg-muted rounded-lg p-4 overflow-x-auto mb-4 print:bg-gray-50"
      {...props}
    />
  ),
};

export function PrivacyPolicy({
  markdown,
  headings = [],
  className = "",
}: PrivacyPolicyProps) {
  return (
    <div
      className={`privacy-policy-container min-h-screen bg-gradient-to-br from-background to-muted print:bg-white ${className}`}
    >
      {/* Skip to main content for accessibility */}
      <a
        href="#privacy-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded print:hidden"
      >
        Skip to main content
      </a>

      {/* Main Content - Add top padding to account for fixed navbar */}
      <main
        id="privacy-content"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 relative print:py-8 print:pt-8"
      >
        <article className="bg-card rounded-3xl shadow-xl border border-border p-8 sm:p-12 prose prose-lg max-w-none dark:prose-invert print:rounded-none print:shadow-none print:border-none print:bg-white print:p-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ]}
            components={mdxComponents}
          >
            {markdown}
          </ReactMarkdown>
        </article>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <nav
            className="mt-12 pt-8 border-t border-border print:hidden"
            aria-label="Table of contents"
          >
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Quick Navigation
            </h2>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    {heading.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <AnalyticsPreferences />
      </main>

      <PrivacyPolicyActions />
    </div>
  );
}
