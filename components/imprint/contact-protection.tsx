"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import imprintData from "@/constants/imprint.json";

interface ContactItemProps {
  label: string;
  value: string;
  type: "email" | "phone";
}

const ContactItem = ({ label, value, type }: ContactItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800">
      <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
        {label}
      </span>

      <div className="flex items-center justify-between gap-4 group">
        <a
          href={type === "email" ? `mailto:${value}` : `tel:${value}`}
          className="text-base font-semibold text-gray-900 dark:text-zinc-100 hover:text-primary transition-colors truncate"
        >
          {value}
        </a>
        <button
          onClick={handleCopy}
          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Copy to clipboard"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check size={16} />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy size={16} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

export function ContactProtection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <ContactItem
        label="Email Address"
        value={imprintData.contact.email}
        type="email"
      />
      <ContactItem
        label="Phone Number"
        value={imprintData.contact.phone}
        type="phone"
      />
    </div>
  );
}
