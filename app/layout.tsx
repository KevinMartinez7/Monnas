import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://monnas-estetica.vercel.app'),
  title: "Monnas - Centro de Cosmetología & Estética | Tandil",
  description:
    "Centro especializado en cosmetología, cejas, pestañas, tricología facial y depilación láser en Tandil, Buenos Aires. Cuidados personalizados para realzar tu belleza natural.",
  keywords: "cosmetología, estética, cejas, pestañas, depilación láser, tricología, Tandil, Buenos Aires, belleza",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/images/monnas-logo2.png' },
      { url: '/images/monnas-logo2.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/monnas-logo2.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/images/monnas-logo2.png',
    shortcut: '/images/monnas-logo2.png',
  },
  openGraph: {
    title: "Monnas - Centro de Cosmetología & Estética | Tandil",
    description: "Centro especializado en cosmetología, cejas, pestañas, tricología facial y depilación láser en Tandil, Buenos Aires.",
    images: ['/images/monnas-logo2.png'],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Monnas - Centro de Cosmetología & Estética | Tandil",
    description: "Centro especializado en cosmetología, cejas, pestañas, tricología facial y depilación láser en Tandil, Buenos Aires.",
    images: ['/images/monnas-logo2.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
