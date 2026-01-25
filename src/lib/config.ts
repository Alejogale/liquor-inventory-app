/**
 * Central configuration file for platform settings
 * This consolidates environment variables and constants in one place
 */

export const config = {
  /**
   * Platform admin emails - users with unrestricted access to all organizations
   * Can be a comma-separated list in the environment variable
   */
  platformAdmins: (process.env.NEXT_PUBLIC_PLATFORM_ADMINS?.split(',').map(email => email.trim().toLowerCase()) || [
    'alejogaleis@gmail.com'
  ]),

  /**
   * Check if an email belongs to a platform admin
   * Always grants full access to everything - bypasses all subscription checks
   */
  isPlatformAdmin: (email: string | null | undefined): boolean => {
    if (!email) return false
    const normalizedEmail = email.toLowerCase().trim()
    const isAdmin = config.platformAdmins.includes(normalizedEmail)
    if (isAdmin) {
      console.log('🔑 Platform admin access granted for:', normalizedEmail)
    }
    return isAdmin
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
