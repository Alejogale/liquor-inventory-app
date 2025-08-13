import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing – Affordable Hospitality Management Plans',
  description: 'Simple, transparent pricing for hospitality software. Start with one app for $29/month or get the complete platform. 30-day free trial, no setup fees.',
  keywords: 'hospitality software pricing, bar inventory pricing, restaurant management cost, liquor inventory software price',
  openGraph: {
    title: 'Pricing – Affordable Hospitality Management Plans',
    description: 'Simple, transparent pricing for hospitality software. Start with one app for $29/month or get the complete platform. 30-day free trial, no setup fees.',
    type: 'website',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}