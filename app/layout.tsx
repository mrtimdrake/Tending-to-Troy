import type { Metadata, Viewport } from 'next'
import { Geist, Inter, Source_Serif_4 } from 'next/font/google'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-geist',
  display: 'swap',
})

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-source-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tending to Troy',
  description: 'Care for our home.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tending to Troy',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F5E8A8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-GB"
      className={`${geist.variable} ${sourceSerif4.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-paper text-navy antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
