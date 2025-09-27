import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { resend } from "./contactForm";

const http = httpRouter();

// Resend webhook endpoint for email status updates
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;