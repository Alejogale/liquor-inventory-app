import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liquor Inventory Dashboard – Easy Bar Inventory Management',
  description: 'Professional liquor inventory management dashboard for bars and restaurants. Track stock levels, manage suppliers, and generate reports with ease.',
  keywords: 'liquor inventory dashboard, bar inventory management, restaurant inventory, stock tracking',
  openGraph: {
    title: 'Liquor Inventory Dashboard – Easy Bar Inventory Management',
    description: 'Professional liquor inventory management dashboard for bars and restaurants. Track stock levels, manage suppliers, and generate reports with ease.',
    type: 'website',
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
