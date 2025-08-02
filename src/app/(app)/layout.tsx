import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Liquor Inventory Manager',
  description: 'Manage your bar inventory efficiently',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
