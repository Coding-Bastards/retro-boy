"use client"

import { type PropsWithChildren, useEffect } from "react"

export default function ErudaProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (process.env.NODE_ENV != "production") {
      // Show for dev address + dev envs
      require("eruda").init()
    }
  }, [])

  return children
}
