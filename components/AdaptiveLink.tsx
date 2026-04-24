"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MutableRefObject,
  type Ref,
} from "react";
import Link from "next/link";
import { useAdaptivePrefetch } from "@/hooks/use-adaptive-prefetch";

interface AdaptiveLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  prefetchOnViewport?: boolean;
  prefetchRootMargin?: string;
  prefetchDelayMs?: number;
}

function assignRef<T>(ref: Ref<T | null> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as MutableRefObject<T | null>).current = value;
}

export const AdaptiveLink = forwardRef<HTMLAnchorElement, AdaptiveLinkProps>(
  function AdaptiveLink(
    {
      href,
      onFocus,
      onMouseEnter,
      prefetchOnViewport = false,
      prefetchRootMargin,
      prefetchDelayMs,
      ...props
    },
    ref,
  ) {
    const { prefetchProps, prefetchRef } = useAdaptivePrefetch(href, {
      prefetchOnViewport,
      rootMargin: prefetchRootMargin,
      delayMs: prefetchDelayMs,
    });

    return (
      <Link
        {...props}
        href={href}
        prefetch={false}
        ref={(node) => {
          assignRef(ref, node);
          prefetchRef(node);
        }}
        onFocus={(event) => {
          prefetchProps.onFocus();
          onFocus?.(event);
        }}
        onMouseEnter={(event) => {
          prefetchProps.onMouseEnter();
          onMouseEnter?.(event);
        }}
      />
    );
  },
);
