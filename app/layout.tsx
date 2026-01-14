import "./globals.css"
import type { Metadata, Viewport } from "next"
import Script from "next/script"

import { Geist_Mono } from "next/font/google"
import { EmulatorProvider } from "@/lib/EmulatorContext"
import { Toaster } from "sonner"

import { AlertProvider } from "@/components/Alert"
import SafeInsetProvider from "@/components/SafeInsetProvider"
import ErudaProvider from "@/components/ErudaProdiver"
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
  metadataBase: new URL("https://retro-boy.codingbastards.com/"),
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const APP_ID = "app_a13136423b04187d0af66d74f5dd7eb6"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nextFont.className} antialiased`}>
        <Script
          src="https://oculus-sdk.humanlabs.world"
          crossOrigin="anonymous"
        />
        <Script strategy="afterInteractive">
          {`
            window.oculusLayer = window.oculusLayer || [];
            function oculus() { oculusLayer.push(arguments); }

            oculus("app_id", "${APP_ID}");
          `}
        </Script>

        <Toaster
          swipeDirections={["left", "right", "bottom", "top"]}
          theme="light"
          toastOptions={{
            classNames: {
              toast: "rounded-full! py-3! pl-5!",
            },
          }}
          position="top-center"
        />
        <AlertProvider />

        <EmulatorProvider>
          <WorldProvider>
            <ErudaProvider>
              <SafeInsetProvider>{children}</SafeInsetProvider>
            </ErudaProvider>
          </WorldProvider>
        </EmulatorProvider>
      </body>
    </html>
  )
}
