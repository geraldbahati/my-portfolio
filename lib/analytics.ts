/**
 * Custom Analytics Utility for Vercel Analytics
 *
 * This module provides a comprehensive set of analytics tracking functions
 * for tracking user interactions, conversions, and performance metrics.
 */

import { track } from '@vercel/analytics';

// Types for analytics events
export type AnalyticsEventData = Record<string, string | number | boolean | null>;

export interface NavigationEventData {
  from: string;
  to: string;
  method: 'click' | 'programmatic';
}

export interface FormSubmissionData {
  formName: string;
  formId?: string;
  success: boolean;
  errorMessage?: string;
}

export interface MediaInteractionData {
  mediaType: 'image' | 'video' | 'audio';
  action: 'play' | 'pause' | 'complete' | 'view';
  mediaId?: string;
  duration?: number;
}

export interface ScrollDepthData {
  depth: number; // percentage
  page: string;
}

export interface ConversionEventData {
  category: string;
  value?: number;
  currency?: string;
}

/**
 * Analytics tracking class with comprehensive event tracking
 */
export class Analytics {
  private static isEnabled = typeof window !== 'undefined' &&
    !window.localStorage?.getItem('analytics-opt-out');

  /**
   * Check if analytics is enabled
   */
  static isAnalyticsEnabled(): boolean {
    return this.isEnabled && process.env.NODE_ENV === 'production';
  }

  /**
   * Base track function with logging in development
   */
  private static trackEvent(eventName: string, data?: AnalyticsEventData) {
    if (!this.isAnalyticsEnabled()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics - Dev Mode]', eventName, data);
      }
      return;
    }

    try {
      track(eventName, data);
    } catch (error) {
      console.error('[Analytics Error]', eventName, error);
    }
  }

  /**
   * Track page views
   */
  static trackPageView(pageName: string, additionalData?: AnalyticsEventData) {
    this.trackEvent('Page View', {
      page: pageName,
      timestamp: Date.now(),
      ...additionalData,
    });
  }

  /**
   * Track button clicks
   */
  static trackButtonClick(
    buttonName: string,
    location: string,
    additionalData?: AnalyticsEventData
  ) {
    this.trackEvent('Button Click', {
      button: buttonName,
      location,
      ...additionalData,
    });
  }

  /**
   * Track link clicks
   */
  static trackLinkClick(
    linkText: string,
    destination: string,
    type: 'internal' | 'external' = 'internal'
  ) {
    this.trackEvent('Link Click', {
      link: linkText,
      destination,
      type,
    });
  }

  /**
   * Track navigation events
   */
  static trackNavigation(data: NavigationEventData) {
    this.trackEvent('Navigation', {
      from: data.from,
      to: data.to,
      method: data.method,
    });
  }

  /**
   * Track form submissions
   */
  static trackFormSubmission(data: FormSubmissionData) {
    this.trackEvent('Form Submission', {
      form: data.formName,
      formId: data.formId || '',
      success: data.success,
      errorMessage: data.errorMessage || '',
    });
  }

  /**
   * Track search queries
   */
  static trackSearch(query: string, resultsCount: number) {
    this.trackEvent('Search', {
      query,
      resultsCount,
    });
  }

  /**
   * Track media interactions (images, videos, audio)
   */
  static trackMediaInteraction(data: MediaInteractionData) {
    this.trackEvent('Media Interaction', {
      mediaType: data.mediaType,
      action: data.action,
      mediaId: data.mediaId || '',
      duration: data.duration || 0,
    });
  }

  /**
   * Track scroll depth
   */
  static trackScrollDepth(data: ScrollDepthData) {
    this.trackEvent('Scroll Depth', {
      depth: data.depth,
      page: data.page,
    });
  }

  /**
   * Track social media shares
   */
  static trackSocialShare(platform: string, contentType: string, contentId?: string) {
    this.trackEvent('Social Share', {
      platform,
      contentType,
      contentId: contentId || '',
    });
  }

  /**
   * Track downloads
   */
  static trackDownload(fileName: string, fileType: string, fileSize?: number) {
    this.trackEvent('Download', {
      fileName,
      fileType,
      fileSize: fileSize || 0,
    });
  }

  /**
   * Track conversion events
   */
  static trackConversion(eventName: string, data: ConversionEventData) {
    this.trackEvent(`Conversion: ${eventName}`, {
      category: data.category,
      value: data.value || 0,
      currency: data.currency || 'USD',
    });
  }

  /**
   * Track errors
   */
  static trackError(
    errorName: string,
    errorMessage: string,
    context?: AnalyticsEventData
  ) {
    this.trackEvent('Error', {
      error: errorName,
      message: errorMessage,
      ...context,
    });
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(
    metricName: string,
    value: number,
    unit: 'ms' | 's' | 'bytes' = 'ms'
  ) {
    this.trackEvent('Performance', {
      metric: metricName,
      value,
      unit,
    });
  }

  /**
   * Track user preferences/settings changes
   */
  static trackPreferenceChange(
    preferenceName: string,
    oldValue: string | number | boolean,
    newValue: string | number | boolean
  ) {
    this.trackEvent('Preference Change', {
      preference: preferenceName,
      oldValue: String(oldValue),
      newValue: String(newValue),
    });
  }

  /**
   * Track feature usage
   */
  static trackFeatureUse(featureName: string, additionalData?: AnalyticsEventData) {
    this.trackEvent('Feature Use', {
      feature: featureName,
      ...additionalData,
    });
  }

  /**
   * Track time spent on page/section
   */
  static trackTimeSpent(location: string, durationMs: number) {
    this.trackEvent('Time Spent', {
      location,
      duration: durationMs,
      durationSeconds: Math.round(durationMs / 1000),
    });
  }

  /**
   * Track outbound links
   */
  static trackOutboundLink(url: string, context?: string) {
    this.trackEvent('Outbound Link', {
      url,
      context: context || '',
    });
  }

  /**
   * Track email clicks
   */
  static trackEmailClick(emailAddress: string, context?: string) {
    // Hash or anonymize email if needed
    const anonymizedEmail = emailAddress.includes('@')
      ? emailAddress.split('@')[1]
      : 'unknown';

    this.trackEvent('Email Click', {
      domain: anonymizedEmail,
      context: context || '',
    });
  }

  /**
   * Track phone clicks
   */
  static trackPhoneClick(context?: string) {
    this.trackEvent('Phone Click', {
      context: context || '',
    });
  }

  /**
   * Enable analytics (opt-in)
   */
  static enableAnalytics() {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('analytics-opt-out');
      this.isEnabled = true;
      this.trackEvent('Analytics Enabled', {});
    }
  }

  /**
   * Disable analytics (opt-out)
   */
  static disableAnalytics() {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('analytics-opt-out', 'true');
      this.isEnabled = false;
    }
  }
}

