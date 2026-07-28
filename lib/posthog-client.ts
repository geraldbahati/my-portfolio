import type { PostHog } from "posthog-js";
import { getConsent } from "@/lib/consent";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

export const isPostHogEnabled =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" &&
  Boolean(posthogKey);

const SENSITIVE_QUERY_PARAMS = [
  "token",
  "secret",
  "key",
  "password",
  "api_key",
  "email",
];

const EXCLUDED_PATH_PREFIXES = ["/admin", "/private"];

let clientPromise: Promise<PostHog | null> | null = null;

function scrubUrl(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== "string" || rawUrl.length === 0) {
    return undefined;
  }

  try {
    const url = new URL(rawUrl);
    SENSITIVE_QUERY_PARAMS.forEach((param) => url.searchParams.delete(param));
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * PostHog is intentionally a dynamic import. Visitors who decline analytics
 * never download the SDK, and returning visitors who accepted load it only
 * after the main page is interactive.
 */
export function getPostHogClient(options?: {
  force?: boolean;
}): Promise<PostHog | null> {
  if (typeof window === "undefined" || !isPostHogEnabled || !posthogKey) {
    return Promise.resolve(null);
  }

  const consent = getConsent();
  if (!options?.force && consent !== "accepted") {
    return Promise.resolve(null);
  }

  if (!clientPromise) {
    clientPromise = import("posthog-js")
      .then(({ default: posthog }) => {
        const hasConsent = getConsent() === "accepted";

        posthog.init(posthogKey, {
          api_host: posthogHost,
          ui_host: "https://eu.posthog.com",
          defaults: "2026-05-30",
          persistence: hasConsent ? "localStorage+cookie" : "memory",
          opt_out_capturing_by_default: !hasConsent,
          person_profiles: "identified_only",
          capture_exceptions: false,
          disable_session_recording: true,
          before_send: (event) => {
            if (!event) {
              return null;
            }

            const currentPath = window.location.pathname;
            if (
              EXCLUDED_PATH_PREFIXES.some((prefix) =>
                currentPath.startsWith(prefix),
              )
            ) {
              return null;
            }

            const properties = { ...event.properties };
            for (const property of ["$current_url", "$referrer"]) {
              const scrubbed = scrubUrl(properties[property]);
              if (scrubbed) {
                properties[property] = scrubbed;
              } else {
                delete properties[property];
              }
            }

            return { ...event, properties };
          },
          loaded: (instance) => {
            if (process.env.NODE_ENV === "development") {
              instance.debug();
            }
          },
        });

        return posthog;
      })
      .catch((error) => {
        clientPromise = null;
        if (process.env.NODE_ENV === "development") {
          console.warn("[analytics] failed to load PostHog", error);
        }
        return null;
      });
  }

  return clientPromise;
}

export function schedulePostHogInitialization() {
  if (
    typeof window === "undefined" ||
    !isPostHogEnabled ||
    !posthogKey ||
    getConsent() !== "accepted"
  ) {
    return;
  }

  const initialize = () => {
    void getPostHogClient();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(initialize, { timeout: 2_000 });
  } else {
    globalThis.setTimeout(initialize, 1_000);
  }
}
