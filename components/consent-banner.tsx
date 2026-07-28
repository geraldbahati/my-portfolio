"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { TextScramble } from "@/components/ui/text-scramble";
import {
  getConsent,
  setConsent,
  subscribeToConsent,
  type ConsentDecision,
  type ConsentState,
} from "@/lib/consent";
import { applyConsent } from "@/lib/analytics";

/**
 * Both choices share one component so they can never drift apart visually.
 *
 * Giving "Accept" more weight than "Decline" — a filled button against a ghost
 * one — is the standard dark pattern in cookie banners. Here the two are
 * identical in size, colour and type, and only the wording and position
 * differ.
 */
function ConsentAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      // The scramble animation randomises the visible characters mid-flight, so
      // the name is stated explicitly rather than derived from text content.
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group cursor-pointer px-1 py-1 focus:outline-none"
    >
      <span
        className={`inline-block border-b pb-1 font-light text-sm uppercase tracking-[0.2em] text-white transition-colors duration-300 group-focus-visible:border-primary ${
          isHovered ? "border-primary" : "border-white/40"
        }`}
      >
        <TextScramble trigger={isHovered} duration={0.5} speed={0.04} as="span">
          {label}
        </TextScramble>
      </span>
    </button>
  );
}

const emptySubscribe = () => () => {};
const serverConsent = (): ConsentState => "pending";

function decideConsent(decision: ConsentDecision) {
  setConsent(decision);
  applyConsent(decision);
}

export function ConsentBanner() {
  // The decision lives in localStorage, so the server can't know it. Rendering
  // only after hydration avoids flashing the banner at people who already
  // answered.
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

  const isVisible =
    isHydrated &&
    consent === "pending" &&
    Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  if (!isVisible) {
    return null;
  }

  return (
    // Anchored to the bottom with no scrim: nothing is captured until a choice
    // is made, so there's no reason to dim the page and rush it.
    <dialog
      open
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className="animate-consent-slide-up fixed inset-x-0 bottom-0 z-[60] m-0 w-full max-w-none border-x-0 border-b-0 border-t border-white/15 bg-black/95 p-0 text-white backdrop-blur-sm"
    >
      <h2 id="consent-title" className="sr-only">
        Analytics consent
      </h2>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8">
        <div className="space-y-2">
          <span
            aria-hidden="true"
            className="block text-xs font-light uppercase tracking-[0.3em] text-primary"
          >
            Analytics
          </span>

          <p
            id="consent-description"
            className="max-w-2xl text-sm font-light leading-6 text-gray-400"
          >
            I use privacy-friendly analytics, hosted in the EU, to see which
            work people find useful. Nothing is stored on your device until you
            choose.{" "}
            <Link
              href="/privacy"
              prefetch={false}
              className="border-b border-gray-400/50 pb-px text-white transition-colors duration-300 hover:border-primary"
            >
              Privacy policy
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-8 sm:gap-10">
          <ConsentAction
            label="Decline"
            onClick={() => decideConsent("rejected")}
          />
          <ConsentAction
            label="Accept"
            onClick={() => decideConsent("accepted")}
          />
        </div>
      </div>
    </dialog>
  );
}
