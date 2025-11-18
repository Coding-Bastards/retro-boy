"use server"

import type { Address } from "viem"
import { redis } from "@/lib/redis"
import { parseUSDC } from "@/app/lib/usdc"

import { getPlayerKey, KEY_LEADERBOARD } from "./internals"

export async function updatePlayerData(
  address: Address,
  points: number,
  timePlayed: number
) {
  try {
    // 1RBC is formatted to 6 decimal places (easier for redis than floats)
    const formattedPoints = Number(parseUSDC(points))

    await redis.zadd(KEY_LEADERBOARD, {
      score: formattedPoints,
      member: address,
    })

    // Store additional player data (for profile view)
    await redis.hset(getPlayerKey(address), {
      lastUpdated: Date.now(),
      totalPoints: formattedPoints,
      totalTimePlayed: timePlayed,
    })
  } catch (error) {
    console.error({ error })
  }
}
