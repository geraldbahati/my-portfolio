"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const submitContactForm = useMutation(api.contactForm.submitContactForm);
  const trackForm = useTrackForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      privacyConsent: false,
      _honeypot: "",
    },
  });

  const privacyConsent = watch("privacyConsent");

  const onSubmit = async (data: ContactFormData) => {
    // Honeypot check
    if (data._honeypot) {
      setSubmitStatus({
        type: "error",
        message: "Invalid submission detected.",
      });
      return;
    }

    setSubmitStatus({ type: null, message: "" });

    try {
      // Get client IP (simplified approach)
      let clientIP: string | undefined;
      try {
        const response = await fetch("/api/get-ip");
        if (response.ok) {
          const ipData = await response.json();
          clientIP = ipData.ip;
        }
      } catch {
        // Fallback if IP detection fails
        clientIP = undefined;
      }

      const result = await submitContactForm({
        name: data.name,
        email: data.email,
        message: data.message,
        privacyConsent: data.privacyConsent,
        clientIP,
      });

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Message sent successfully!",
        });
        trackForm("Contact Form", true, "contact-page-form");
        reset();
        onSubmitSuccess?.();
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        });
        trackForm("Contact Form", false, "contact-page-form", result.error);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });
      trackForm("Contact Form", false, "contact-page-form", errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
        {...register("_honeypot")}
        type="text"
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
            type="text"
            placeholder="name"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`w-full border-black focus:border-black ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
            itemProp="name"
            {...register("name")}
          />
          {errors.name && (
            <FieldError id="name-error">{errors.name.message}</FieldError>
          )}
        </Field>

        {/* Email field */}
        <Field>
          <FieldLabel htmlFor="email" className="sr-only">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="e-mail"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`w-full border-black focus:border-black ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
            itemProp="email"
            {...register("email")}
          />
          {errors.email && (
            <FieldError id="email-error">{errors.email.message}</FieldError>
          )}
        </Field>

        {/* Message field */}
        <Field>
          <FieldLabel htmlFor="message" className="sr-only">
            Message
          </FieldLabel>
          <Textarea
            id="message"
            placeholder="News"
            rows={5}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`w-full resize-none border-black focus:border-black ${errors.message ? "border-red-500 focus:border-red-500" : ""}`}
            itemProp="text"
            {...register("message")}
          />
          {errors.message && (
            <FieldError id="message-error">{errors.message.message}</FieldError>
          )}
        </Field>

        {/* Privacy consent checkbox */}
        <Field orientation="horizontal">
          <Checkbox
            id="privacy-consent"
            checked={privacyConsent}
            onCheckedChange={(checked) =>
              setValue("privacyConsent", checked as boolean)
            }
            aria-invalid={errors.privacyConsent ? "true" : "false"}
            aria-describedby={
              errors.privacyConsent ? "privacy-error" : "privacy-description"
            }
            className={
              errors.privacyConsent ? "border-red-500" : "border-black"
            }
          />
          <FieldContent>
            <FieldLabel
              htmlFor="privacy-consent"
              className="inline font-normal"
            >
              I agree to the{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Read privacy policy (opens in new tab)"
              >
                privacy policy
              </a>{" "}
              and consent to my data being temporarily stored for the purpose of
              processing this request.
            </FieldLabel>
            {errors.privacyConsent && (
              <FieldError id="privacy-error">
                {errors.privacyConsent.message}
              </FieldError>
            )}
          </FieldContent>
        </Field>

        {/* Submit button */}
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={isSubmitting || !privacyConsent}
            className="w-auto px-8 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            aria-describedby="submit-help"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>
          <FieldDescription id="submit-help" className="sr-only">
            {!privacyConsent
              ? "You must agree to the privacy policy before submitting"
              : "Submit your contact form"}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
