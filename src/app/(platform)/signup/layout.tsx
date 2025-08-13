import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started – Free Trial | Hospitality Hub',
  description: 'Start your free 30-day trial of Hospitality Hub. No credit card required. Easy liquor inventory, reservations, and member management for bars and restaurants.',
  keywords: 'free trial, signup, hospitality software, bar management signup, restaurant software trial',
  openGraph: {
    title: 'Get Started – Free Trial | Hospitality Hub',
    description: 'Start your free 30-day trial of Hospitality Hub. No credit card required. Easy liquor inventory, reservations, and member management for bars and restaurants.',
    type: 'website',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}