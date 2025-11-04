"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Button from "./Button"

export default function Market() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("market") === "open"

  const handleClose = () => {
    router.back()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-rb-darker">
      <div className="flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-5 pb-4">
          <h1 className="text-white text-center uppercase font-black text-xl">
            MARKET
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5">
          <div className="text-white/60 text-center py-12">MARKET EXAMPLE</div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-1">
          <Button onClick={handleClose}>BACK TO GAME</Button>
        </div>
      </div>
    </div>
  )
}
