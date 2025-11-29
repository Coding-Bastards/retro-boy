"use client"

import { type PropsWithChildren, Fragment, useCallback, useState } from "react"
import { toast } from "sonner"
import LZString from "lz-string"
import dynamic from "next/dynamic"

import { useEmulator } from "@/lib/EmulatorContext"
import { useProFeatures } from "@/hooks/pro"
import { useAtomIsCatalogueOpen } from "@/app/lib/store"
import { cn } from "@/lib/utils"

import { TbChevronCompactUp } from "react-icons/tb"
import { ImCross } from "react-icons/im"
import { IoMdCodeDownload } from "react-icons/io"

import { ASPECT_RATIO } from "./internals"

interface StateSlot {
  state: string
  snapshot: string
  timestamp: number
}

const DialogProPayment = dynamic(() => import("./DialogProPayment"), {
  ssr: false,
})

export default function GameTray() {
  const [, setUpdatedCount] = useState(0)

  const { gameCanvas, getGameboyInstance, currentGame } = useEmulator()
  const [isOpenSlotsGrid, setIsOpenSlotsGrid] = useState(false)
  const [, setIsCatalogueOpen] = useAtomIsCatalogueOpen()

  // Pro Features - Save States
  const { isProUser } = useProFeatures()
  const [isOpenProPaymentDialog, setIsOpenProPaymentDialog] = useState(false)

  const getSlotAt = useCallback(
    (slot: number) =>
      // NONE as deafult to avoid issues when no game is loaded
      getStateManager(currentGame?.gameCollectionId || "NONE", slot),
    [currentGame?.gameCollectionId]
  )

  const openGamesCatalogue = () => setIsCatalogueOpen(true)
  const closeSlotsGrid = () => setIsOpenSlotsGrid(false)

  const writeToSlot = (slot: number, state: StateSlot | null) => {
    getSlotAt(slot).write(state)
    // Sync state slots w/ UI
    setUpdatedCount((c) => c + 1)
  }

  const handleSaveState = (slot: number) => {
    // Asume emulator is not initialized
    if (!gameCanvas) return
    if (!isProUser) {
      // Show pro payment dialog
      return setIsOpenProPaymentDialog(true)
    }

    const gb = getGameboyInstance()
    // Don't block the user - show solution: Games Catalogue
    if (!gb || !currentGame) {
      // Close slots tray so user learns about the "required" flow
      return closeSlotsGrid(), openGamesCatalogue()
    }

    try {
      const gameState = gb.saveState()
      const snapshot = gameCanvas.toDataURL("image/png")
      const compressedState = LZString.compress(JSON.stringify(gameState))

      writeToSlot(slot, {
        timestamp: Date.now(),
        snapshot,
        state: compressedState,
      })
    } catch (error) {
      console.error({ error })
      toast.error("Oops... something went wrong")
    }
  }

  const handleLoadState = (slot: number) => {
    const gb = getGameboyInstance()
    if (!gb || !currentGame) return openGamesCatalogue()

    try {
      const storedState = getSlotAt(slot).value
      const decompressed = LZString.decompress(storedState?.state || "")

      if (!decompressed) throw new Error("Decompression failed")
      gb.returnFromState(JSON.parse(decompressed))

      // Close slots tray
      closeSlotsGrid()
    } catch (error) {
      console.error({ error })
      toast.error("Failed to load")
    }
  }

  return (
    <Fragment>
      <DialogProPayment
        isOpen={isOpenProPaymentDialog}
        onOpenChange={setIsOpenProPaymentDialog}
      />
      {isOpenSlotsGrid ? (
        <Fragment>
          <div
            onClick={closeSlotsGrid}
            className="fixed z-4 cursor-pointer inset-0"
          />

          <div className="absolute z-3 cursor-pointer animate-in fade-in inset-0 bg-black/30 backdrop-blur-sm rounded-xl" />

          <div
            style={{
              display: isOpenSlotsGrid ? "block" : "hidden",
            }}
            className="absolute animate-in fade-in pt-3 px-3 pb-1.5 bg-rb-black rounded-t-3xl z-5 left-0 right-0 -bottom-px"
          >
            <TickHandle
              isRotated
              onClick={closeSlotsGrid}
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            />

            <h2 className="text-center text-sm">
              <strong className="text-white">GAME STATES (PRO)</strong>
            </h2>

            <div className="grid mt-3.5 grid-cols-3 gap-2.5 text-white">
              {Array.from({ length: 3 }).map((_, index) => {
                const state = getSlotAt(index).value

                return (
                  <SlotItem
                    key={`slot-item-${index}`}
                    state={state}
                    onClick={() =>
                      // Save or Load depending on existing state
                      (state ? handleLoadState : handleSaveState)(index)
                    }
                  >
                    {state ? (
                      <div className="absolute inset-0 rounded-md bg-linear-to-tr from-black/0 via-black/0 to-black/50">
                        <button
                          // Clean the slot
                          onClick={(e) => {
                            e.stopPropagation()
                            writeToSlot(index, null)
                          }}
                          className="absolute p-1 -top-1.5 -right-1.5 bg-white/10 border border-white/10 text-white backdrop-blur rounded-full"
                        >
                          <ImCross className="text-xs scale-80" />
                        </button>
                      </div>
                    ) : (
                      <div className="opacity-70 grid place-items-center">
                        <IoMdCodeDownload className="text-xl" />
                        <strong className="text-xs">SAVE</strong>
                      </div>
                    )}
                  </SlotItem>
                )
              })}
            </div>
          </div>
        </Fragment>
      ) : (
        <TickHandle
          className="absolute z-3 -bottom-2.5 left-1/2 -translate-x-1/2"
          onClick={() => setIsOpenSlotsGrid(true)}
        />
      )}
    </Fragment>
  )
}

function getStateManager(collectionId: string, slot: number) {
  const KEY = `rb.saved.state.${collectionId}.slot.${slot}`
  return {
    get value() {
      return JSON.parse(localStorage.getItem(KEY) || "null") as StateSlot | null
    },
    write: (data: StateSlot | null) =>
      localStorage.setItem(KEY, JSON.stringify(data)),
  }
}

function TickHandle({
  onClick,
  className,
  isRotated,
}: {
  onClick?: () => void
  className?: string
  isRotated?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-rb-black w-9 h-5 grid place-items-center rounded-t-lg text-white border-t-black border-t",
        className
      )}
    >
      <TbChevronCompactUp
        className={cn(
          "text-amber-100/60 -translate-y-0.5 scale-x-105 text-xl",
          isRotated && "rotate-180"
        )}
      />
    </button>
  )
}

function SlotItem({
  state,
  onClick,
  children,
}: PropsWithChildren<{
  state: StateSlot | null
  onClick?: () => void
}>) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundImage: `url(${state?.snapshot})`,
        aspectRatio: ASPECT_RATIO,
      }}
      className={cn(
        state || "border",
        "bg-cover border-white/10 relative flex flex-col items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
      )}
    >
      {children}
    </button>
  )
}
