"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react"
import { toast } from "sonner"

interface GameCartridge {
  url: string
  gameCollectionId: string
}

interface EmulatorContextValue {
  currentGame: GameCartridge | null
  isLoading: boolean
  loadGame: (remoteURL: string, gameCollectionId: string) => Promise<void>
  isGameLoaded: boolean
  registerCanvas: (
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ) => void
  gameCanvas: HTMLCanvasElement | null
  getGameboyInstance: () => any
  sendJoyPadEvent: (code: number, isPressed: boolean) => void
  getPressedKeys: () => number[]
}

const EmulatorContext = createContext<EmulatorContextValue | null>(null)

export function EmulatorProvider({ children }: PropsWithChildren) {
  const [gameboy, setGameboy] = useState<any>(null)
  const [audioClass, setAudioClass] = useState<any>(null)
  const [currentGame, setCurrentGame] = useState<GameCartridge | null>(null)
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [canvasSize, setCanvasSize] = useState({
    width: 160,
    height: 144,
  })

  const gameboyInstanceRef = useRef<any>(null)
  const animationIdRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Load the GameBoy emulator and audio library
  useEffect(() => {
    const loadEmulator = async () => {
      try {
        // Load our custom audio implementation
        const audioModule = await import("@/lib/audio")
        const GameBoyAudio = audioModule.default || (window as any).GameBoyAudio

        if (GameBoyAudio) {
          console.debug("GameBoy Audio loaded!")
          setAudioClass(() => GameBoyAudio)
        }

        // Load GameBoy emulator
        const module = await import("@/lib/gameboy")
        const GameBoyCore = module.default
        console.debug("GameBoy module:", GameBoyCore, module)
        console.debug("GameBoy emulator loaded")
        setGameboy(() => GameBoyCore)
      } catch (error) {
        console.error("Failed to load GameBoy emulator:", error)
      }
    }

    loadEmulator()
  }, [])

  const loadGame = async (remoteURL: string, gameCollectionId: string) => {
    if (!gameboy || !canvasRef.current) {
      return toast.warning("Setting up emulator. Try again shortly."), void 0
    }

    // Clean up previous instance if exists
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }

    try {
      setIsLoading(true)

      const response = await fetch(remoteURL)
      if (!response.ok) {
        throw new Error("Failed to fetch game")
      }

      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const romData = new Uint8Array(arrayBuffer)

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      // Create ImageData for rendering
      const imageData = ctx.createImageData(canvasSize.width, canvasSize.height)

      const gb = new gameboy(canvas, romData, {
        sound: audioClass,
        volume: 0.7,
        imageSmoothing: true,
        audioBufferMin: 10,
        audioBufferMax: 20,
      })

      // Store instance in ref
      gameboyInstanceRef.current = gb

      // Start the emulator
      gb.start()
      setIsGameLoaded(true)
      setIsLoading(false)

      setCurrentGame({ url: remoteURL, gameCollectionId })

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
            for (let i = 0; i < canvasSize.width * canvasSize.height; i++) {
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
      console.error({ error })
      toast.error("Failed to load. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [])

  const registerCanvas = (canvas: HTMLCanvasElement, w: number, h: number) => {
    canvasRef.current = canvas
    setCanvasSize({ width: w, height: h })
  }

  const getGameboyInstance = () => {
    return gameboyInstanceRef.current
  }

  const getPressedKeys = () => {
    const joyPadValue = gameboyInstanceRef.current?.JoyPad || 0xff
    const pressed = []

    for (let i = 0; i < 8; i++) {
      // Check if bit i is 0 (pressed)
      if ((joyPadValue & (1 << i)) === 0) pressed.push(i)
    }

    return pressed
  }

  const value: EmulatorContextValue = {
    isLoading,
    currentGame,
    get gameCanvas() {
      return canvasRef.current
    },
    loadGame,
    sendJoyPadEvent: (code: number, isPressed: boolean) => {
      gameboyInstanceRef.current?.JoyPadEvent(code, isPressed)
    },
    getPressedKeys,
    isGameLoaded,
    registerCanvas,
    getGameboyInstance,
  }

  return (
    <EmulatorContext.Provider value={value}>
      {children}
    </EmulatorContext.Provider>
  )
}

export function useEmulator() {
  const context = useContext(EmulatorContext)
  if (!context) {
    throw new Error("useEmulator must be used within EmulatorProvider")
  }
  return context
}
