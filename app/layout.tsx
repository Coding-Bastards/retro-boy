import "./globals.css"
import type { Metadata, Viewport } from "next"

import { Geist_Mono } from "next/font/google"
import { EmulatorProvider } from "@/app/lib/EmulatorContext"
import WorldProvider from "./WorldProvider"

const nextFont = Geist_Mono({
  subsets: [],
  display: "fallback",
  adjustFontFallback: true,
  preload: true,
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Retro Boy",
  description: "Nostalgic Gaming on the Go",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nextFont.className} antialiased`}>
        <EmulatorProvider>
          <WorldProvider>{children}</WorldProvider>
        </EmulatorProvider>
      </body>
    </html>
  )
}