/**
 * Convenience function exports for common operations
 */
export const trackPageView = Analytics.trackPageView.bind(Analytics);
export const trackButtonClick = Analytics.trackButtonClick.bind(Analytics);
export const trackLinkClick = Analytics.trackLinkClick.bind(Analytics);
export const trackNavigation = Analytics.trackNavigation.bind(Analytics);
export const trackFormSubmission = Analytics.trackFormSubmission.bind(Analytics);
export const trackSearch = Analytics.trackSearch.bind(Analytics);
export const trackMediaInteraction = Analytics.trackMediaInteraction.bind(Analytics);
export const trackScrollDepth = Analytics.trackScrollDepth.bind(Analytics);
export const trackSocialShare = Analytics.trackSocialShare.bind(Analytics);
export const trackDownload = Analytics.trackDownload.bind(Analytics);
export const trackConversion = Analytics.trackConversion.bind(Analytics);
export const trackError = Analytics.trackError.bind(Analytics);
export const trackPerformance = Analytics.trackPerformance.bind(Analytics);
export const trackPreferenceChange = Analytics.trackPreferenceChange.bind(Analytics);
export const trackFeatureUse = Analytics.trackFeatureUse.bind(Analytics);
export const trackTimeSpent = Analytics.trackTimeSpent.bind(Analytics);
export const trackOutboundLink = Analytics.trackOutboundLink.bind(Analytics);
export const trackEmailClick = Analytics.trackEmailClick.bind(Analytics);
export const trackPhoneClick = Analytics.trackPhoneClick.bind(Analytics);

// Default export
export default Analytics;
