import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In – Hospitality Hub Login',
  description: 'Sign in to your Hospitality Hub account to access your liquor inventory, reservations, and member management tools.',
  keywords: 'login, sign in, hospitality hub, bar management login, restaurant software',
  openGraph: {
    title: 'Sign In – Hospitality Hub Login',
    description: 'Sign in to your Hospitality Hub account to access your liquor inventory, reservations, and member management tools.',
    type: 'website',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}