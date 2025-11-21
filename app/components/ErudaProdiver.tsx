"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { type PropsWithChildren, useEffect } from "react"

const DEV_ADDRESS = "0x4c46f6d2314a41915324af999685ac447cbb79d9"
export default function ErudaProvider({ children }: PropsWithChildren) {
  const { address } = useWorldAuth()
  if (typeof window == "undefined") return null

  useEffect(() => {
    const isDevAddress = address === DEV_ADDRESS
    if (process.env.NODE_ENV != "production" || isDevAddress) {
      // Show for dev address + dev envs
      require("eruda").init()
    }
  }, [address])

  return children
}
