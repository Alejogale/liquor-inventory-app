import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'InvyEasy – Professional Liquor Inventory Management',
  description: 'Professional liquor inventory management system for bars and restaurants. Track stock, manage suppliers, and streamline operations with InvyEasy.',
  keywords: 'liquor inventory, bar inventory, restaurant inventory, inventory management, barcode scanning, supplier management, InvyEasy',
  openGraph: {
    title: 'InvyEasy – Professional Liquor Inventory Management',
    description: 'Professional liquor inventory management system for bars and restaurants. Track stock, manage suppliers, and streamline operations with InvyEasy.',
    type: 'website',
    url: 'https://invyeasy.com',
  },
  metadataBase: new URL('https://invyeasy.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KW2K1M5D9K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KW2K1M5D9K');
          `}
        </Script>

        <AuthProvider>
          {children}
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
