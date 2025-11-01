import "./globals.css"
import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

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
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nextFont.className} antialiased`}>{children}</body>
    </html>
  )
}
