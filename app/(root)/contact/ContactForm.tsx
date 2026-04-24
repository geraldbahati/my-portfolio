"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useTrackForm } from "@/lib/hooks/useAnalytics";
import {
  type ContactFormData,
  contactSchema,
} from "@/lib/validators/contactSchema";

interface ContactFormProps {
  onSubmitSuccess?: () => void;
}

type FieldErrors = Partial<Record<keyof ContactFormData, string>>;
type SubmitStatus = {
  type: "success" | "error" | null;
  message: string;
};

const CONTACT_EMAIL = "contact@geraldbahati.dev";
const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Project inquiry")}`;
const IS_CONVEX_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
const EMPTY_SUBMIT_STATUS: SubmitStatus = { type: null, message: "" };

const INITIAL_FORM_DATA: ContactFormData = {
  name: "",
  email: "",
  message: "",
  privacyConsent: false,
  _honeypot: "",
};

async function fetchClientIp() {
  try {
    const response = await fetch("/api/get-ip", {
      cache: "no-store",
    });

    if (!response.ok) {
      return undefined;
    }

    const ipData = (await response.json()) as { ip?: string | null };
    return ipData.ip ?? undefined;
  } catch {
    return undefined;
  }
}

function ContactFormUnavailable() {
  return (
    <div className="rounded-lg border border-black/10 bg-stone-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        Form unavailable
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-black">
        This environment cannot send inquiries
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
        The contact backend is not configured in this environment. Email{" "}
        <a
          className="font-medium text-black underline underline-offset-4"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          {CONTACT_EMAIL}
        </a>{" "}
        or use the phone or WhatsApp options on this page instead.
      </p>
      <Button
        asChild
        className="mt-5 w-auto bg-gray-950 px-6 text-white hover:bg-gray-900"
      >
        <a href={CONTACT_EMAIL_HREF}>Email Gerald</a>
      </Button>
    </div>
  );
}

function SubmitStatusNotice({ submitStatus }: { submitStatus: SubmitStatus }) {
  if (!submitStatus.type) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-md border p-4 ${
        submitStatus.type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {submitStatus.message}
    </div>
  );
}

function ContactFormIntro() {
  return (
    <div className="space-y-2">
      <h3 className="text-2xl font-semibold text-black">Get in touch</h3>
    </div>
  );
}

interface ContactFormFieldsProps {
  fieldErrors: FieldErrors;
  formData: ContactFormData;
  isSubmitting: boolean;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onPrivacyConsentChange: (checked: boolean | "indeterminate") => void;
}

function ContactFormFields({
  fieldErrors,
  formData,
  isSubmitting,
  onInputChange,
  onPrivacyConsentChange,
}: ContactFormFieldsProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="name" className="text-sm font-medium text-black">
          Name
        </FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          value={formData.name}
          onChange={onInputChange}
          aria-invalid={fieldErrors.name ? "true" : "false"}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          className={`w-full border-black focus:border-black ${
            fieldErrors.name ? "border-red-500 focus:border-red-500" : ""
          }`}
          itemProp="name"
        />
        {fieldErrors.name && (
          <FieldError id="name-error">{fieldErrors.name}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="email" className="text-sm font-medium text-black">
          Email
        </FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={formData.email}
          onChange={onInputChange}
          aria-invalid={fieldErrors.email ? "true" : "false"}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={`w-full border-black focus:border-black ${
            fieldErrors.email ? "border-red-500 focus:border-red-500" : ""
          }`}
          itemProp="email"
        />
        {fieldErrors.email && (
          <FieldError id="email-error">{fieldErrors.email}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel
          htmlFor="message"
          className="text-sm font-medium text-black"
        >
          Message
        </FieldLabel>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell me about the role, project, or support you need."
          rows={6}
          value={formData.message}
          onChange={onInputChange}
          aria-invalid={fieldErrors.message ? "true" : "false"}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className={`w-full resize-none border-black focus:border-black ${
            fieldErrors.message ? "border-red-500 focus:border-red-500" : ""
          }`}
          itemProp="text"
        />
        {fieldErrors.message && (
          <FieldError id="message-error">{fieldErrors.message}</FieldError>
        )}
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="privacy-consent"
          checked={formData.privacyConsent}
          onCheckedChange={onPrivacyConsentChange}
          aria-invalid={fieldErrors.privacyConsent ? "true" : "false"}
          aria-describedby={fieldErrors.privacyConsent ? "privacy-error" : undefined}
          className={
            fieldErrors.privacyConsent ? "border-red-500" : "border-black"
          }
        />
        <FieldContent>
          <FieldLabel
            htmlFor="privacy-consent"
            className="inline font-normal text-gray-800"
          >
            I agree to the{" "}
            <Link
              href="/privacy"
              prefetch={false}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read privacy policy (opens in new tab)"
            >
              privacy policy
            </Link>{" "}
            and consent to my details being used to review and reply to this
            message.
          </FieldLabel>
          {fieldErrors.privacyConsent && (
            <FieldError id="privacy-error">
              {fieldErrors.privacyConsent}
            </FieldError>
          )}
        </FieldContent>
      </Field>

      <Field>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.privacyConsent}
          className="w-auto bg-gray-950 px-8 py-2 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
        </Button>
      </Field>
    </FieldGroup>
  );
}

function ContactFormWithSubmission({ onSubmitSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] =
    useState<SubmitStatus>(EMPTY_SUBMIT_STATUS);

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

    if (data._honeypot) {
      setSubmitStatus({
        type: "error",
        message: "Invalid submission detected.",
      });
      return;
    }

    setIsSubmitting(true);

    const clientIP = await fetchClientIp();
    const submission: {
      error: unknown | null;
      result: Awaited<ReturnType<typeof submitContactForm>> | null;
    } = await submitContactForm({
      name: data.name,
      email: data.email,
      message: data.message,
      privacyConsent: data.privacyConsent,
      clientIP,
    })
      .then((result) => ({ error: null, result }))
      .catch((error: unknown) => ({ error, result: null }));

    if (submission.error || !submission.result) {
      console.error("Form submission error:", submission.error);
      const errorMessage = `The form could not be sent. Please try again or email ${CONTACT_EMAIL}.`;

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
        message:
          submission.result.message ||
          "Thanks. Your inquiry is in and I will review it soon.",
      });
      trackForm("Contact Form", true, "contact-page-form");
      setFormData(INITIAL_FORM_DATA);
      setFieldErrors({});
      onSubmitSuccess?.();
      setIsSubmitting(false);
      return;
    }

    setSubmitStatus({
      type: "error",
      message:
        submission.result.error ||
        `The form could not be sent. Please try again or email ${CONTACT_EMAIL}.`,
    });
    trackForm(
      "Contact Form",
      false,
      "contact-page-form",
      submission.result.error,
    );
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
      <SubmitStatusNotice submitStatus={submitStatus} />

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

      <ContactFormIntro />
      <ContactFormFields
        fieldErrors={fieldErrors}
        formData={formData}
        isSubmitting={isSubmitting}
        onInputChange={handleInputChange}
        onPrivacyConsentChange={handlePrivacyConsentChange}
      />
    </form>
  );
}

export default function ContactForm(props: ContactFormProps) {
  if (!IS_CONVEX_CONFIGURED) {
    return <ContactFormUnavailable />;
  }

  return <ContactFormWithSubmission {...props} />;
}
