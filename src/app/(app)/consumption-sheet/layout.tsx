import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consumption Sheet – Real-time Event Tracking | Hospitality Hub',
  description: 'Track liquor and beverage consumption for events in real-time. Multi-window support, automated reporting, and seamless integration with your hospitality operations.',
  keywords: 'consumption tracking, event management, liquor tracking, beverage consumption, hospitality events, real-time tracking',
  openGraph: {
    title: 'Consumption Sheet – Real-time Event Tracking | Hospitality Hub',
    description: 'Track liquor and beverage consumption for events in real-time. Multi-window support, automated reporting, and seamless integration with your hospitality operations.',
    type: 'website',
  },
}

export default function ConsumptionSheetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}