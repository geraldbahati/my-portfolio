import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  sampleRate: 1,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
  sendDefaultPii: false,
  maxBreadcrumbs: 20,
  attachStacktrace: true,
});
