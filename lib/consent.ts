/**
 * Analytics consent state.
 *
 * The privacy policy promises analytics cookies are only set "with your
 * consent", so PostHog starts opted out with in-memory persistence and is only
 * upgraded to cookie/localStorage persistence once the visitor accepts.
 *
 * Reading and writing goes through here so the banner, the PostHog bootstrap in
 * `instrumentation-client.ts`, and `lib/analytics.ts` never disagree about the
 * current decision.
 */

export type ConsentDecision = "accepted" | "rejected";
export type ConsentState = ConsentDecision | "pending";

const CONSENT_STORAGE_KEY = "analytics-consent";

/**
 * The pre-PostHog opt-out flag. Anyone who set it under the old Vercel
 * Analytics setup stays opted out without being asked again.
 */
const LEGACY_OPT_OUT_KEY = "analytics-opt-out";

const CONSENT_CHANGE_EVENT = "analytics-consent-change";

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    // Storage can throw in private-mode or partitioned-cookie contexts.
    return null;
  }
}

export function getConsent(): ConsentState {
  const storage = safeLocalStorage();
  if (!storage) {
    return "pending";
  }

  if (storage.getItem(LEGACY_OPT_OUT_KEY)) {
    return "rejected";
  }

  const stored = storage.getItem(CONSENT_STORAGE_KEY);
  return stored === "accepted" || stored === "rejected" ? stored : "pending";
}

export function setConsent(decision: ConsentDecision) {
  const storage = safeLocalStorage();

  if (storage) {
    storage.setItem(CONSENT_STORAGE_KEY, decision);

    if (decision === "accepted") {
      storage.removeItem(LEGACY_OPT_OUT_KEY);
    } else {
      storage.setItem(LEGACY_OPT_OUT_KEY, "true");
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ConsentDecision>(CONSENT_CHANGE_EVENT, {
        detail: decision,
      }),
    );
  }
}

export function subscribeToConsent(listener: (decision: ConsentDecision) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    listener((event as CustomEvent<ConsentDecision>).detail);
  };

  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
}
