"use client"

import { useEffect, useRef } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import { Joystick } from "react-joystick-component"

import { cn } from "@/lib/utils"
import { useAtomIsCatalogueOpen, useAtomTimePlayed } from "@/lib/store"
import { RiArrowUpWideLine } from "react-icons/ri"
import { ImFolderDownload } from "react-icons/im"
import { useEmulator } from "@/lib/EmulatorContext"

import MechanicalButton from "@/components/MechanicalButton"
import JoyPad from "./JoyPad"

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStartTimeRef = useRef<number | null>(null)
  const lastKeyPressedRef = useRef<number | null>(null)

  const { address } = useWorldAuth()
  const [, setCatalogueOpen] = useAtomIsCatalogueOpen()
  const [, setTimePlayed] = useAtomTimePlayed()

  const {
    isGameLoaded,
    currentGame,
    sendJoyPadEvent,
    registerCanvas,
    gameCanvas,
  } = useEmulator()

  const addActiveDirectionClsx = (direction: string) => {
    document.getElementById(direction)?.classList?.add("text-white/60")
  }

  const releaseAllDirections = () => {
    sendJoyPadEvent(0, false) // RIGHT
    sendJoyPadEvent(1, false) // LEFT
    sendJoyPadEvent(2, false) // UP
    sendJoyPadEvent(3, false) // DOWN

    // Remove active state from all direction arrows
    document.querySelectorAll(".joy-container div[id]").forEach((el) => {
      el.classList.remove("text-white/60")
    })
  }

  const trackActivity = (joyPadCode: number) => {
    // Don't track if no game is loaded or NO address
    const gameId = currentGame?.gameCollectionId
    if (!gameId || !address) return

    // Keep track of last key pressed
    const lastKeyPressed = lastKeyPressedRef.current

    // Update last key pressed without checks
    lastKeyPressedRef.current = joyPadCode

    // Do not track if the same key is pressed again
    if (lastKeyPressed === joyPadCode) return

    const now = Date.now()
    const startTime = gameStartTimeRef.current || now
    const timeDelta = now - startTime

    // Update after 1s or when starting (ZERO prev time)
    if (timeDelta >= 1_000 || timeDelta === 0) {
      // Reset game start time
      gameStartTimeRef.current = now

      // Only update if time delta is reasonable (<5 seconds)
      if (timeDelta > 5_000) return

      setTimePlayed((prev) => {
        const playerTime = prev?.[gameId]?.[address] || 0
        return {
          ...prev,
          [gameId]: {
            ...prev[gameId],
            // Increment previous time played by seconds
            [address]: playerTime + Math.floor(timeDelta / 1000),
          },
        }
      })
    }
  }

  const sendKeyDownEvent = (keyCode: number) => {
    sendJoyPadEvent(keyCode, true)
    trackActivity(keyCode)
  }

  const handleButtonRelease = (joypadCode: number) => {
    sendJoyPadEvent(joypadCode, false)
  }

  const handleJoystickMove = (data: any = {}) => {
    releaseAllDirections()

    if (data.direction === "RIGHT") {
      sendKeyDownEvent(0)
      addActiveDirectionClsx("RIGHT")
    } else if (data.direction === "LEFT") {
      sendKeyDownEvent(1)
      addActiveDirectionClsx("LEFT")
    } else if (data.direction === "FORWARD") {
      sendKeyDownEvent(2)
      addActiveDirectionClsx("FORWARD")
    } else if (data.direction === "BACKWARD") {
      sendKeyDownEvent(3)
      addActiveDirectionClsx("BACKWARD")
    }
  }

  // Register the canvas with the emulator context
  useEffect(() => {
    if (gameCanvas) return
    registerCanvas(canvasRef.current)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Screen */}
      <div
        role="button"
        onClick={() => setCatalogueOpen(true)}
        className="flex-1 relative w-full flex items-center justify-center cursor-pointer transition-all"
      >
        {isGameLoaded ? null : (
          <div className="absolute inset-0 text-black/35 flex gap-1 flex-col items-center justify-center">
            <ImFolderDownload className="text-3xl" />
            <span className="text-sm font-black uppercase">LOAD GAME</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={160}
          height={144}
          className={cn(
            isGameLoaded ? "border-black/75" : "border-black/45",
            "border-[3px] rounded-xl bg-rb-lcd w-full h-auto"
          )}
          style={{
            imageRendering: "crisp-edges",
            aspectRatio: "160 / 144",
          }}
        />
      </div>

      {/* Controls */}
      <div className="w-full mt-4 pb-4">
        <div className="flex justify-between items-center">
          <JoyPad
            stop={() => releaseAllDirections()}
            move={handleJoystickMove}
          />

          {/* A/B Buttons */}
          <div className="flex mb-6 gap-4">
            <MechanicalButton
              className="mt-10"
              onPress={() => sendKeyDownEvent(5)}
              onRelease={() => handleButtonRelease(5)}
            >
              B
            </MechanicalButton>

            <MechanicalButton
              onPress={() => sendKeyDownEvent(4)}
              onRelease={() => handleButtonRelease(4)}
            >
              A
            </MechanicalButton>
          </div>
        </div>

        {/* Start/Select */}
        <div className="flex justify-center gap-4 mt-14">
          <MechanicalButton
            className="h-6"
            onPress={() => sendKeyDownEvent(6)}
            onRelease={() => handleButtonRelease(6)}
            variant="pill"
          >
            SELECT
          </MechanicalButton>
          <MechanicalButton
            className="h-6"
            onPress={() => sendKeyDownEvent(7)}
            onRelease={() => handleButtonRelease(7)}
            variant="pill"
          >
            START
          </MechanicalButton>
        </div>
      </div>

      <div className="grow" />
    </div>
  )
}
