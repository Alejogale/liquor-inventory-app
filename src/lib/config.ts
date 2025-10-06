/**
 * Central configuration file for platform settings
 * This consolidates environment variables and constants in one place
 */

export const config = {
  /**
   * Platform admin emails - users with unrestricted access to all organizations
   * Can be a comma-separated list in the environment variable
   */
  platformAdmins: process.env.NEXT_PUBLIC_PLATFORM_ADMINS?.split(',').map(email => email.trim()) || [
    'alejogaleis@gmail.com' // Fallback for backwards compatibility
  ],

  /**
   * Check if an email belongs to a platform admin
   */
  isPlatformAdmin: (email: string | null | undefined): boolean => {
    if (!email) return false
    return config.platformAdmins.includes(email.toLowerCase())
  },

  /**
   * App configuration
   */
  app: {
    name: 'InvyEasy',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://invyeasy.com',
  },

  /**
   * Feature flags
   */
  features: {
    sentryEnabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
} as const

export default config
