"use client";

export function SentryTestButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/sentry-example", {
          method: "POST",
        });

        throw new Error(
          `Sentry verification error from the portfolio test page ${new Date().toISOString()}`,
        );
      }}
      className="rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      Trigger test error
    </button>
  );
}
