"use client"

import { useEffect, useRef } from "react"
import { useAtom } from "jotai"
import { Joystick } from "react-joystick-component"

import { cn } from "@/app/lib/utils"
import { catalogueOpenAtom } from "@/app/lib/store"
import { RiArrowUpWideLine } from "react-icons/ri"
import { ImFolderDownload } from "react-icons/im"
import { useEmulator } from "@/app/lib/EmulatorContext"

import MechanicalButton from "./MechanicalButton"

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [, setCatalogueOpen] = useAtom(catalogueOpenAtom)
  const { isGameLoaded, sendJoyPadEvent, registerCanvas, gameCanvas } =
    useEmulator()

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

  const handleButtonPress = (joypadCode: number) => {
    sendJoyPadEvent(joypadCode, true)
  }

  const handleButtonRelease = (joypadCode: number) => {
    sendJoyPadEvent(joypadCode, false)
  }

  const handleJoystickMove = (data: any = {}) => {
    releaseAllDirections()

    if (data.direction === "RIGHT") {
      sendJoyPadEvent(0, true)
      addActiveDirectionClsx("RIGHT")
    } else if (data.direction === "LEFT") {
      sendJoyPadEvent(1, true)
      addActiveDirectionClsx("LEFT")
    } else if (data.direction === "FORWARD") {
      sendJoyPadEvent(2, true)
      addActiveDirectionClsx("FORWARD")
    } else if (data.direction === "BACKWARD") {
      sendJoyPadEvent(3, true)
      addActiveDirectionClsx("BACKWARD")
    }
  }

  const handleJoystickStop = () => {
    releaseAllDirections()
  }

  const openGameCatalogue = () => setCatalogueOpen(true)

  const withOpenCatalogue = (cb: () => void) => {
    // Open catalogue if game not loaded
    // else call the callback method
    return isGameLoaded ? cb : openGameCatalogue
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
        onClick={openGameCatalogue}
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
            imageRendering: "pixelated",
            aspectRatio: "160 / 144",
          }}
        />
      </div>

      {/* Controls */}
      <div className="w-full mt-4 pb-4">
        <div className="flex justify-between items-center">
          {/* Joystick Pad Keys */}
          <div className="flex bg-white/1 border border-black/15 shadow-inner rounded-full joy-container items-center justify-center relative">
            <div className="absolute pointer-events-none text-white/5 text-xl grid grid-cols-2 p-1 inset-0">
              <div
                id="FORWARD"
                className="col-span-2 flex items-start justify-center"
              >
                <RiArrowUpWideLine />
              </div>
              <div id="LEFT" className="flex items-center justify-start">
                <RiArrowUpWideLine className="-rotate-90" />
              </div>
              <div id="RIGHT" className="flex items-center justify-end">
                <RiArrowUpWideLine className="rotate-90" />
              </div>
              <div
                id="BACKWARD"
                className="col-span-2 flex items-end justify-center"
              >
                <RiArrowUpWideLine className="rotate-180" />
              </div>
            </div>

            <style scoped>{`
              .joy-container button {
                width: 100% !important;
                height: 100% !important;
              }

              .joy-container button::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 58%;
                height: 58%;
                border-radius: 100%;
                background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
                box-shadow: 0 0px 4px 2px rgba(0,0,0,0.1), 0 0px 12px 0 rgba(0,0,0,0.4);
              }
            `}</style>

            <Joystick
              size={120}
              baseColor="transparent"
              stickColor="transparent"
              move={handleJoystickMove}
              stop={handleJoystickStop}
              minDistance={5}
              throttle={10}
            />
          </div>

          {/* A/B Buttons */}
          <div className="flex mb-6 gap-4">
            <MechanicalButton
              className="mt-10"
              onPress={() => handleButtonPress(5)}
              onRelease={() => handleButtonRelease(5)}
            >
              B
            </MechanicalButton>

            <MechanicalButton
              onPress={() => handleButtonPress(4)}
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
            onPress={withOpenCatalogue(() => handleButtonPress(6))}
            onRelease={withOpenCatalogue(() => handleButtonRelease(6))}
            variant="pill"
          >
            SELECT
          </MechanicalButton>
          <MechanicalButton
            className="h-6"
            onPress={withOpenCatalogue(() => handleButtonPress(7))}
            onRelease={withOpenCatalogue(() => handleButtonRelease(7))}
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
