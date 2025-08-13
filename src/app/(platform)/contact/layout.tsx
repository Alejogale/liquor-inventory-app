import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us – Get Help & Support | Hospitality Hub',
  description: 'Contact Hospitality Hub for support, sales questions, or to schedule a demo. Call us at (555) 123-4567 or email hello@hospitalityhub.com.',
  keywords: 'contact hospitality hub, customer support, sales questions, technical help, demo request',
  openGraph: {
    title: 'Contact Us – Get Help & Support | Hospitality Hub',
    description: 'Contact Hospitality Hub for support, sales questions, or to schedule a demo. Call us at (555) 123-4567 or email hello@hospitalityhub.com.',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}