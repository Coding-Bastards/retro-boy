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

  // Keyboard controls effect
  useEffect(() => {
    if (!isLoaded || !gbInstanceRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const gb = gbInstanceRef.current
      if (!gb) return

      let joypadCode = -1
      switch (e.key.toLowerCase()) {
        case "z":
          joypadCode = 4
          break // A button
        case "x":
          joypadCode = 5
          break // B button
        case "arrowup":
          joypadCode = 2
          break // Up
        case "arrowdown":
          joypadCode = 3
          break // Down
        case "arrowleft":
          joypadCode = 1
          break // Left
        case "arrowright":
          joypadCode = 0
          break // Right
        case "enter":
          joypadCode = 7
          break // Start
        case " ":
          joypadCode = 6
          break // Select
      }

      if (joypadCode !== -1) {
        gb.JoyPadEvent(joypadCode, true)
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const gb = gbInstanceRef.current
      if (!gb) return

      let joypadCode = -1
      switch (e.key.toLowerCase()) {
        case "z":
          joypadCode = 4
          break
        case "x":
          joypadCode = 5
          break
        case "arrowup":
          joypadCode = 2
          break
        case "arrowdown":
          joypadCode = 3
          break
        case "arrowleft":
          joypadCode = 1
          break
        case "arrowright":
          joypadCode = 0
          break
        case "enter":
          joypadCode = 7
          break
        case " ":
          joypadCode = 6
          break
      }

      if (joypadCode !== -1) {
        gb.JoyPadEvent(joypadCode, false)
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isLoaded])

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
    <div className="flex flex-col items-center p-8 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 font-mono">
        🎮 Pocket GameBoy
      </h1>

      {!isLoaded && (
        <div className="text-center mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Load a GameBoy ROM
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".gb,.gbc,.gba"
            onChange={handleFileSelect}
            disabled={!gameboy}
            className="px-4 py-2 border-2 border-gray-300 rounded-md cursor-pointer hover:border-gray-400 disabled:opacity-50"
          />
          {!gameboy && (
            <p className="text-sm text-gray-500 mt-2">Loading emulator...</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <canvas
          ref={canvasRef}
          width={160}
          height={144}
          className="border-4 border-gray-800 rounded-lg shadow-xl"
          style={{
            imageRendering: "pixelated",
            width: "480px",
            height: "432px",
            backgroundColor: "#8b956d",
          }}
        />
      </div>

      {isLoaded && (
        <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Controls</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
            <div>Arrow Keys → D-Pad</div>
            <div>Z → A Button</div>
            <div>X → B Button</div>
            <div>Enter → Start</div>
            <div>Space → Select</div>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
          >
            Reset / Load New ROM
          </button>
        </div>
      )}
    </div>
  )
}
