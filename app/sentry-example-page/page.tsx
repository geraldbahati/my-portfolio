import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SentryTestButton } from "./sentry-test-button";

export const metadata: Metadata = {
  title: "Sentry Verification",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SentryExamplePage() {
  if (process.env.ENABLE_SENTRY_TEST_PAGE !== "true") {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-xl space-y-6 rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Diagnostics
          </p>
          <h1 className="text-3xl font-bold">Sentry verification</h1>
          <p className="text-muted-foreground">
            Use this temporary page on a preview deployment to confirm browser
            and server errors reach the Sentry project. Disable the page
            immediately after verification.
          </p>
        </div>

        <SentryTestButton />
      </section>
    </main>
  );
}
