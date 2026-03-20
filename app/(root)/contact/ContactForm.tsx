"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { type ContactFormData, contactSchema } from "@/lib/validators/contactSchema";
import { api } from "@/convex/_generated/api";
import { useTrackForm } from "@/lib/hooks/useAnalytics";

interface ContactFormProps {
  onSubmitSuccess?: () => void;
}

type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

const EMPTY_SUBMIT_STATUS = { type: null, message: "" } as const;

const INITIAL_FORM_DATA: ContactFormData = {
  name: "",
  email: "",
  message: "",
  privacyConsent: false,
  _honeypot: "",
};

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>(EMPTY_SUBMIT_STATUS);

  const submitContactForm = useMutation(api.contactForm.submitContactForm);
  const trackForm = useTrackForm();

  const clearSubmitStatus = () => {
    setSubmitStatus((current) =>
      current.type ? EMPTY_SUBMIT_STATUS : current,
    );
  };

  const clearFieldError = (field: keyof ContactFormData) => {
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as keyof ContactFormData;

    setFormData((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
    clearSubmitStatus();
  };

  const handlePrivacyConsentChange = (checked: boolean | "indeterminate") => {
    setFormData((current) => ({
      ...current,
      privacyConsent: checked === true,
    }));
    clearFieldError("privacyConsent");
    clearSubmitStatus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearSubmitStatus();

    const validationResult = contactSchema.safeParse(formData);
    if (!validationResult.success) {
      const { fieldErrors: zodFieldErrors } = validationResult.error.flatten();
      setFieldErrors({
        name: zodFieldErrors.name?.[0],
        email: zodFieldErrors.email?.[0],
        message: zodFieldErrors.message?.[0],
        privacyConsent: zodFieldErrors.privacyConsent?.[0],
        _honeypot: zodFieldErrors._honeypot?.[0],
      });
      return;
    }

    setFieldErrors({});

    const data = validationResult.data;

    // Honeypot check
    if (data._honeypot) {
      setSubmitStatus({
        type: "error",
        message: "Invalid submission detected.",
      });
      return;
    }

    setIsSubmitting(true);
    const clientIP = await fetch("/api/get-ip")
      .then(async (response) => {
        if (!response.ok) return undefined;
        const ipData = (await response.json()) as { ip?: string };
        return ipData.ip;
      })
      .catch(() => undefined);

    const submission = await submitContactForm({
      name: data.name,
      email: data.email,
      message: data.message,
      privacyConsent: data.privacyConsent,
      clientIP,
    })
      .then((result) => ({ error: null as const, result }))
      .catch((error: unknown) => ({ error, result: null }));

    if (submission.error || !submission.result) {
      console.error("Form submission error:", submission.error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });
      trackForm("Contact Form", false, "contact-page-form", errorMessage);
      setIsSubmitting(false);
      return;
    }

    if (submission.result.success) {
      setSubmitStatus({
        type: "success",
        message: submission.result.message || "Message sent successfully!",
      });
      trackForm("Contact Form", true, "contact-page-form");
      setFormData(INITIAL_FORM_DATA);
      setFieldErrors({});
      onSubmitSuccess?.();
    } else {
      setSubmitStatus({
        type: "error",
        message:
          submission.result.error || "Failed to send message. Please try again.",
      });
      trackForm(
        "Contact Form",
        false,
        "contact-page-form",
        submission.result.error,
      );
    }

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
      noValidate
      itemScope
      itemType="https://schema.org/ContactForm"
      aria-label="Project inquiry contact form"
    >
      {/* Status message with aria-live region */}
      {submitStatus.type && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-md ${
            submitStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      {/* Honeypot field (hidden from users) */}
      <input
        name="_honeypot"
        type="text"
        value={formData._honeypot}
        onChange={handleInputChange}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <FieldGroup>
        {/* Name field */}
        <Field>
          <FieldLabel htmlFor="name" className="sr-only">
            Name
          </FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleInputChange}
            aria-invalid={fieldErrors.name ? "true" : "false"}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={`w-full border-black focus:border-black ${fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}`}
            itemProp="name"
          />
          {fieldErrors.name && (
            <FieldError id="name-error">{fieldErrors.name}</FieldError>
          )}
        </Field>

        {/* Email field */}
        <Field>
          <FieldLabel htmlFor="email" className="sr-only">
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="e-mail"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            aria-invalid={fieldErrors.email ? "true" : "false"}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={`w-full border-black focus:border-black ${fieldErrors.email ? "border-red-500 focus:border-red-500" : ""}`}
            itemProp="email"
          />
          {fieldErrors.email && (
            <FieldError id="email-error">{fieldErrors.email}</FieldError>
          )}
        </Field>

        {/* Message field */}
        <Field>
          <FieldLabel htmlFor="message" className="sr-only">
            Message
          </FieldLabel>
          <Textarea
            id="message"
            name="message"
            placeholder="News"
            rows={5}
            value={formData.message}
            onChange={handleInputChange}
            aria-invalid={fieldErrors.message ? "true" : "false"}
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
            className={`w-full resize-none border-black focus:border-black ${fieldErrors.message ? "border-red-500 focus:border-red-500" : ""}`}
            itemProp="text"
          />
          {fieldErrors.message && (
            <FieldError id="message-error">{fieldErrors.message}</FieldError>
          )}
        </Field>

        {/* Privacy consent checkbox */}
        <Field orientation="horizontal">
          <Checkbox
            id="privacy-consent"
            checked={formData.privacyConsent}
            onCheckedChange={handlePrivacyConsentChange}
            aria-invalid={fieldErrors.privacyConsent ? "true" : "false"}
            aria-describedby={
              fieldErrors.privacyConsent ? "privacy-error" : "privacy-description"
            }
            className={
              fieldErrors.privacyConsent ? "border-red-500" : "border-black"
            }
          />
          <FieldContent>
            <FieldLabel
              htmlFor="privacy-consent"
              className="inline font-normal"
            >
              I agree to the{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Read privacy policy (opens in new tab)"
              >
                privacy policy
              </Link>{" "}
              and consent to my data being temporarily stored for the purpose of
              processing this request.
            </FieldLabel>
            {fieldErrors.privacyConsent && (
              <FieldError id="privacy-error">
                {fieldErrors.privacyConsent}
              </FieldError>
            )}
          </FieldContent>
        </Field>

        {/* Submit button */}
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.privacyConsent}
            className="w-auto px-8 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            aria-describedby="submit-help"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>
          <FieldDescription id="submit-help" className="sr-only">
            {!formData.privacyConsent
              ? "You must agree to the privacy policy before submitting"
              : "Submit your contact form"}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
