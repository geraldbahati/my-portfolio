import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

const client = Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  sampleRate: 1,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
  sendDefaultPii: false,
  maxBreadcrumbs: 30,
  attachStacktrace: true,
});

if (process.env.SENTRY_VERIFY_MODE === "true") {
  client?.on("afterSendEvent", (event, response) => {
    process.stdout.write(
      `SENTRY_VERIFICATION_DELIVERY ${JSON.stringify({
        eventId: event.event_id,
        statusCode: response.statusCode,
      })}\n`,
    );
  });
}
