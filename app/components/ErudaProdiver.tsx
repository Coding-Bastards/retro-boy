"use client"

import { type PropsWithChildren, useEffect } from "react"
import { isDev } from "@/lib/env"

export default function ErudaProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (isDev()) {
      // Show for dev address + dev envs
      require("eruda").init()
    }
  }, [])

  return children
}
