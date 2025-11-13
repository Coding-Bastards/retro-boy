"use client"

import { type PropsWithChildren, useEffect } from "react"

export default function ErudaProvider({ children }: PropsWithChildren) {
  if (typeof window == "undefined") return null

  useEffect(() => {
    if (process.env.NODE_ENV != "production") {
      require("eruda").init()
    }
  }, [])

  return children
}
