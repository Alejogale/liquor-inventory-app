import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Liquor Inventory System – Professional Inventory Management',
  description: 'Professional liquor inventory management system for bars and restaurants. Track stock, manage suppliers, and streamline operations.',
  keywords: 'liquor inventory, bar inventory, restaurant inventory, inventory management, barcode scanning, supplier management',
  openGraph: {
    title: 'Liquor Inventory System – Professional Inventory Management',
    description: 'Professional liquor inventory management system for bars and restaurants. Track stock, manage suppliers, and streamline operations.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
