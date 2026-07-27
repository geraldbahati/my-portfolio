"use client";

import { Printer } from "lucide-react";

function handlePrint() {
  window.print();
}

export function PrintButton() {
  return (
    <button
      onClick={handlePrint}
      className="p-3 bg-card hover:bg-accent text-foreground border border-border rounded-full shadow-lg hover:shadow-xl transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Print this page"
      type="button"
    >
      <Printer className="w-5 h-5" />
    </button>
  );
}
