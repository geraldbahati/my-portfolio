# Vercel Analytics - Quick Start Guide

## Overview

Your portfolio now has a comprehensive Vercel Analytics setup with custom tracking utilities! 🎉

## What's Been Implemented

### 1. Core Analytics Setup ✅

- **Vercel Web Analytics** - Tracks page views and custom events
- **Vercel Speed Insights** - Monitors Core Web Vitals (LCP, FID, CLS, etc.)
- **Privacy Features** - User opt-out, sensitive data filtering
- **Debug Mode** - Console logging in development

### 2. Custom Tracking Utilities ✅

Located in `lib/analytics.ts`, provides comprehensive event tracking:

- Page views
- Button clicks
- Link clicks (internal/external)
- Form submissions
- Media interactions (video, audio, images)
- Scroll depth tracking
- Search queries
- Social shares
- Downloads
- Conversions
- Errors
- Performance metrics
- Feature usage
- Time tracking

### 3. React Hooks ✅

Located in `lib/hooks/useAnalytics.ts`:

- `useAnalytics()` - Comprehensive tracking hook
- `usePageViewTracking()` - Auto-track page views
- `useScrollTracking()` - Track scroll depth
- `useTimeTracking()` - Track time on page
- `useVisibilityTracking()` - Track element visibility
- `useTrackButton()`, `useTrackLink()`, `useTrackForm()`, etc.

### 4. Integrated Components ✅

Analytics tracking has been added to:
- **Navbar** - Menu toggles, navigation links, social links
- **Footer** - Footer links

## Quick Usage Examples

### Track a Button Click

```tsx
'use client';

import Analytics from '@/lib/analytics';

export default function MyButton() {
  return (
    <button onClick={() => Analytics.trackButtonClick('CTA Button', 'Hero Section')}>
      Click Me
    </button>
  );
}
```

### Track Page Views Automatically

```tsx
'use client';

import { usePageViewTracking } from '@/lib/hooks/useAnalytics';

export default function MyPage() {
  usePageViewTracking();
  return <div>My Page Content</div>;
}
```

### Track Form Submission

```tsx
'use client';

import { useTrackForm } from '@/lib/hooks/useAnalytics';

export default function ContactForm() {
  const trackForm = useTrackForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit form...
      trackForm('Contact Form', true);
    } catch (error) {
      trackForm('Contact Form', false, 'contact-form', error.message);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Track with Comprehensive Hook

```tsx
'use client';

import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function MyPage() {
  const { trackButton, trackLink } = useAnalytics({
    trackPageView: true,
    trackScroll: true,
    trackTime: true,
  });

  return (
    <div>
      <button onClick={() => trackButton('Sign Up', 'Hero')}>
        Sign Up
      </button>
    </div>
  );
}
```

## Development vs Production

### Development Mode

- Events are logged to console
- No data sent to Vercel
- Debug mode enabled automatically

```
[Analytics - Dev Mode] Button Click { button: 'Sign Up', location: 'Hero' }
```

### Production Mode

- Events sent to Vercel Analytics
- Data visible in Vercel Dashboard
- Debug mode disabled

## Privacy Features

### User Opt-Out

Users can opt out of tracking:

```tsx
import { useAnalyticsPreferences } from '@/lib/hooks/useAnalytics';

export default function PrivacySettings() {
  const { enableAnalytics, disableAnalytics, isEnabled } = useAnalyticsPreferences();

  return (
    <div>
      <p>Analytics: {isEnabled ? 'Enabled' : 'Disabled'}</p>
      <button onClick={disableAnalytics}>Opt Out</button>
    </div>
  );
}
```

### Automatic Data Filtering

The following are automatically filtered:
- Sensitive query parameters (token, secret, key, password, api_key)
- Admin routes (/admin/*)
- Private routes (/private/*)

## View Your Analytics

1. **Deploy to Vercel** (if not already deployed):
   ```bash
   vercel deploy
   ```

2. **Access Analytics Dashboard**:
   - Go to your project on Vercel
   - Navigate to "Analytics" tab
   - View page views, custom events, and performance metrics

3. **View Speed Insights**:
   - Go to "Speed Insights" tab
   - Monitor Core Web Vitals
   - See performance trends

## Files Created/Modified

### Created Files:
- ✅ `lib/analytics.ts` - Main analytics utility
- ✅ `lib/hooks/useAnalytics.ts` - React hooks
- ✅ `components/analytics-provider.tsx` - Analytics provider component
- ✅ `docs/ANALYTICS.md` - Comprehensive documentation
- ✅ `docs/ANALYTICS_QUICKSTART.md` - This quick start guide

### Modified Files:
- ✅ `app/layout.tsx` - Added AnalyticsProvider
- ✅ `components/navbar.tsx` - Added event tracking
- ✅ `components/footer.tsx` - Added event tracking
- ✅ `package.json` - Added analytics packages

## Next Steps

1. **Test in Development**:
   ```bash
   npm run dev
   ```
   Check console for analytics events

2. **Deploy to Production**:
   ```bash
   vercel deploy --prod
   ```

3. **Add More Tracking**:
   - Track important user interactions
   - Monitor conversion events
   - Track errors and performance

4. **Monitor Dashboard**:
   - Check analytics daily
   - Identify popular pages
   - Monitor performance metrics

## Common Use Cases

### E-commerce Conversion
```tsx
Analytics.trackConversion('Purchase', {
  category: 'E-commerce',
  value: 99.99,
  currency: 'USD',
});
```

### Newsletter Signup
```tsx
Analytics.trackConversion('Newsletter Signup', {
  category: 'Lead Generation',
  value: 1,
});
```

### Download Tracking
```tsx
Analytics.trackDownload('resume.pdf', 'pdf', 1024000);
```

### Video Engagement
```tsx
Analytics.trackMediaInteraction({
  mediaType: 'video',
  action: 'complete',
  mediaId: 'demo-video',
  duration: 120,
});
```

### Search Analytics
```tsx
Analytics.trackSearch('react hooks', resultsCount);
```

## Troubleshooting

### Events not showing?
- Make sure you're in production (`NODE_ENV=production`)
- Check Vercel deployment
- Wait a few minutes for data to appear

### Debug mode not working?
- Verify `NODE_ENV=development`
- Check browser console
- Ensure analytics provider is mounted

### Build errors?
- Run `npm run build` to check for TypeScript errors
- Verify all imports are correct
- Check that client components have `'use client'` directive

## Support

For detailed documentation, see:
- **Full Documentation**: `docs/ANALYTICS.md`
- **Vercel Analytics Docs**: https://vercel.com/docs/analytics
- **Speed Insights Docs**: https://vercel.com/docs/speed-insights

---

**Setup Complete!** 🚀 Your portfolio now has enterprise-grade analytics tracking.
