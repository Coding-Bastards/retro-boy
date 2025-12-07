import useSWRImmutable from "swr/immutable"
import { useWorldAuth } from "@radish-la/world-auth"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { getInvites } from "@/app/actions/invites"
import { updatePlayerData } from "@/components/Emulator/actions"
import { useEmulator } from "@/lib/EmulatorContext"
import { useGameStats } from "./games"
import { DEV_ADDRESS } from "../lib/constants"

const atomPoints = atomWithStorage(
  "rb.user-earned-rbc",
  {} as Record<string, number>
)

export const useAccountPoints = () => {
  const { address } = useWorldAuth()
  const [pointsBank, setPoints] = useAtom(atomPoints)

  const { data: earnedInvitePoints = 0 } = useSWRImmutable(
    address ? `user.invites.points.${address}` : null,
    async () => {
      if (!address) return 0
      const { points } = await getInvites(address)
      return points
    }
  )

  const points = address ? pointsBank[address] + earnedInvitePoints : 0
  const { currentGame } = useEmulator()
  const { emulator } = useGameStats(currentGame?.gameCollectionId)

  async function syncPoints() {
    // Only update when connected and have points to sync
    if (address && points > 0) {
      console.debug("Updating user data...")
      await updatePlayerData(address, points, emulator.playTimeInSeconds)
    }
  }

  return {
    points,
    /** Sync points with backend */
    syncPoints,
    addPoints: (newPoints: number) => {
      if (address) {
        setPoints((current) => ({
          ...current,
          [address]: (current[address] || 0) + newPoints,
        }))
      }
    },
  }
}

export const calculatePointsMultiplier = (_keysPressed: number[]) => {
  // Early exit if insufficient data
  if (_keysPressed.length <= 2) return 0
  const keysPressed = _keysPressed.slice(-20) // Take last 20 items

  // Key weights: Movement (0-3) = 0.25, B (5) = 0.5, A (4) = 0.5, SELECT/START (6,7) = 0
  const keyWeights: Record<number, number> = {
    0: 0.125, // RIGHT
    1: 0.125, // LEFT
    2: 0.125, // UP
    3: 0.125, // DOWN
    4: 0.25, // A
    5: 0.25, // B
    6: 0, // SELECT
    7: 0, // START
  }

  // Calculate weighted uniqueness
  const weightedKeys = keysPressed.map((key) => keyWeights[key] || 0)
  const totalWeight = weightedKeys.reduce((sum, w) => sum + w, 0)
  const avgWeight = totalWeight / keysPressed.length

  // Calculate uniqueness (distinct keys used)
  const uniqueKeys = new Set(keysPressed.filter((k) => keyWeights[k] > 0)).size
  const uniquenessRatio = uniqueKeys / 6 // Max 6 valuable keys (0-5)

  // Calculate entropy (randomness of sequence)
  const keyCounts: Record<number, number> = {}
  keysPressed.forEach((key) => {
    keyCounts[key] = (keyCounts[key] || 0) + 1
  })

  const entropy = Object.values(keyCounts).reduce((h, count) => {
    const p = count / keysPressed.length
    return h - p * Math.log2(p)
  }, 0)

  const maxEntropy = Math.log2(keysPressed.length) // Maximum possible entropy
  const entropyRatio = entropy / maxEntropy

  // Combine factors: 40% weight, 45% uniqueness, 15% entropy
  const score = avgWeight * 0.4 + uniquenessRatio * 0.45 + entropyRatio * 0.15

  // Map to 3%-49% range
  return 0.03 + score * 0.46
}
