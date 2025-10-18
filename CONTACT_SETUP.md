# Contact Form Setup Guide

This guide explains how to set up and configure the contact form for your portfolio website.

## Overview

The contact form is built with:
- **Next.js 15** with App Router
- **Convex** for backend functionality and database storage
- **Resend** for email delivery
- **React Hook Form** + **Zod** for validation
- **Shadcn/ui** components for UI
- **Rate limiting** for spam protection
- **Database schema** for submission tracking and analytics

## Required Environment Variables

Add the following environment variables to your Convex deployment:

### For Email Sending (Required)
```bash
SENDER_EMAIL=your-verified-sender@yourdomain.com
RECIPIENT_EMAIL=your-email@example.com
```

### For Resend (Required)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

### For Webhook (Optional but Recommended)
```bash
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

## Setup Instructions

### 1. Configure Resend

1. **Create a Resend account** at [resend.com](https://resend.com)
2. **Add your domain** in the Resend dashboard
3. **Verify your domain** by adding the required DNS records
4. **Generate an API key** and add it to your Convex environment as `RESEND_API_KEY`
5. **Set up a verified sender email** (must be from your verified domain)

### 2. Configure Environment Variables

In your Convex dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `SENDER_EMAIL`: Email address for sending (must be verified in Resend)
   - `RECIPIENT_EMAIL`: Your email where contact form submissions will be sent

### 3. Set Up Webhook (Optional)

For email delivery tracking and status updates:

1. **Create HTTP endpoint** - The webhook is already configured in your Convex project
2. **Get your webhook URL**: `https://[your-convex-project].convex.site/resend-webhook`
3. **Configure in Resend dashboard**:
   - Go to Webhooks section
   - Create new webhook with your Convex URL
   - Enable all `email.*` events
   - Copy the webhook secret
4. **Add webhook secret** to Convex environment as `RESEND_WEBHOOK_SECRET`

### 4. Configure Test Mode

The contact form starts in production mode (`testMode: false`). To test during development:

1. **Enable test mode** in `convex/contactForm.ts`:
   ```typescript
   export const resend = new Resend(components.resend, {
     testMode: true, // Change to true for testing
   });
   ```

2. **Use test email addresses** like `delivered@resend.dev` for testing

3. **Disable test mode** for production by setting `testMode: false`

## Features

### ✅ Accessibility
- Semantic HTML with proper labels
- Screen reader support
- Keyboard navigation
- Focus indicators
- Error announcements

### ✅ Validation
- Client-side validation with React Hook Form + Zod
- Server-side validation in Convex
- Real-time error messages
- Privacy consent requirement

### ✅ Security
- Rate limiting (5 submissions per hour per IP)
- Honeypot spam protection
- Input sanitization
- CSRF protection via Convex

### ✅ Performance
- Server components for static content
- Client components only where needed
- Optimized bundle size
- No layout shift

### ✅ Database & Analytics
- All submissions stored in Convex database
- Email delivery tracking with status updates
- Contact submission analytics and statistics
- Query functions for viewing submissions and stats

## Rate Limiting

The contact form includes rate limiting:
- **5 submissions per hour** per IP address
- **Token bucket algorithm** with capacity of 3
- Graceful error messages when limit exceeded

## Form Fields

- **Name**: Required, 2-100 characters
- **Email**: Required, valid email format
- **Message**: Required, 10-1000 characters
- **Privacy Consent**: Required checkbox with link to privacy policy

## Styling

The contact form matches your design with:
- Two-column layout on desktop (info left, form right)
- Stacked layout on mobile
- Subtle grid background
- Clean, accessible form styling

## Email Template

Contact form submissions send HTML emails with:
- Sender contact details
- Formatted message content
- Automatic reply-to setup
- Professional styling

## Development Testing

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test the form** at `/contact`
3. **Check console logs** for submission details
4. **Verify emails** in your inbox (or Resend dashboard for test mode)

## Troubleshooting

### Form not submitting
- Check Convex connection in browser dev tools
- Verify environment variables are set
- Check rate limiting (wait if exceeded)

### Emails not sending
- Verify `RESEND_API_KEY` is correct
- Ensure `SENDER_EMAIL` is verified in Resend
- Check Resend dashboard for delivery status
- Verify domain DNS records

### Validation errors
- Check browser console for client-side errors
- Verify Zod schema matches form fields
- Ensure all required fields are filled

## Production Checklist

- [ ] Domain verified in Resend
- [ ] Environment variables configured
- [ ] Test mode disabled
- [ ] Webhook configured (optional)
- [ ] Privacy policy page exists
- [ ] Form tested end-to-end
- [ ] Rate limiting tested
- [ ] Email delivery confirmed

## Support

If you need help:
1. Check the Convex logs in your dashboard
2. Review the Resend delivery logs
3. Verify all environment variables are set correctly
4. Test with simple values first