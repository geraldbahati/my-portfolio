import { components, internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Resend, vOnEmailEventArgs } from "@convex-dev/resend";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { requireAdmin } from "./auth";
import { contactSchema } from "../lib/validators/contactSchema";

// Initialize Resend with test mode disabled for production.
// The explicit annotation is required: `resend` is exported, so the generated
// `internal` object includes it, and the `onEmailEvent` reference below would
// otherwise make its type depend on itself (TS7022).
export const resend: Resend = new Resend(components.resend, {
  testMode: false, // Set to true for development
  // Without this, delivery outcomes never reach the app: submissions stay on
  // whatever status they had at send time and `delivered` is unreachable.
  onEmailEvent: internal.contactForm.handleEmailEvent,
});

/**
 * Delivery outcomes that change a submission's stored status. Events not listed
 * here (opened, clicked, delivery_delayed, complained) are still reported to
 * analytics but say nothing about whether the inquiry arrived.
 */
const STATUS_BY_EVENT: Partial<
  Record<string, "sent" | "delivered" | "failed">
> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.bounced": "failed",
  "email.failed": "failed",
};

/**
 * Runs when Resend reports what happened to an email.
 *
 * The stored `emailId` belongs to the notification sent to me, so this answers
 * the question the client cannot: did the inquiry actually land in my inbox, or
 * did it bounce after the form told the visitor it had been sent?
 */
// Declared with `vOnEmailEventArgs` rather than `resend.defineOnEmailEvent`:
// the latter derives its type from the `resend` instance, whose own options
// reference this mutation, and TypeScript cannot resolve that cycle.
export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  returns: v.null(),
  handler: async (ctx, { id, event }) => {
    const submission = await ctx.db
      .query("contactSubmissions")
      // `.first()` rather than `.unique()`: a duplicate or unmatched ID must not
      // throw and cost us the webhook. The confirmation email sent to the
      // visitor has no stored ID, so its events legitimately match nothing.
      .withIndex("by_email_id", (q) => q.eq("emailId", id))
      .first();

    const status = STATUS_BY_EVENT[event.type];

    if (submission && status && submission.status !== status) {
      await ctx.db.patch(submission._id, { status });
    }

    await ctx.scheduler.runAfter(0, internal.analytics.captureServerEvent, {
      event: "inquiry_email_status_changed",
      distinctId: id,
      properties: {
        status: event.type.replace("email.", ""),
        email_id: id,
        // Whether this event could be tied back to a stored submission at all.
        matched_submission: submission !== null,
      },
    });

    return null;
  },
});

// Initialize rate limiter for contact form submissions
const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Per-address bucket. On its own this constrains nobody, since an address is
  // trivial to vary — hence the global backstop below.
  contactForm: { kind: "token bucket", rate: 5, period: HOUR, capacity: 3 },
  // Caps total outbound volume regardless of how many distinct addresses are
  // used. This is what bounds how far the form can be abused to send mail from
  // this domain, which would put its sending reputation at risk.
  contactFormGlobal: {
    kind: "token bucket",
    rate: 30,
    period: HOUR,
    capacity: 10,
  },
});

const contactStatusValidator = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("delivered"),
  v.literal("failed"),
);

