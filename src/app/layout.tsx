import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'Hospitality Hub – Easy, Reliable Hospitality Apps',
  description: 'All-in-one hospitality software that\'s simple, reliable, and affordable. Try our easy inventory, reservations, and member tools today.',
  keywords: 'hospitality software, hospitality apps, liquor inventory software, restaurant reservation system, member database',
  openGraph: {
    title: 'Hospitality Hub – Easy, Reliable Hospitality Apps',
    description: 'All-in-one hospitality software that\'s simple, reliable, and affordable. Try our easy inventory, reservations, and member tools today.',
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
      </body>
    </html>
  )
}
