// components/PrivacyPolicy.tsx
"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { format } from "date-fns";
import { PrintButton } from "./PrintButton";
import { ComponentProps } from "react";
import { Shield, Calendar, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;
}

export interface PrivacyPolicyProps {
  content: MDXRemoteSerializeResult | PrivacyPolicySection[];
  lastUpdated?: Date;
  className?: string;
}

// Custom MDX components for styling
const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-100 print:text-black"
      style={{ fontSize: "2.25rem" }}
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="text-3xl font-semibold mb-4 mt-6 text-gray-800 dark:text-gray-200 print:text-black"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="text-2xl font-medium mb-3 mt-4 text-gray-700 dark:text-gray-300 print:text-black"
      {...props}
    />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4
      className="text-xl font-medium mb-2 mt-3 text-gray-600 dark:text-gray-400 print:text-black"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p
      className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400 print:text-black print:leading-normal"
      {...props}
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-2 text-gray-600 dark:text-gray-400 print:text-black"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-2 text-gray-600 dark:text-gray-400 print:text-black"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => (
    <li
      className="pl-2 text-gray-600 dark:text-gray-400 print:text-black"
      {...props}
    />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-black hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:text-white dark:hover:text-gray-300 print:text-black"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600 dark:border-gray-600 dark:text-gray-400 print:border-gray-500"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4 print:bg-gray-50"
      {...props}
    />
  ),
};

export function PrivacyPolicy({
  content,
  lastUpdated,
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
    <div className={`privacy-policy-container min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 ${className}`}>
      {/* Skip to main content for accessibility */}
      <a
        href="#privacy-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 print:bg-white print:shadow-none overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10 dark:bg-white/5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className="text-4xl sm:text-5xl font-bold text-white print:text-black mb-2"
                    style={{ fontSize: "2.25rem" }}
                  >
                    Privacy Policy
                  </h1>
                  <p className="text-blue-100 dark:text-blue-200 print:text-gray-600 text-lg">
                    Your privacy and data protection matter to us
                  </p>
                </div>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-blue-100 dark:text-blue-200 print:text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm">
                    Last updated:{" "}
                    <time dateTime={lastUpdated.toISOString()} className="font-medium">
                      {format(lastUpdated, "MMMM d, yyyy")}
                    </time>
                  </p>
                </div>
              )}
            </div>
            <div className="print:hidden">
              <PrintButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="privacy-content"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative"
      >
        <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 prose prose-lg max-w-none dark:prose-invert print:prose-print print:shadow-none print:border-none print:bg-white">
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
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 print:hidden"
          aria-label="Table of contents"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Quick Navigation
          </h2>
          <ul className="space-y-2">
            <li>
              <a
                href="#data-collection"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline-offset-4 hover:underline"
              >
                Data Collection
              </a>
            </li>
            <li>
              <a
                href="#data-usage"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline-offset-4 hover:underline"
              >
                How We Use Your Data
              </a>
            </li>
            <li>
              <a
                href="#data-sharing"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline-offset-4 hover:underline"
              >
                Data Sharing
              </a>
            </li>
            <li>
              <a
                href="#your-rights"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline-offset-4 hover:underline"
              >
                Your Rights
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline-offset-4 hover:underline"
              >
                Contact Information
              </a>
            </li>
          </ul>
        </nav>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 print:hidden"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
