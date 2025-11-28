"use client"

import { type PropsWithChildren, Fragment, useCallback, useState } from "react"
import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"
import { toast } from "sonner"
import LZString from "lz-string"

import { useWorldAuth } from "@radish-la/world-auth"
import { useEmulator } from "@/lib/EmulatorContext"
import { isDev } from "@/lib/env"
import { cn } from "@/lib/utils"

import { TbChevronCompactUp } from "react-icons/tb"
import { ImCross } from "react-icons/im"
import { IoMdCodeDownload } from "react-icons/io"

import { ASPECT_RATIO } from "./internals"
import { DEV_ADDRESS } from "@/lib/constants"

interface StateSlot {
  state: string
  snapshot: string
  timestamp: number
}

const atomIsFeatureStatesEnabled = atomWithStorage(
  "rb.feature.save-states.enabled",
  false
)

export default function GameTray() {
  const [, setUpdatedCount] = useState(0)

  const { gameCanvas, getGameboyInstance, currentGame } = useEmulator()
  const { address } = useWorldAuth()

  const [isOpenSlotsGrid, setIsOpenSlotsGrid] = useState(false)
  const [_isFeatureEnabled, setIsFeatureEnabled] = useAtom(
    atomIsFeatureStatesEnabled
  )

  // Enabled for DEV env, if PRO user or DEV_ADDRESS
  const isFeatureEnabled =
    isDev() || _isFeatureEnabled || address === DEV_ADDRESS

  const getSlotAt = useCallback(
    (slot: number) =>
      // NONE as deafult to avoid issues when no game is loaded
      getStateManager(currentGame?.gameCollectionId || "NONE", slot),
    [currentGame?.gameCollectionId]
  )

  const writeToSlot = (slot: number, state: StateSlot | null) => {
    getSlotAt(slot).write(state)
    // Sync state slots w/ UI
    setUpdatedCount((c) => c + 1)
  }

  const handleSaveState = (slot: number) => {
    if (!isFeatureEnabled) {
      // TODO: Add pay wall modal
      return toast.error("Only available for PRO users")
    }

    const gb = getGameboyInstance()
    if (!gb || !currentGame || !gameCanvas) {
      return toast.error("Load a game to save your state")
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
      toast.error("Failed to save")
    }
  }

  const handleLoadState = (slot: number) => {
    const gb = getGameboyInstance()
    if (!gb || !currentGame) {
      return toast.error("Load a game to save your state")
    }

    try {
      const storedState = getSlotAt(slot).value
      const decompressed = LZString.decompress(storedState?.state || "")

      if (!decompressed) throw new Error("Failed to load state")
      gb.returnFromState(JSON.parse(decompressed))

      // Close slots tray
      setIsOpenSlotsGrid(false)
    } catch (error) {
      console.error({ error })
      toast.error("Failed to load")
    }
  }

  return isOpenSlotsGrid ? (
    <Fragment>
      <div
        onClick={() => setIsOpenSlotsGrid(false)}
        className="fixed z-4 cursor-pointer inset-0"
      />

      <div className="absolute z-3 cursor-pointer animate-in fade-in inset-0 bg-black/30 backdrop-blur-sm rounded-xl" />

      <div
        style={{
          display: isOpenSlotsGrid ? "block" : "hidden",
        }}
        className="absolute animate-in fade-in pt-3 px-3 pb-1.5 bg-rb-black rounded-t-xl z-5 left-0 right-0 -bottom-px"
      >
        <TickHandle
          isRotated
          className="absolute -top-2.5 left-1/2 -translate-x-1/2"
          onClick={() => setIsOpenSlotsGrid(false)}
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
      className="absolute z-3 -bottom-2 left-1/2 -translate-x-1/2"
      onClick={() => setIsOpenSlotsGrid(true)}
    />
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
        "bg-rb-black w-9 h-5 grid place-items-center rounded-t-md text-white border-t-black border-t",
        className
      )}
    >
      <TbChevronCompactUp
        className={cn(
          "text-white -translate-y-0.5 scale-x-105 text-xl",
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
