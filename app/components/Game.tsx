"use client"

import { useRef, useEffect, useState } from "react"

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gameboy, setGameboy] = useState<any>(null)
  const [audioClass, setAudioClass] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const gbInstanceRef = useRef<any>(null)
  const animationIdRef = useRef<number>(0)

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

  // Handle button press
  const handleButtonPress = (joypadCode: number) => {
    const gb = gbInstanceRef.current
    if (!gb) return
    gb.JoyPadEvent(joypadCode, true)
  }

  // Handle button release
  const handleButtonRelease = (joypadCode: number) => {
    const gb = gbInstanceRef.current
    if (!gb) return
    gb.JoyPadEvent(joypadCode, false)
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
      setIsRunning(true)

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

  const handleReset = () => {
    // Stop the game loop
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = 0
    }

    // Clear refs
    gbInstanceRef.current = null

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsLoaded(false)
    setIsRunning(false)
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-linear-to-b from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-white mb-2">🎮 Retro Boy</h1>
      </div>

      {/* Screen */}
      <div className="flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={160}
          height={144}
          className="border-8 border-slate-700 rounded-xl shadow-2xl bg-[#8b956d]"
          style={{
            imageRendering: "pixelated",
            width: "min(90vw, 320px)",
            height: "min(81vw, 288px)",
          }}
        />
      </div>

      {/* Controls */}
      <div className="w-full max-w-md pb-4">
        <div className="flex justify-between items-center mb-4">
          {/* D-Pad */}
          <div className="relative w-32 h-32">
            <button
              onTouchStart={() => handleButtonPress(2)}
              onTouchEnd={() => handleButtonRelease(2)}
              onMouseDown={() => handleButtonPress(2)}
              onMouseUp={() => handleButtonRelease(2)}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-700 rounded active:bg-slate-600 flex items-center justify-center text-white text-xl select-none"
            >
              ▲
            </button>
            <button
              onTouchStart={() => handleButtonPress(3)}
              onTouchEnd={() => handleButtonRelease(3)}
              onMouseDown={() => handleButtonPress(3)}
              onMouseUp={() => handleButtonRelease(3)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-700 rounded active:bg-slate-600 flex items-center justify-center text-white text-xl select-none"
            >
              ▼
            </button>
            <button
              onTouchStart={() => handleButtonPress(1)}
              onTouchEnd={() => handleButtonRelease(1)}
              onMouseDown={() => handleButtonPress(1)}
              onMouseUp={() => handleButtonRelease(1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-700 rounded active:bg-slate-600 flex items-center justify-center text-white text-xl select-none"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleButtonPress(0)}
              onTouchEnd={() => handleButtonRelease(0)}
              onMouseDown={() => handleButtonPress(0)}
              onMouseUp={() => handleButtonRelease(0)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-700 rounded active:bg-slate-600 flex items-center justify-center text-white text-xl select-none"
            >
              ▶
            </button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 rounded" />
          </div>

          {/* A/B Buttons */}
          <div className="flex gap-3">
            <button
              onTouchStart={() => handleButtonPress(5)}
              onTouchEnd={() => handleButtonRelease(5)}
              onMouseDown={() => handleButtonPress(5)}
              onMouseUp={() => handleButtonRelease(5)}
              className="w-16 h-16 bg-rose-600 rounded-full active:bg-rose-700 text-white font-bold text-xl shadow-lg select-none"
            >
              B
            </button>
            <button
              onTouchStart={() => handleButtonPress(4)}
              onTouchEnd={() => handleButtonRelease(4)}
              onMouseDown={() => handleButtonPress(4)}
              onMouseUp={() => handleButtonRelease(4)}
              className="w-16 h-16 bg-rose-600 rounded-full active:bg-rose-700 text-white font-bold text-xl shadow-lg select-none"
            >
              A
            </button>
          </div>
        </div>

        {/* Start/Select */}
        <div className="flex justify-center gap-4 mb-3">
          <button
            onTouchStart={() => handleButtonPress(6)}
            onTouchEnd={() => handleButtonRelease(6)}
            onMouseDown={() => handleButtonPress(6)}
            onMouseUp={() => handleButtonRelease(6)}
            className="px-6 py-2 bg-slate-600 rounded-full text-white text-sm active:bg-slate-500 select-none"
          >
            SELECT
          </button>
          <button
            onTouchStart={() => handleButtonPress(7)}
            onTouchEnd={() => handleButtonRelease(7)}
            onMouseDown={() => handleButtonPress(7)}
            onMouseUp={() => handleButtonRelease(7)}
            className="px-6 py-2 bg-slate-600 rounded-full text-white text-sm active:bg-slate-500 select-none"
          >
            START
          </button>
        </div>

        {/* Reset/Load Button */}
        {!isLoaded ? (
          <label className="block w-full py-2 bg-emerald-500 text-white text-center font-semibold rounded-lg cursor-pointer hover:bg-emerald-600 active:bg-emerald-700 transition-colors">
            Load ROM
            <input
              ref={fileInputRef}
              type="file"
              accept=".gb,.gbc"
              onChange={handleFileSelect}
              disabled={!gameboy}
              className="hidden"
            />
          </label>
        ) : (
          <button
            onClick={handleReset}
            className="w-full py-2 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 active:bg-amber-600 transition-colors"
          >
            Load New ROM
          </button>
        )}
      </div>
    </div>
  )
}
