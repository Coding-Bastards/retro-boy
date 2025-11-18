import { useWorldAuth } from "@radish-la/world-auth"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const atomPoints = atomWithStorage(
  "rb.user-earned-rbc",
  {} as Record<string, number>
)

export const useAccountPoints = () => {
  const { address } = useWorldAuth()
  const [points, setPoints] = useAtom(atomPoints)

  return {
    points: address ? points[address] : 0,
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
  if (_keysPressed.length <= 0) return 0
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

  // Combine factors: 40% weight, 40% uniqueness, 20% entropy
  const score = avgWeight * 0.4 + uniquenessRatio * 0.4 + entropyRatio * 0.2

  // Map to 10%-70% range
  return 0.1 + score * 0.6
}
