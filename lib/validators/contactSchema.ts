import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    })
    .max(255, "Email must be less than 255 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, "You must agree to the privacy policy"),
  // Honeypot field for spam protection
  _honeypot: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;