"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { PrintButton } from "./PrintButton";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function PrivacyPolicyActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 print:hidden">
      <div className="group">
        <PrintButton />
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-[background-color,box-shadow] duration-200 hover:bg-primary/90 hover:shadow-xl"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
