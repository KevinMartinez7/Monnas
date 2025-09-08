import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Monnas - Centro de Cosmetología & Estética | Tandil",
  description:
    "Centro especializado en cosmetología, cejas, pestañas, tricología facial y depilación láser en Tandil, Buenos Aires. Cuidados personalizados para realzar tu belleza natural.",
  keywords: "cosmetología, estética, cejas, pestañas, depilación láser, tricología, Tandil, Buenos Aires, belleza",
  generator: "v0.app",
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
