// components/PrivacyPolicy.tsx
"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { PrintButton } from "./PrintButton";
import { ComponentProps } from "react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;
}

export interface PrivacyPolicyProps {
  content: MDXRemoteSerializeResult | PrivacyPolicySection[];
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
    <li
      className="pl-2 text-muted-foreground print:text-black"
      {...props}
    />
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
  content,
  className = "",
}: PrivacyPolicyProps) {
  const isArrayContent = Array.isArray(content);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`privacy-policy-container min-h-screen bg-gradient-to-br from-background to-muted print:bg-white ${className}`}>
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
          {isArrayContent ? (
            // Render sections if content is an array
            <div className="space-y-8">
              {content.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2>{section.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </section>
              ))}
            </div>
          ) : (
            // Render MDX content
            <MDXRemote {...content} components={mdxComponents} />
          )}
        </article>

        {/* Table of Contents */}
        <nav
          className="mt-12 pt-8 border-t border-border print:hidden"
          aria-label="Table of contents"
        >
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Quick Navigation
          </h2>
          <ul className="space-y-2">
            <li>
              <a
                href="#data-collection"
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Data Collection
              </a>
            </li>
            <li>
              <a
                href="#data-usage"
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                How We Use Your Data
              </a>
            </li>
            <li>
              <a
                href="#data-sharing"
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Data Sharing
              </a>
            </li>
            <li>
              <a
                href="#your-rights"
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Your Rights
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Contact Information
              </a>
            </li>
          </ul>
        </nav>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50 print:hidden">
        {/* Print Button - Always visible */}
        <div className="group">
          <PrintButton />
        </div>

        {/* Scroll to top button - Only when scrolled */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
