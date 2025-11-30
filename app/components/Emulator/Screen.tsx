"use client"

import { type PropsWithChildren, useEffect, useRef } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"
import { useAtomIsCatalogueOpen } from "@/lib/store"
import { useEmulator } from "@/lib/EmulatorContext"

import { ImFolderDownload } from "react-icons/im"
import { ASPECT_RATIO, CANVAS_HEIGHT, CANVAS_WIDTH } from "./internals"

const GameTray = dynamic(() => import("./GameTray"), { ssr: false })
export default function Screen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { isConnected, signIn } = useWorldAuth()
  const { isGameLoaded, isLoading, gameCanvas, registerCanvas } = useEmulator()
  const [, setCatalogueOpen] = useAtomIsCatalogueOpen()

  function handleOpenCatalogue() {
    if (!isConnected) return signIn()
    setCatalogueOpen(true)
  }

  // Register the canvas @ emulator context
  useEffect(() => {
    if (gameCanvas || !canvasRef.current) return
    console.debug("Setting up canvas")
    registerCanvas(canvasRef.current, CANVAS_WIDTH, CANVAS_HEIGHT)
  })

  return (
    <section className="relative">
      <div
        role="button"
        onClick={handleOpenCatalogue}
        className={cn(
          "border-[3px] rounded-xl bg-rb-lcd",
          isGameLoaded ? "border-black/75" : "border-black/45",
          "shrink-0 overflow-hidden relative w-full flex items-center justify-center cursor-pointer transition-all"
        )}
      >
        {isLoading ? (
          <LoadingOverlay>
            <figure className="size-9 grid place-items-center">
              <div className="inline-block size-7 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            </figure>
            <span className="text-sm font-black uppercase">LOADING NFT</span>
          </LoadingOverlay>
        ) : isGameLoaded ? null : (
          <LoadingOverlay>
            <figure className="size-9 grid place-items-center">
              <ImFolderDownload className="text-3xl" />
            </figure>
            <span className="text-sm font-black uppercase">LOAD GAME</span>
          </LoadingOverlay>
        )}

        <canvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={canvasRef}
          className="w-full h-auto"
          style={{
            imageRendering: "pixelated",
            aspectRatio: ASPECT_RATIO,
          }}
        />
      </div>
      <GameTray />
    </section>
  )
}

function LoadingOverlay({ children }: PropsWithChildren) {
  return (
    <div className="absolute inset-0 bg-rb-lcd/90 backdrop-blur-sm text-black/35 flex flex-col items-center justify-center">
      {children}
    </div>
  )
}
