import type { Address } from "viem"
import type { LeaderboardData } from "@/hooks/leaderboard"

import { redis } from "@/lib/redis"
import { KEY_LEADERBOARD } from "@/app/components/Emulator/internals"
import { getPlayerData } from "@/app/actions/player"
import { staledResponse } from "@/app/lib/server"

type Params = { params: Promise<{ address: string }> }

export const revalidate = 600 // Cache for 10 minutes

export async function GET(_: Request, { params }: Params) {
  const { address } = await params

  // Get player's rank in leaderboard
  const rank = await redis.zrevrank(KEY_LEADERBOARD, address)

  // Get player's additional data
  const playerData = await getPlayerData(address as Address)

  return staledResponse(
    {
      address: address as Address,
      position: rank === null ? null : rank + 1,
      points: playerData?.totalPoints || 0,
      timePlayed: playerData?.totalTimePlayed || 0,
    } satisfies LeaderboardData,
    {
      timeInSeconds: revalidate,
    }
  )
}
