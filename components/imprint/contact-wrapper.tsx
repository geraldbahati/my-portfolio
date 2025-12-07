"use client";

import dynamic from "next/dynamic";
import { ContactSkeleton } from "./contact-skeleton";

const ContactProtection = dynamic(
  () => import("./contact-protection").then((mod) => mod.ContactProtection),
  {
    loading: () => <ContactSkeleton />,
    ssr: false,
  },
);

export function ContactWrapper() {
  return <ContactProtection />;
}
