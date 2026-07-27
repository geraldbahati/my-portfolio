import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Server-side PostHog capture.
 *
 * Client-side analytics can only report what the browser sees, and it is gated
 * on the visitor's consent. Delivery of the inquiry notification is neither:
 * it happens after the browser is gone, and it concerns my own sending
 * infrastructure rather than the visitor's behaviour.
 *
 * Events captured here therefore carry no personal data and set
 * `$process_person_profile: false`, so no person profile is created or updated.
 * Nothing here is behavioural tracking, and nothing here depends on — or works
 * around — the analytics consent banner.
 */

const DEFAULT_HOST = "https://eu.i.posthog.com";

export const captureServerEvent = internalAction({
  args: {
    event: v.string(),
    /**
     * An opaque, non-personal identifier. Person profiles are disabled, so this
     * only groups the event; it never resolves to a human.
     */
    distinctId: v.string(),
    properties: v.optional(
      v.record(
        v.string(),
        v.union(v.string(), v.number(), v.boolean(), v.null()),
      ),
    ),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const projectKey = process.env.POSTHOG_PROJECT_KEY;

    // Analytics is optional infrastructure — a missing key must never turn a
    // delivery webhook into a failure.
    if (!projectKey) {
      return null;
    }

    const host = process.env.POSTHOG_HOST ?? DEFAULT_HOST;

    try {
      const response = await fetch(`${host}/i/v0/e/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: projectKey,
          event: args.event,
          distinct_id: args.distinctId,
          timestamp: new Date().toISOString(),
          properties: {
            ...args.properties,
            $process_person_profile: false,
          },
        }),
      });

      if (!response.ok) {
        console.error(
          `[analytics] PostHog capture failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error("[analytics] PostHog capture threw", error);
    }

    return null;
  },
});
