"use server"

import type { Address } from "viem"

import {
  getPlayerData,
  setPlayerData,
  updateLeaderboard,
} from "@/app/actions/player"
import { parseUSDC } from "@/app/lib/usdc"

export async function updatePlayerData(
  address: Address,
  points: number,
  totalTimePlayed: number
) {
  try {
    // 1RBC is formatted to 6 decimal places (easier for redis than floats)
    const totalPoints = Number(parseUSDC(points))
    const currentData = await getPlayerData(address)

    if (Number(currentData?.totalPoints || 0) > totalPoints) {
      // Nothing to update
      return
    }

    await Promise.all([
      // Update leaderboard score
      updateLeaderboard(address, totalPoints),
      // Update player data
      setPlayerData(address, {
        lastUpdated: Date.now(),
        totalTimePlayed,
        totalPoints,
      }),
    ])
  } catch (error) {
    console.error({ error })
  }
}
