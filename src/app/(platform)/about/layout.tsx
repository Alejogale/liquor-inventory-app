import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us – Hospitality Hub Company Story',
  description: 'Learn about Hospitality Hub\'s mission to transform hospitality management. We serve 500+ businesses with integrated inventory, reservations, and member tools.',
  keywords: 'about hospitality hub, company story, hospitality software company, bar inventory team, restaurant management platform',
  openGraph: {
    title: 'About Us – Hospitality Hub Company Story',
    description: 'Learn about Hospitality Hub\'s mission to transform hospitality management. We serve 500+ businesses with integrated inventory, reservations, and member tools.',
    type: 'website',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}