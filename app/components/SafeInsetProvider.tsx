"use client"

import { MiniKit } from "@worldcoin/minikit-js"
import { useEffect, type PropsWithChildren } from "react"

export default function SafeInsetProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const bottomInset = MiniKit.deviceProperties.safeAreaInsets?.bottom || 0
    document.documentElement.style.setProperty(
      "--safe-inset-bottom",
      `${bottomInset}px`
    )
  }, [])
  return children
}