const contactSubmissionValidator = v.object({
  _id: v.id("contactSubmissions"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
  message: v.string(),
  emailId: v.optional(v.string()),
  status: contactStatusValidator,
  submittedAt: v.string(),
  clientIP: v.optional(v.string()),
  userAgent: v.optional(v.string()),
});

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    privacyConsent: v.boolean(),
    /** Hidden field; a real person never fills it. Non-empty means a bot. */
    honeypot: v.optional(v.string()),
    /**
     * Temporary rollout compatibility for the pre-PR production client.
     * Deliberately ignored: rate limiting must never trust a client-supplied IP.
     */
    clientIP: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      success: v.literal(true),
      message: v.string(),
      submissionId: v.id("contactSubmissions"),
      emailId: v.string(),
    }),
    v.object({
      success: v.literal(false),
      error: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    try {
      // This mutation is publicly callable, so every rule the client enforces
      // has to be enforced again here. Both sides run the same schema so the
      // two cannot drift apart.
      const parsed = contactSchema.safeParse({
        name: args.name,
        email: args.email,
        message: args.message,
        privacyConsent: args.privacyConsent,
        _honeypot: args.honeypot ?? "",
      });

      if (!parsed.success) {
        return {
          success: false as const,
          error: parsed.error.issues[0]?.message ?? "Invalid submission.",
        };
      }

      // Checked here rather than only in the browser: a direct call to this
      // mutation never runs the client-side check.
      if (parsed.data._honeypot) {
        return {
          success: false as const,
          error: "Invalid submission detected.",
        };
      }

      const name = parsed.data.name.trim();
      const email = parsed.data.email.trim().toLowerCase();
      const message = parsed.data.message;

      // Keyed on the address alone. The key used to include an IP taken from a
      // client argument, which let a caller mint a fresh bucket per request
      // simply by sending a different value.
      const perAddress = await rateLimiter.limit(ctx, "contactForm", {
        key: `email:${email}`,
      });

      if (!perAddress.ok) {
        throw new Error(
          `Too many requests. Please try again in ${Math.ceil(perAddress.retryAfter / (1000 * 60))} minutes.`,
        );
      }

      // Consumed only after validation, so malformed submissions cannot drain it.
      const overall = await rateLimiter.limit(ctx, "contactFormGlobal");

      if (!overall.ok) {
        throw new Error(
          `Too many requests. Please try again in ${Math.ceil(overall.retryAfter / (1000 * 60))} minutes.`,
        );
      }

      const escapedName = escapeHtml(name);
      const escapedEmail = escapeHtml(email);
      const escapedMessage = escapeHtml(message);
      const senderEmail = process.env.SENDER_EMAIL;
      const recipientEmail = process.env.RECIPIENT_EMAIL;

      if (!senderEmail || !recipientEmail) {
        console.error(
          "Contact email configuration is missing SENDER_EMAIL or RECIPIENT_EMAIL",
        );
        throw new Error("Contact service is not configured");
      }

      // Store submission in database first
      const submissionId = await ctx.db.insert("contactSubmissions", {
        name,
        email,
        message: escapedMessage,
        status: "pending",
        submittedAt: Date.now(),
      });

      try {
        // Send email using Resend
        const emailId = await resend.sendEmail(ctx, {
          from: senderEmail,
          to: recipientEmail,
          subject: `Portfolio Contact: ${escapedName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                <tr><td align="center">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

                    <!-- Logo -->
                    <tr><td align="center" style="padding-bottom: 32px;">
                      <img src="https://geraldbahati.dev/logo.webp" alt="GB" width="48" height="48" style="display: block; filter: invert(1);">
                    </td></tr>

                    <!-- Header -->
                    <tr><td style="background-color: #141414; border-radius: 12px 12px 0 0; padding: 32px 32px 24px; border-top: 3px solid #d97706;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #d97706; font-weight: 600;">New Submission</p>
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">Message from ${escapedName}</h1>
                    </td></tr>

                    <!-- Contact Details -->
                    <tr><td style="background-color: #141414; padding: 0 32px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; border: 1px solid #262626;">
                        <tr>
                          <td style="padding: 16px 20px; border-bottom: 1px solid #262626;">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #737373;">Name</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #e5e5e5; font-weight: 500;">${escapedName}</p>
                          </td>
                          <td style="padding: 16px 20px; border-bottom: 1px solid #262626; border-left: 1px solid #262626;">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #737373;">Email</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #d97706; font-weight: 500;">${escapedEmail}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #737373;">Submitted</p>
                            <p style="margin: 4px 0 0; font-size: 14px; color: #a3a3a3; font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace; font-size: 13px;">${new Date().toLocaleString()}</p>
                          </td>
                          <td style="padding: 16px 20px; border-left: 1px solid #262626;">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #737373;">ID</p>
                            <p style="margin: 4px 0 0; font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #a3a3a3;">${submissionId}</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>

                    <!-- Message -->
                    <tr><td style="background-color: #141414; padding: 0 32px 32px;">
                      <p style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #737373; font-weight: 600;">Message</p>
                      <div style="background-color: #1a1a1a; border-radius: 8px; border: 1px solid #262626; padding: 20px;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #d4d4d4;">
                          ${escapedMessage.replace(/\n/g, "<br>")}
                        </p>
                      </div>
                    </td></tr>

                    <!-- Reply CTA -->
                    <tr><td style="background-color: #141414; padding: 0 32px 32px; border-radius: 0 0 12px 12px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr><td style="background-color: #d97706; border-radius: 6px;">
                          <a href="mailto:${escapedEmail}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #000000; text-decoration: none; letter-spacing: 0.5px;">Reply to ${escapedName}</a>
                        </td></tr>
                      </table>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td align="center" style="padding: 24px 32px;">
                      <p style="margin: 0; font-size: 12px; color: #525252; line-height: 1.5;">Sent from your portfolio contact form</p>
                      <p style="margin: 8px 0 0; font-size: 12px; color: #404040;">geraldbahati.dev</p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
          `,
          replyTo: [args.email],
        });

        // Send confirmation email to the user
        await resend.sendEmail(ctx, {
          from: senderEmail,
          to: email,
          subject: "Got your message — I'll be in touch soon",
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                <tr><td align="center">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

                    <!-- Logo -->
                    <tr><td align="center" style="padding-bottom: 32px;">
                      <img src="https://geraldbahati.dev/logo.webp" alt="GB" width="48" height="48" style="display: block; filter: invert(1);">
                    </td></tr>

                    <!-- Main Card -->
                    <tr><td style="background-color: #141414; border-radius: 12px; border-top: 3px solid #d97706; padding: 40px 32px;">

                      <!-- Greeting -->
                      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">Thanks for reaching out!</h1>
                      <p style="margin: 0 0 24px; font-size: 15px; color: #a3a3a3;">Hi ${escapedName},</p>

                      <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #d4d4d4;">
                        Thanks for getting in touch. I've received your message and will get back to you shortly.
                      </p>

                      <!-- Divider -->
                      <hr style="border: none; border-top: 1px solid #262626; margin: 0 0 24px;">

                      <!-- Sign-off -->
                      <p style="margin: 0; font-size: 15px; color: #d4d4d4; line-height: 1.6;">
                        Talk soon,<br>
                        <strong style="color: #ffffff;">Gerald Bahati</strong>
                      </p>
                      <p style="margin: 8px 0 0; font-size: 13px; color: #737373;">Software Engineer</p>

                    </td></tr>

                    <!-- Footer -->
                    <tr><td align="center" style="padding: 24px 32px;">
                      <p style="margin: 0 0 8px;">
                        <a href="https://geraldbahati.dev" style="font-size: 13px; color: #d97706; text-decoration: none; font-weight: 500;">geraldbahati.dev</a>
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #404040; line-height: 1.5;">
                        You received this email because you submitted a message through my portfolio.
                      </p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
          `,
        });

        // Update submission with email ID and status
        await ctx.db.patch(submissionId, {
          emailId,
          status: "sent",
        });

        // Log successful submission for development
        console.log("Contact form submission successful:", {
          submissionId,
          emailId,
          name,
          email,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true as const,
          message: "Thank you for your message! I'll get back to you soon.",
          submissionId,
          emailId,
        };
      } catch (emailError) {
        // Update submission status to failed
        await ctx.db.patch(submissionId, {
          status: "failed",
        });

        console.error("Email sending failed:", emailError);
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);

      // Return user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes("Too many requests")) {
          return {
            success: false as const,
            error: error.message,
          };
        }
        if (error.message.includes("Privacy consent")) {
          return {
            success: false as const,
            error: "You must agree to the privacy policy to submit this form.",
          };
        }
      }

      return {
        success: false as const,
        error: "Something went wrong. Please try again later.",
      };
    }
  },
});

// Query functions for managing contact submissions

export const getContactSubmissionCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("contactSubmissions")
      .collect()
      .then((s) => s.length);
  },
  returns: v.number(),
});

export const getContactSubmissions = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(contactStatusValidator),
  },
  returns: v.array(contactSubmissionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let submissions;

    if (args.status) {
      submissions = await ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) =>
          q.eq(
            "status",
            args.status as "pending" | "sent" | "delivered" | "failed",
          ),
        )
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      submissions = await ctx.db
        .query("contactSubmissions")
        .withIndex("by_submitted_at")
        .order("desc")
        .take(args.limit ?? 50);
    }

    return submissions.map((submission) => ({
      ...submission,
      submittedAt: new Date(submission.submittedAt).toISOString(),
    }));
  },
});

export const getContactSubmission = query({
  args: { id: v.id("contactSubmissions") },
  returns: v.union(contactSubmissionValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const submission = await ctx.db.get(args.id);
    if (!submission) return null;

    return {
      ...submission,
      submittedAt: new Date(submission.submittedAt).toISOString(),
    };
  },
});

export const getContactStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    today: v.number(),
    week: v.number(),
    pending: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const [
      totalSubmissions,
      todaySubmissions,
      weekSubmissions,
      pendingSubmissions,
      failedSubmissions,
    ] = await Promise.all([
      ctx.db
        .query("contactSubmissions")
        .collect()
        .then((s) => s.length),
      ctx.db
        .query("contactSubmissions")
        .withIndex("by_submitted_at", (q) => q.gte("submittedAt", dayAgo))
        .collect()
        .then((s) => s.length),
      ctx.db
        .query("contactSubmissions")
        .withIndex("by_submitted_at", (q) => q.gte("submittedAt", weekAgo))
        .collect()
        .then((s) => s.length),
      ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect()
        .then((s) => s.length),
      ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", "failed"))
        .collect()
        .then((s) => s.length),
    ]);

    return {
      total: totalSubmissions,
      today: todaySubmissions,
      week: weekSubmissions,
      pending: pendingSubmissions,
      failed: failedSubmissions,
    };
  },
});
