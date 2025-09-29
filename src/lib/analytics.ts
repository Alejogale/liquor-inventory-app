// Google Analytics utility functions for tracking events

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = 'G-KW2K1M5D9K'

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Pre-defined event tracking functions
export const trackSignup = (method: 'email' | 'google' = 'email') => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: method,
  })
}

export const trackLogin = (method: 'email' | 'google' = 'email') => {
  event({
    action: 'login',
    category: 'engagement',
    label: method,
  })
}

export const trackSubscription = (plan: string, billingCycle: string) => {
  event({
    action: 'purchase',
    category: 'ecommerce',
    label: `${plan}_${billingCycle}`,
  })
}

export const trackButtonClick = (buttonName: string, location: string) => {
  event({
    action: 'click',
    category: 'button',
    label: `${buttonName}_${location}`,
  })
}

export const trackPageVisit = (pageName: string) => {
  event({
    action: 'page_view',
    category: 'navigation',
    label: pageName,
  })
}