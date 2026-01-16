import type { Address } from "blo"
import type { RedisUserData } from "@/app/actions/player"
import type { LeaderboardData } from "@/app/hooks/leaderboard"

import { unstable_cache } from "next/cache"
import { getPlayerKey, KEY_LEADERBOARD } from "@/components/Emulator/internals"
import { redis } from "@/app/lib/redis"
import { staledResponse } from "@/app/lib/server"

export const revalidate = 1_200 // Cache for 20 minutes

const getLeaderBoard = unstable_cache(
  async () => {
    const leaderboard = await redis.zrange(KEY_LEADERBOARD, 0, 9, {
      rev: true,
      withScores: true,
    })

    // Extract addresses first
    const addresses: Address[] = []
    for (let i = 0; i < leaderboard.length; i += 2) {
      addresses.push(leaderboard[i] as Address)
    }

    // Batch fetch player data using pipeline
    const pipeline = redis.pipeline()
    addresses.forEach((address) => {
      pipeline.hget(
        getPlayerKey(address),
        "totalTimePlayed" as keyof RedisUserData
      )
    })

    const timePlayedResults = await pipeline.exec()

    // Combine data
    const players = addresses.map(
      (address, index) =>
        ({
          address,
          position: index + 1,
          points: Number(leaderboard[index * 2 + 1]),
          timePlayed: Number(timePlayedResults[index]) || 0,
        } satisfies LeaderboardData)
    )

    return players
  },
  ["rb-leaderboard"],
  {
    revalidate,
  }
)

export async function GET() {
  try {
    const leaderboard = await getLeaderBoard()
    return staledResponse(leaderboard, {
      timeInSeconds: revalidate,
    })
  } catch (_) {}

  return staledResponse(
    {
      error: "Unable to fetch leaderboard data",
    },
    {
      statusCode: 500,
    }
  )
}
