import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liquor Inventory Manager - Professional Bar & Restaurant Inventory',
  description: 'Streamline your bar inventory with real-time counting, automated ordering, and detailed reporting.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
