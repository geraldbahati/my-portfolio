# Vercel Analytics Integration Guide

This project includes a comprehensive Vercel Analytics setup with custom tracking utilities and React hooks for monitoring user interactions, performance metrics, and conversions.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Analytics Utility](#analytics-utility)
- [React Hooks](#react-hooks)
- [Usage Examples](#usage-examples)
- [Privacy & Data Protection](#privacy--data-protection)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our analytics implementation includes:

- ✅ **Vercel Web Analytics** - Track page views, custom events, and user interactions
- ✅ **Vercel Speed Insights** - Monitor Core Web Vitals and performance metrics
- ✅ **Custom Tracking Utilities** - Comprehensive event tracking functions
- ✅ **React Hooks** - Easy integration in React components
- ✅ **Privacy Features** - User opt-out, data filtering, and sensitive data protection
- ✅ **Development Mode** - Console logging in development environment

## Installation

The required packages are already installed:

```bash
npm install @vercel/analytics @vercel/speed-insights
```

## Basic Setup

### Root Layout Configuration

Analytics and Speed Insights are configured in `app/layout.tsx`:

```tsx
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics
          beforeSend={handleBeforeSend}
          debug={process.env.NODE_ENV === 'development'}
        />
        <SpeedInsights
          debug={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  );
}
```

### Privacy Protection

The `beforeSend` hook automatically:
- Filters sensitive query parameters (token, secret, key, password, api_key)
- Ignores admin and private routes
- Respects user opt-out preferences

## Analytics Utility

The main analytics utility is located at `lib/analytics.ts`.

### Core Functions

#### Page Tracking

```tsx
import Analytics from '@/lib/analytics';

// Track page views
Analytics.trackPageView('/products', { category: 'shop' });
```

#### Button & Link Tracking

```tsx
// Track button clicks
Analytics.trackButtonClick('Sign Up', 'Header');

// Track link clicks
Analytics.trackLinkClick('Learn More', '/about', 'internal');

// Track outbound links
Analytics.trackOutboundLink('https://external-site.com', 'Blog Post');
```

#### Form Tracking

```tsx
// Track form submissions
Analytics.trackFormSubmission({
  formName: 'Contact Form',
  formId: 'contact-form',
  success: true,
  errorMessage: undefined,
});
```

#### Media Interactions

```tsx
// Track media interactions
Analytics.trackMediaInteraction({
  mediaType: 'video',
  action: 'play',
  mediaId: 'intro-video',
  duration: 120,
});
```

#### Scroll Depth

```tsx
// Track scroll depth
Analytics.trackScrollDepth({
  depth: 75, // percentage
  page: '/blog/article',
});
```

#### Search Tracking

```tsx
// Track search queries
Analytics.trackSearch('react hooks', 42);
```

#### Conversions

```tsx
// Track conversions
Analytics.trackConversion('Newsletter Signup', {
  category: 'Lead Generation',
  value: 1,
  currency: 'USD',
});
```

#### Error Tracking

```tsx
// Track errors
Analytics.trackError(
  'API Error',
  'Failed to fetch user data',
  { endpoint: '/api/users', statusCode: 500 }
);
```

#### Performance Metrics

```tsx
// Track performance
Analytics.trackPerformance('Page Load Time', 1200, 'ms');
```

#### Social Shares

```tsx
// Track social shares
Analytics.trackSocialShare('Twitter', 'blog-post', 'article-123');
```

#### Feature Usage

```tsx
// Track feature usage
Analytics.trackFeatureUse('Dark Mode Toggle', { enabled: true });
```

#### Time Tracking

```tsx
// Track time spent
Analytics.trackTimeSpent('/dashboard', 45000); // 45 seconds
```

## React Hooks

Custom hooks are available in `lib/hooks/useAnalytics.ts`.

### useAnalytics

Comprehensive hook that combines multiple tracking features:

```tsx
'use client';

import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function MyComponent() {
  const { trackButton, trackLink, trackForm } = useAnalytics({
    trackPageView: true,   // Auto-track page views
    trackScroll: true,     // Auto-track scroll depth
    trackTime: true,       // Auto-track time on page
    scrollThresholds: [25, 50, 75, 100],
  });

  return (
    <button onClick={() => trackButton('Submit', 'Form Section')}>
      Submit
    </button>
  );
}
```

### usePageViewTracking

Automatically track page views on route changes:

```tsx
'use client';

import { usePageViewTracking } from '@/lib/hooks/useAnalytics';

export default function Layout({ children }) {
  usePageViewTracking();
  return <>{children}</>;
}
```

### useScrollTracking

Track scroll depth milestones:

```tsx
'use client';

import { useScrollTracking } from '@/lib/hooks/useAnalytics';

export default function BlogPost() {
  useScrollTracking([25, 50, 75, 100]);
  return <article>...</article>;
}
```

### useTimeTracking

Track time spent on a page or section:

```tsx
'use client';

import { useTimeTracking } from '@/lib/hooks/useAnalytics';

export default function Dashboard() {
  useTimeTracking('Dashboard');
  return <div>...</div>;
}
```

### useVisibilityTracking

Track when an element comes into view:

```tsx
'use client';

import { useRef } from 'react';
import { useVisibilityTracking } from '@/lib/hooks/useAnalytics';

export default function CallToAction() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useVisibilityTracking(ctaRef, 'CTA Viewed', {
    threshold: 0.5, // 50% visible
  });

  return <div ref={ctaRef}>Call to Action</div>;
}
```

### useTrackButton

Hook for tracking button clicks:

```tsx
'use client';

import { useTrackButton } from '@/lib/hooks/useAnalytics';

export default function SignupButton() {
  const trackButton = useTrackButton();

  return (
    <button onClick={() => trackButton('Sign Up', 'Hero Section')}>
      Sign Up
    </button>
  );
}
```

### useTrackForm

Hook for tracking form submissions:

```tsx
'use client';

import { useTrackForm } from '@/lib/hooks/useAnalytics';

export default function ContactForm() {
  const trackForm = useTrackForm();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Submit form...
      trackForm('Contact Form', true, 'contact-form');
    } catch (error) {
      trackForm('Contact Form', false, 'contact-form', error.message);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Usage Examples

### Example 1: Track Navigation

```tsx
'use client';

import Analytics from '@/lib/analytics';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <Link
        href="/products"
        onClick={() => Analytics.trackNavigation({
          from: window.location.pathname,
          to: '/products',
          method: 'click',
        })}
      >
        Products
      </Link>
    </nav>
  );
}
```

### Example 2: Track Video Playback

```tsx
'use client';

import { useTrackMedia } from '@/lib/hooks/useAnalytics';
import { useRef } from 'react';

export default function VideoPlayer() {
  const trackMedia = useTrackMedia();
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      onPlay={() => trackMedia('video', 'play', 'intro-video')}
      onPause={() => trackMedia('video', 'pause', 'intro-video')}
      onEnded={() => trackMedia('video', 'complete', 'intro-video')}
    >
      <source src="/video.mp4" type="video/mp4" />
    </video>
  );
}
```

### Example 3: Track E-commerce Conversion

```tsx
'use client';

import { useTrackConversion } from '@/lib/hooks/useAnalytics';

export default function CheckoutButton({ amount }: { amount: number }) {
  const trackConversion = useTrackConversion();

  const handleCheckout = async () => {
    // Process checkout...
    trackConversion('Purchase', 'E-commerce', amount, 'USD');
  };

  return (
    <button onClick={handleCheckout}>
      Complete Purchase
    </button>
  );
}
```

### Example 4: Track Search Results

```tsx
'use client';

import Analytics from '@/lib/analytics';
import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    const results = await searchAPI(query);
    Analytics.trackSearch(query, results.length);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
```

### Example 5: Track Download

```tsx
'use client';

import Analytics from '@/lib/analytics';

export default function DownloadButton() {
  const handleDownload = (filename: string) => {
    Analytics.trackDownload(filename, 'pdf', 1024000); // 1MB
    // Trigger download...
  };

  return (
    <button onClick={() => handleDownload('whitepaper.pdf')}>
      Download PDF
    </button>
  );
}
```

## Privacy & Data Protection

### User Opt-Out

Users can opt out of analytics tracking:

```tsx
'use client';

import { useAnalyticsPreferences } from '@/lib/hooks/useAnalytics';

export default function PrivacySettings() {
  const { enableAnalytics, disableAnalytics, isEnabled } = useAnalyticsPreferences();

  return (
    <div>
      <p>Analytics: {isEnabled ? 'Enabled' : 'Disabled'}</p>
      <button onClick={enableAnalytics}>Enable</button>
      <button onClick={disableAnalytics}>Disable</button>
    </div>
  );
}
```

### Sensitive Data Filtering

The `beforeSend` hook in `app/layout.tsx` automatically filters:
- Query parameters: token, secret, key, password, api_key
- Admin routes: /admin/*
- Private routes: /private/*

### Email Anonymization

The `trackEmailClick` function automatically anonymizes email addresses:

```tsx
Analytics.trackEmailClick('user@example.com', 'Contact Page');
// Only tracks domain: example.com
```

## Best Practices

### 1. Track Meaningful Events

Focus on events that provide actionable insights:
- User engagement (clicks, scrolls, time spent)
- Conversions (signups, purchases, downloads)
- Feature usage (which features are popular)
- Errors and issues

### 2. Use Descriptive Names

```tsx
// Good
Analytics.trackButtonClick('Sign Up - Hero CTA', 'Homepage');

// Less descriptive
Analytics.trackButtonClick('Button', 'Page');
```

### 3. Include Context

```tsx
Analytics.trackConversion('Newsletter Signup', {
  category: 'Lead Generation',
  value: 1,
});
```

### 4. Respect User Privacy

- Always provide opt-out options
- Filter sensitive data
- Don't track personally identifiable information (PII)
- Be transparent about data collection

### 5. Test in Development

Analytics are automatically logged to console in development mode:

```tsx
// In development, you'll see:
[Analytics - Dev Mode] Button Click { button: 'Sign Up', location: 'Hero' }
```

### 6. Monitor Performance

Don't track too many events that could impact performance:

```tsx
// Good: Track significant scroll milestones
useScrollTracking([25, 50, 75, 100]);

// Bad: Track every scroll pixel
// Don't do this!
```

## Troubleshooting

### Events Not Showing in Vercel Dashboard

1. **Check Environment**: Analytics only run in production by default
2. **Deploy to Vercel**: Make sure your site is deployed to Vercel
3. **Wait for Data**: Analytics may take a few minutes to appear
4. **Check Console**: In development, events are logged to console

### beforeSend Hook Issues

If events aren't being tracked:

```tsx
// Check if beforeSend is returning null
const handleBeforeSend = (event: BeforeSendEvent) => {
  console.log('Event:', event); // Debug
  return event; // Make sure you return the event
};
```

### TypeScript Errors

Make sure you have the correct types imported:

```tsx
import { type BeforeSendEvent } from '@vercel/analytics/next';
```

### Opt-Out Not Working

Check localStorage:

```tsx
// User has opted out
localStorage.getItem('analytics-opt-out') // returns 'true'

// Clear opt-out
localStorage.removeItem('analytics-opt-out')
```

## Environment Variables

No environment variables are required for basic analytics. Vercel automatically provides:
- `VERCEL_ANALYTICS_ID` - Auto-configured on Vercel
- `NODE_ENV` - Used to enable debug mode in development

## Additional Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Custom Events Guide](https://vercel.com/docs/analytics/custom-events)
- [Web Vitals](https://web.dev/vitals/)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Vercel Analytics documentation
3. Check the console for debug logs in development mode

---

**Last Updated**: 2025
**Version**: 1.0.0
