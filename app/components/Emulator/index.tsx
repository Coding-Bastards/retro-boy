"use client"

import { useEffect, useRef, useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"

import { useAtomTimePlayed } from "@/lib/store"
import { calculatePointsMultiplier, useAccountPoints } from "@/hooks/points"
import { useEmulator } from "@/lib/EmulatorContext"

import MechanicalButton from "@/components/MechanicalButton"

import Screen from "./Screen"
import JoyPad from "./JoyPad"
import ABGrid from "./ABGrid"

export default function Emulator() {
  const gameStartTimeRef = useRef<number | null>(null)
  const keyPressHistoryRef = useRef<number[]>([])

  const { address } = useWorldAuth()
  const { addPoints } = useAccountPoints()

  // Track current session (from app render) time played (in seconds)
  const [sessionTimePlayed, setSessionTimePlayed] = useState(0)
  const [, setTimePlayed] = useAtomTimePlayed()

  const { currentGame, sendJoyPadEvent } = useEmulator()

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

    // Get last key pressed from history
    const lastKeyPressed =
      keyPressHistoryRef.current[keyPressHistoryRef.current.length - 1]

    // Add current key to history (MAX: 20)
    keyPressHistoryRef.current = [
      ...keyPressHistoryRef.current.slice(-19),
      joyPadCode,
    ]

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

      // Update current session time played
      const activityWindowInSeconds = Math.floor(timeDelta / 1000)
      setSessionTimePlayed((prev) => prev + activityWindowInSeconds)

      // Update global time played
      setTimePlayed((prev) => {
        const playerTime = prev?.[gameId]?.[address] || 0
        return {
          ...prev,
          [gameId]: {
            ...prev[gameId],
            // Increment previous time played by seconds
            [address]: playerTime + activityWindowInSeconds,
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

  useEffect(() => {
    // Random timeout between 1.1s and 6.6s
    const TIMEOUT = 1111 + Math.random() * 5555

    const timer = setTimeout(() => {
      // Check accumulated points earned at this point
      const multiplier = calculatePointsMultiplier(keyPressHistoryRef.current)
      const points = sessionTimePlayed * multiplier // 1RBC = 1s of "playtime"
      if (points > 0) addPoints(points)

      // Reset session time played
      // And keys pressed for next session
      setSessionTimePlayed(0)
      keyPressHistoryRef.current = []
    }, TIMEOUT)

    return () => clearTimeout(timer)
  }, [sessionTimePlayed])

  return (
    <div className="flex flex-col h-full">
      <Screen />

      {/* Controls */}
      <div className="w-full relative z-1 -mt-6 pt-10">
        <div className="flex justify-between items-center">
          <JoyPad
            stop={() => releaseAllDirections()}
            move={handleJoystickMove}
          />
          <ABGrid onKeyDown={sendKeyDownEvent} onKeyUp={handleButtonRelease} />
        </div>

        {/* Start/Select */}
        <div className="flex justify-center gap-4 mt-14">
          <MechanicalButton
            className="h-6"
            onTapStart={() => sendKeyDownEvent(6)}
            onTapEnd={() => handleButtonRelease(6)}
            variant="pill"
          >
            SELECT
          </MechanicalButton>
          <MechanicalButton
            className="h-6"
            onTapStart={() => sendKeyDownEvent(7)}
            onTapEnd={() => handleButtonRelease(7)}
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
