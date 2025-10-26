"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="p-3 bg-card hover:bg-accent text-foreground border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Print this page"
      type="button"
    >
      <Printer className="w-5 h-5" />
    </button>
  );
}
