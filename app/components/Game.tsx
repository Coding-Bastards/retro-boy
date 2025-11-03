"use client"

import { useRef, useEffect, useState } from "react"
import { useSetAtom } from "jotai"
import { Joystick } from "react-joystick-component"

import { cn } from "@/app/lib/utils"
import { catalogueOpenAtom } from "@/app/lib/store"
import { RiArrowUpWideLine } from "react-icons/ri"

import MechanicalButton from "./MechanicalButton"
import WalletConnect from "./WalletConnect"
import GameCatalogue from "./GameCatalogue"
import { ImFolderDownload } from "react-icons/im"

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gameboy, setGameboy] = useState<any>(null)
  const [audioClass, setAudioClass] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const gbInstanceRef = useRef<any>(null)
  const animationIdRef = useRef<number>(0)
  const setCatalogueOpen = useSetAtom(catalogueOpenAtom)

  // Load the GameBoy emulator and audio library
  useEffect(() => {
    const loadEmulator = async () => {
      try {
        // Load our custom audio implementation
        const audioModule = await import("../lib/audio")
        const GameBoyAudio = audioModule.default || (window as any).GameBoyAudio

        if (GameBoyAudio) {
          console.log("GameBoy Audio loaded!")
          setAudioClass(() => GameBoyAudio)
        } else {
          console.warn("GameBoy Audio not found, sound will be disabled")
        }

        // Load GameBoy emulator
        const module = await import("../lib/gameboy")
        const GameBoyCore = module.default
        console.log("GameBoy emulator loaded")
        setGameboy(() => GameBoyCore)
      } catch (error) {
        console.error("Failed to load GameBoy emulator:", error)
      }
    }

    loadEmulator()
  }, [])

  const addActiveDirectionClsx = (direction: string) => {
    document.getElementById(direction)?.classList.add("text-white/60")
  }

  const releaseAllDirections = () => {
    const gb = gbInstanceRef.current
    if (!gb) return
    gb.JoyPadEvent(0, false)
    gb.JoyPadEvent(1, false)
    gb.JoyPadEvent(2, false)
    gb.JoyPadEvent(3, false)

    // Remove active state from all direction arrows
    document.querySelectorAll(".joy-container div[id]").forEach((el) => {
      el.classList.remove("text-white/60")
    })
  }

  const handleButtonPress = (joypadCode: number) => {
    const gb = gbInstanceRef.current
    if (!gb) return
    gb.JoyPadEvent(joypadCode, true)
  }

  const handleButtonRelease = (joypadCode: number) => {
    const gb = gbInstanceRef.current
    if (!gb) return
    gb.JoyPadEvent(joypadCode, false)
  }

  const handleJoystickMove = (data: any) => {
    const gb = gbInstanceRef.current
    if (!gb) return

    if (data.distance && data.distance < 10) {
      releaseAllDirections()
      return
    }

    if (data.direction) {
      releaseAllDirections()

      if (data.direction === "RIGHT") {
        gb.JoyPadEvent(0, true)
        addActiveDirectionClsx("RIGHT")
      } else if (data.direction === "LEFT") {
        gb.JoyPadEvent(1, true)
        addActiveDirectionClsx("LEFT")
      } else if (data.direction === "FORWARD") {
        gb.JoyPadEvent(2, true)
        addActiveDirectionClsx("FORWARD")
      } else if (data.direction === "BACKWARD") {
        gb.JoyPadEvent(3, true)
        addActiveDirectionClsx("BACKWARD")
      }
    }
  }

  const handleJoystickStop = () => {
    releaseAllDirections()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [])

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file || !gameboy || !canvasRef.current) return

    // Clean up previous instance if exists
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const romData = new Uint8Array(arrayBuffer)

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      // Create ImageData for rendering
      const imageData = ctx.createImageData(160, 144)

      // Initialize GameBoy emulator with the canvas and ROM with sound enabled
      console.log(
        "Initializing GameBoy with audio:",
        audioClass ? "enabled" : "disabled"
      )
      const gb = new gameboy(canvas, romData, {
        sound: audioClass, // Pass our custom audio constructor
        volume: 0.7,
        audioBufferMin: 10,
        audioBufferMax: 20,
      })

      // Store instance in ref
      gbInstanceRef.current = gb

      console.log("GameBoy instance created, opts.sound:", gb.opts.sound)
      console.log("GameBoy audioHandle:", gb.audioHandle)

      // Start the emulator
      gb.start()
      setIsLoaded(true)

      console.log(
        "GameBoy initialized and started, audioHandle:",
        gb.audioHandle
      )
      console.log("Sound master enabled:", gb.soundMasterEnabled)

      // Game loop with frame rendering
      const gameLoop = () => {
        try {
          // Set stopEmulator to 1 to signal ready to run next frame
          gb.stopEmulator = 1

          // Run the emulator (it handles frame timing internally)
          gb.run()

          // Copy frameBuffer to canvas
          const frameBuffer = gb.frameBuffer
          if (frameBuffer && frameBuffer.length > 0) {
            // Convert the Int32 color values to RGBA bytes
            for (let i = 0; i < 160 * 144; i++) {
              const color = frameBuffer[i]
              const pixelIndex = i * 4
              // Extract RGB from the packed int32 color
              imageData.data[pixelIndex] = (color >> 16) & 0xff // R
              imageData.data[pixelIndex + 1] = (color >> 8) & 0xff // G
              imageData.data[pixelIndex + 2] = color & 0xff // B
              imageData.data[pixelIndex + 3] = 255 // A (fully opaque)
            }
            // Draw to canvas
            ctx.putImageData(imageData, 0, 0)
          }

          // Keep looping
          animationIdRef.current = requestAnimationFrame(gameLoop)
        } catch (error) {
          console.error("Game loop error:", error)
        }
      }

      gameLoop()
    } catch (error) {
      console.error("Failed to load ROM:", error)
    }
  }

  async function loadGameFromRemote() {
    const GAME_URL =
      "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/game.gb"

    const response = await fetch(GAME_URL)
    if (!response.ok) {
      throw new Error("Failed to fetch game")
    }

    const blob = await response.blob()
    const file = new File([blob], "game.gb", {
      type: "application/octet-stream",
    })

    handleFileSelect({ target: { files: [file] } } as any)
  }

  return (
    <div className="flex flex-col h-screen p-5">
      <GameCatalogue onSelectGame={loadGameFromRemote} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".gb,.gbc"
        onChange={handleFileSelect}
        disabled={!gameboy}
        className="hidden"
      />

      {/* Header */}
      <nav className="flex pb-4 items-center justify-between">
        <div className="flex px-1.5 items-center">
          <div
            className={cn(
              isLoaded
                ? "bg-rb-green shadow-[0_0_6px_2px_rgba(34,197,94,0.4),0_0_14px_4px_rgba(34,197,94,0.2)]"
                : "bg-[#727272]",
              "rounded-full size-2"
            )}
          />
          <h1 className="text-lg relative px-2.5 italic font-black text-transparent bg-clip-text bg-linear-to-b from-white/25 via-white/40 to-white/25">
            RETRO BOY
          </h1>
        </div>

        <WalletConnect />
      </nav>

      {/* Screen */}
      <button
        onClick={() => {
          setCatalogueOpen(true)
        }}
        className="flex-1 relative w-full flex items-center justify-center"
      >
        {isLoaded ? null : (
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
            isLoaded ? "border-black/75" : "border-black/45",
            "border-[3px] rounded-xl bg-rb-lcd w-full h-auto"
          )}
          style={{
            imageRendering: "pixelated",
            aspectRatio: "160 / 144",
          }}
        />
      </button>

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
            onPress={() => handleButtonPress(6)}
            onRelease={() => handleButtonRelease(6)}
            variant="pill"
          >
            SELECT
          </MechanicalButton>
          <MechanicalButton
            className="h-6"
            onPress={() => handleButtonPress(7)}
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
