/**
 * Portfolio tracking plan, backed by PostHog.
 *
 * Event names are snake_case and past tense to match the naming already in use
 * across the PostHog organisation (`cta_clicked`, `navigation_clicked`, ...).
 *
 * The plan is deliberately small. Autocapture already records every click and
 * pageview; these events exist because they answer questions autocapture can't:
 *
 *   1. Does anyone actually reach the inquiry form, and where do they drop?
 *   2. Which case studies hold attention, and which get a glance?
 *   3. Which surface (hero, navbar, footer, project page) drives contact?
 *
 * Anything that doesn't feed one of those questions doesn't belong here.
 */

import { getPostHogClient } from "@/lib/posthog-client";

/** Where in the page an interaction happened. */
export type Surface =
  | "hero"
  | "navbar"
  | "menu_overlay"
  | "footer"
  | "contact_section"
  | "contact_page"
  | "project_detail"
  | "projects_index"
  | "home_grid";

export type ContactChannel = "phone" | "whatsapp" | "email";

type EventProperties = Record<string, string | number | boolean | undefined>;

function capture(event: string, properties?: EventProperties) {
  // Without a key, PostHog was never initialized in `instrumentation-client.ts`
  // and every call would be a no-op that still logs SDK warnings.
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  void getPostHogClient().then((posthog) => {
    try {
      posthog?.capture(event, properties);
    } catch (error) {
      // Analytics must never take the page down with it.
      if (process.env.NODE_ENV === "development") {
        console.warn("[analytics] capture failed", event, error);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Conversion path — the reason the site exists
// ---------------------------------------------------------------------------

/** Any click on something whose intent is "start a conversation". */
export function trackContactCtaClicked(params: {
  surface: Surface;
  label: string;
  destination?: string;
}) {
  capture("contact_cta_clicked", params);
}

/** First real keystroke in the inquiry form — separates lookers from starters. */
export function trackContactFormStarted(params: { first_field: string }) {
  capture("contact_form_started", params);
}

export function trackContactFormSubmitted(params: {
  outcome: "success" | "error";
  message_length?: number;
  duration_ms?: number;
  error_reason?: string;
}) {
  capture("contact_form_submitted", params);
}

/** Phone, WhatsApp or mailto — the paths that bypass the form entirely. */
export function trackContactChannelClicked(params: {
  channel: ContactChannel;
  surface: Surface;
}) {
  capture("contact_channel_clicked", params);
}

// ---------------------------------------------------------------------------
// Work engagement — which case studies earn attention
// ---------------------------------------------------------------------------

/** A project card scrolled into view — the denominator for card click-through. */
export function trackProjectCardViewed(params: {
  project_slug: string;
  project_title?: string;
  surface?: Surface;
}) {
  capture("project_card_viewed", params);
}

export function trackProjectOpened(params: {
  project_slug: string;
  project_title?: string;
  surface?: Surface;
  position?: number;
}) {
  capture("project_opened", params);
}

/** Fired once per depth bucket per page view. */
export function trackScrollDepthReached(params: {
  depth: number;
  page: string;
  project_slug?: string;
}) {
  capture("scroll_depth_reached", params);
}

// ---------------------------------------------------------------------------
// Discovery and navigation
// ---------------------------------------------------------------------------

export function trackNavigationClicked(params: {
  label: string;
  destination: string;
  surface: Surface;
}) {
  capture("navigation_clicked", params);
}

export function trackMenuToggled(params: { state: "opened" | "closed" }) {
  capture("menu_toggled", params);
}

export function trackOutboundLinkClicked(params: {
  destination: string;
  surface: Surface;
  platform?: string;
}) {
  let host: string | undefined;
  try {
    host = new URL(params.destination).hostname;
  } catch {
    host = undefined;
  }

  capture("outbound_link_clicked", { ...params, destination_host: host });
}

export function trackFaqOpened(params: { question: string; position: number }) {
  capture("faq_opened", params);
}

/** Which sections are actually seen, as opposed to scrolled past. */
export function trackSectionViewed(params: {
  section_id: string;
  page: string;
}) {
  capture("section_viewed", params);
}

/**
 * Applies a consent decision to the live PostHog instance.
 *
 * Accepting upgrades persistence from memory to cookie/localStorage before
 * opting in, so the visitor gets a stable distinct ID from their first captured
 * event rather than a new one on every page load. Declining opts out, which
 * also clears anything PostHog previously stored.
 *
 * Shared by the consent banner and the controls on the privacy page so the two
 * can never apply consent differently.
 */
export function applyConsent(decision: "accepted" | "rejected") {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  void getPostHogClient({ force: true }).then((posthog) => {
    if (!posthog) return;

    try {
      if (decision === "accepted") {
        posthog.set_config({ persistence: "localStorage+cookie" });
        posthog.opt_in_capturing();
        posthog.capture("analytics_consent_updated", { decision });
        return;
      }

      posthog.opt_out_capturing();
      posthog.set_config({ persistence: "memory" });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[analytics] failed to apply consent", error);
      }
    }
  });
}
