/**
 * Client observability bootstrap.
 *
 * Sentry initializes before hydration so it can capture page-load traces,
 * navigation spans, and early runtime errors. PostHog remains a dynamic import
 * after consent and browser idle.
 */

import * as Sentry from "@sentry/nextjs";
import { schedulePostHogInitialization } from "@/lib/posthog-client";

const SENSITIVE_QUERY_PARAMS = [
  "token",
  "secret",
  "key",
  "password",
  "api_key",
  "email",
];

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
  tracePropagationTargets: ["localhost", /^\//],
  sendDefaultPii: false,
  maxBreadcrumbs: 30,
  attachStacktrace: true,
  beforeSend(event) {
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        for (const parameter of SENSITIVE_QUERY_PARAMS) {
          url.searchParams.delete(parameter);
        }
        event.request.url = url.toString();
      } catch {
        delete event.request.url;
      }
    }

    if (event.user) {
      event.user = event.user.id ? { id: event.user.id } : undefined;
    }

    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

schedulePostHogInitialization();
