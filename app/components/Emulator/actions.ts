"use server"

import type { Address } from "viem"

import { redis } from "@/lib/redis"
import { setPlayerData } from "@/app/actions/player"
import { parseUSDC } from "@/app/lib/usdc"
import { KEY_LEADERBOARD } from "./internals"

export async function updatePlayerData(
  address: Address,
  points: number,
  totalTimePlayed: number
) {
  try {
    // 1RBC is formatted to 6 decimal places (easier for redis than floats)
    const totalPoints = Number(parseUSDC(points))

    await Promise.all([
      // Update leaderboard score
      redis.zadd(KEY_LEADERBOARD, {
        score: totalPoints,
        member: address,
      }),
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
