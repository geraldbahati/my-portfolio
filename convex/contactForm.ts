import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { requireAdmin } from "./auth";

// Initialize Resend with test mode disabled for production
export const resend = new Resend(components.resend, {
  testMode: false, // Set to true for development
});

// Initialize rate limiter for contact form submissions
const rateLimiter = new RateLimiter(components.rateLimiter, {
  contactForm: { kind: "token bucket", rate: 5, period: HOUR, capacity: 3 },
});

export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    privacyConsent: v.boolean(),
    clientIP: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Validate privacy consent
      if (!args.privacyConsent) {
        throw new Error("Privacy consent is required");
      }

      // Rate limiting by IP or user session
      const rateLimitKey = args.clientIP || "default";
      const { ok, retryAfter } = await rateLimiter.limit(ctx, "contactForm", {
        key: rateLimitKey,
      });

      if (!ok) {
        throw new Error(
          `Too many requests. Please try again in ${Math.ceil(retryAfter / (1000 * 60))} minutes.`,
        );
      }

      // Sanitize message content
      const sanitizedMessage = args.message
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");

      // Store submission in database first
      const submissionId = await ctx.db.insert("contactSubmissions", {
        name: args.name,
        email: args.email,
        message: sanitizedMessage,
        status: "pending",
        submittedAt: Date.now(),
        clientIP: args.clientIP,
      });

      try {
        // Send email using Resend
        const emailId = await resend.sendEmail(ctx, {
          from:
            process.env.SENDER_EMAIL ||
            "Gerald Bahati <contact@yourdomain.com>",
          to: process.env.RECIPIENT_EMAIL || "your-email@example.com",
          subject: `Portfolio Contact: ${args.name}`,
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
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">Message from ${args.name}</h1>
                    </td></tr>

                    <!-- Contact Details -->
                    <tr><td style="background-color: #141414; padding: 0 32px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; border: 1px solid #262626;">
                        <tr>
                          <td style="padding: 16px 20px; border-bottom: 1px solid #262626;">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #737373;">Name</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #e5e5e5; font-weight: 500;">${args.name}</p>
                          </td>
                          <td style="padding: 16px 20px; border-bottom: 1px solid #262626; border-left: 1px solid #262626;">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #737373;">Email</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #d97706; font-weight: 500;">${args.email}</p>
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
                          ${sanitizedMessage.replace(/\n/g, "<br>")}
                        </p>
                      </div>
                    </td></tr>

                    <!-- Reply CTA -->
                    <tr><td style="background-color: #141414; padding: 0 32px 32px; border-radius: 0 0 12px 12px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr><td style="background-color: #d97706; border-radius: 6px;">
                          <a href="mailto:${args.email}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #000000; text-decoration: none; letter-spacing: 0.5px;">Reply to ${args.name}</a>
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
          from:
            process.env.SENDER_EMAIL ||
            "Gerald Bahati <contact@yourdomain.com>",
          to: args.email,
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
                      <p style="margin: 0 0 24px; font-size: 15px; color: #a3a3a3;">Hi ${args.name},</p>

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
          name: args.name,
          email: args.email,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
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
            success: false,
            error: error.message,
          };
        }
        if (error.message.includes("Privacy consent")) {
          return {
            success: false,
            error: "You must agree to the privacy policy to submit this form.",
          };
        }
      }

      return {
        success: false,
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
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("sent"),
        v.literal("delivered"),
        v.literal("failed"),
      ),
    ),
  },
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
