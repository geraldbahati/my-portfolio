import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";

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
        throw new Error(`Too many requests. Please try again in ${Math.ceil(retryAfter / (1000 * 60))} minutes.`);
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
          from: process.env.SENDER_EMAIL || "Portfolio Contact <contact@yourdomain.com>",
          to: process.env.RECIPIENT_EMAIL || "your-email@example.com",
          subject: `Portfolio Contact: ${args.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #333;">Contact Details</h3>
                <p><strong>Name:</strong> ${args.name}</p>
                <p><strong>Email:</strong> ${args.email}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Submission ID:</strong> ${submissionId}</p>
              </div>

              <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #333;">Message</h3>
                <div style="line-height: 1.6; color: #555;">
                  ${sanitizedMessage.replace(/\n/g, '<br>')}
                </div>
              </div>

              <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 8px; font-size: 12px; color: #666;">
                <p style="margin: 0;">This message was sent from your portfolio contact form.</p>
                <p style="margin: 5px 0 0 0;">Reply directly to this email to respond to ${args.name}.</p>
              </div>
            </div>
          `,
          replyTo: [args.email],
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
    return await ctx.db.query("contactSubmissions").collect().then(s => s.length);
  },
});

export const getContactSubmissions = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    let submissions;

    if (args.status) {
      submissions = await ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "sent" | "delivered" | "failed"))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      submissions = await ctx.db
        .query("contactSubmissions")
        .withIndex("by_submitted_at")
        .order("desc")
        .take(args.limit ?? 50);
    }

    return submissions.map(submission => ({
      ...submission,
      submittedAt: new Date(submission.submittedAt).toISOString(),
    }));
  },
});

export const getContactSubmission = query({
  args: { id: v.id("contactSubmissions") },
  handler: async (ctx, args) => {
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
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const [
      totalSubmissions,
      todaySubmissions,
      weekSubmissions,
      pendingSubmissions,
      failedSubmissions,
    ] = await Promise.all([
      ctx.db.query("contactSubmissions").collect().then(s => s.length),
      ctx.db.query("contactSubmissions")
        .withIndex("by_submitted_at", (q) => q.gte("submittedAt", dayAgo))
        .collect().then(s => s.length),
      ctx.db.query("contactSubmissions")
        .withIndex("by_submitted_at", (q) => q.gte("submittedAt", weekAgo))
        .collect().then(s => s.length),
      ctx.db.query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect().then(s => s.length),
      ctx.db.query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", "failed"))
        .collect().then(s => s.length),
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
