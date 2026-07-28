"use client";

import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import {
  getConsent,
  setConsent,
  subscribeToConsent,
  type ConsentDecision,
  type ConsentState,
} from "@/lib/consent";
import { applyConsent } from "@/lib/analytics";

const emptySubscribe = () => () => {};
const serverConsent = (): ConsentState => "pending";

const STATUS_TEXT: Record<ConsentState, string> = {
  pending: "You haven't chosen yet. Analytics are off until you do.",
  accepted: "Analytics are on. Thank you — it genuinely helps.",
  rejected: "Analytics are off. Nothing is being collected.",
};

function chooseConsent(decision: ConsentDecision) {
  setConsent(decision);
  applyConsent(decision);
}

/**
 * Both options are given identical weight, matching the consent banner: the
 * selected one is marked, but neither is visually promoted over the other.
 */
function PreferenceOption({
  label,
  isSelected,
  onSelect,
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      <Check
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`}
      />
      {label}
    </button>
  );
}

/**
 * Lets a visitor change or withdraw analytics consent from the privacy policy
 * itself, so withdrawing is as easy as giving it — which is what the policy
 * promises in Section 6 and what GDPR Article 7(3) requires.
 */
export function AnalyticsPreferences() {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsent,
    serverConsent,
  );

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }

  return (
    <section
      id="analytics-preferences"
      aria-labelledby="analytics-preferences-title"
      className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 print:hidden"
    >
      <h2
        id="analytics-preferences-title"
        className="text-xl font-semibold text-foreground"
      >
        Analytics preferences
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Analytics are hosted in the EU and are only collected with your consent.
        You can change your mind here at any time, and the change takes effect
        immediately.
      </p>

      <p
        aria-live="polite"
        className="mt-4 text-sm font-medium text-foreground"
      >
        {/* Rendered only after hydration: the choice lives in localStorage, so
            the server would otherwise state the wrong status. */}
        {isHydrated ? STATUS_TEXT[consent] : STATUS_TEXT.pending}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <PreferenceOption
          label="Allow analytics"
          isSelected={isHydrated && consent === "accepted"}
          onSelect={() => chooseConsent("accepted")}
        />
        <PreferenceOption
          label="Don't allow analytics"
          isSelected={isHydrated && consent === "rejected"}
          onSelect={() => chooseConsent("rejected")}
        />
      </div>
    </section>
  );
}
