"use client"

import { useEffect, useRef } from "react"

export const useScrollRestoration = (key: string) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedPos = sessionStorage.getItem(key)
    if (savedPos && ref.current) {
      ref.current.scrollTop = Number(savedPos)
    }
  }, [key])

  const saveScrollPosition = () => {
    if (!ref.current) return
    sessionStorage.setItem(key, ref.current.scrollTop.toString())
  }

  return { ref, saveScrollPosition }
}
