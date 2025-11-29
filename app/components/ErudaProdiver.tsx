"use client"

import { type PropsWithChildren, useEffect } from "react"
import { isDev } from "@/lib/env"

export function initializeEruda() {
  // Already initialized
  if ((window as any).eruda) return
  require("eruda").init()
}

export default function ErudaProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    // Show on local dev
    if (isDev()) initializeEruda()
  }, [])

  return children
}
