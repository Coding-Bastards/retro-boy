"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

const AD_THROTTLE_MS = 2_500 // 2.5s
const CONTAINER_ID = "navite-ad-container"
const LAST_RENDER_KEY = "juz.adsquared.lastrender"
const UNIT_CODE = "73bf6ccc84a287eef83208628f87116d"
const PLACEMENT_CODE = "pl28635668"

const findAdArray = () => {
  if (typeof window === "undefined") return null
  for (let key in window) {
    if (
      key.startsWith("_0x") &&
      key.length > 15 &&
      Array.isArray((window as any)[key])
    ) {
      return key
    }
  }
  return null
}

export default function AdSquared({ className }: { className?: string }) {
  useEffect(() => {
    const container = document.getElementById(CONTAINER_ID)
    if (!container) return

    // Reset state
    container.classList.add("hidden")
    container.replaceChildren()

    const lastRender = parseInt(localStorage.getItem(LAST_RENDER_KEY) || "0")
    if (Date.now() - lastRender < AD_THROTTLE_MS) {
      return // Throttle showing ads too frequently
    }

    const adArrayKey = findAdArray()
    if (adArrayKey) {
      // Reset shown ads to allow re-paint
      ;(window as any)[adArrayKey] = []
    }

    const script = document.createElement("script")
    script.onerror = (error) => {
      console.debug({ error })
      container.classList.add("hidden")
    }

    script.src = `https://${PLACEMENT_CODE}.effectivegatecpm.com/${UNIT_CODE}/invoke.js`
    const ad = document.createElement("div")
    ad.id = `container-${UNIT_CODE}`
    container.replaceChildren(ad, script)

    let debounceTimer: NodeJS.Timeout

    const observer = new MutationObserver(() => {
      console.debug("[AdSquared] Mutation observed")

      // Clear-up previous timer
      clearTimeout(debounceTimer)

      // Wait 300ms from last mutation
      debounceTimer = setTimeout(() => {
        const img = container.querySelector('[class*="__img-container"] > div')
        if (img) {
          // Ad found - show container

          localStorage.setItem(LAST_RENDER_KEY, Date.now().toString())
          container.classList.remove("hidden")
          observer.disconnect() // Stop observing once ad is found
        }
      }, 300)
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearTimeout(debounceTimer)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="relative w-full">
      {/* Global styles to override ad appearance */}
      {/* Holding all together here to make it easy to re-use :p */}
      <style global>
        {`
          #navite-ad-container [class*="__bn"] {
            max-width: none !important;
          }

          #navite-ad-container [class*="__img-container"] {
            border-radius: 1rem !important;
          }

          #navite-ad-container [class*="__cancel-btn"] {
            display: none !important;
          }

          #navite-ad-container [class*="__bn-container"] {
            padding: 0.5rem !important;
          }

          #navite-ad-container [class*="__link"] {
            z-index: 0 !important;
          }

          #navite-ad-container [class*="__title"] {
            pointer-events: none !important;
          }
        `}
      </style>

      <div
        id={CONTAINER_ID}
        className={cn("hidden AdSquared w-full animate-in fade-in", className)}
      />
    </div>
  )
}
