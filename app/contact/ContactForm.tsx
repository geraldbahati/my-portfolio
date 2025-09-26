"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { contactSchema, type ContactFormData } from "@/lib/validators/contactSchema";
import { api } from "@/convex/_generated/api";

interface ContactFormProps {
  onSubmitSuccess?: () => void;
}

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const submitContactForm = useMutation(api.contactForm.submitContactForm);

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
      const result = await submitContactForm({
        name: data.name,
        email: data.email,
        message: data.message,
        privacyConsent: data.privacyConsent,
      });

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Message sent successfully!",
        });
        reset();
        onSubmitSuccess?.();
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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

      {/* Name field */}
      <div className="space-y-2">
        <label htmlFor="name" className="sr-only">
          Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="name"
          autoComplete="name"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`w-full ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="e-mail"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message field */}
      <div className="space-y-2">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="News"
          rows={5}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`w-full resize-none ${errors.message ? "border-red-500 focus:border-red-500" : ""}`}
          {...register("message")}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-sm text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Privacy consent checkbox */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy-consent"
            checked={privacyConsent}
            onCheckedChange={(checked) => setValue("privacyConsent", checked as boolean)}
            aria-invalid={errors.privacyConsent ? "true" : "false"}
            aria-describedby={errors.privacyConsent ? "privacy-error" : "privacy-description"}
            className={errors.privacyConsent ? "border-red-500" : ""}
          />
          <div className="space-y-1">
            <label
              htmlFor="privacy-consent"
              className="text-sm text-gray-600 leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy policy
              </a>{" "}
              and consent to my data being temporarily stored for the purpose of processing this
              request.
            </label>
            <p id="privacy-description" className="sr-only">
              Required: You must agree to the privacy policy to submit this form
            </p>
          </div>
        </div>
        {errors.privacyConsent && (
          <p id="privacy-error" role="alert" className="text-sm text-red-600">
            {errors.privacyConsent.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isSubmitting || !privacyConsent}
        className="w-auto px-8 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        aria-describedby="submit-help"
      >
        {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
      </Button>
      <p id="submit-help" className="sr-only">
        {!privacyConsent
          ? "You must agree to the privacy policy before submitting"
          : "Submit your contact form"}
      </p>
    </form>
  );
}