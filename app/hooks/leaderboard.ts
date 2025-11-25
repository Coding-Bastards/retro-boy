import type { Address } from "viem"
import { jsonify } from "@/lib/utils"

import useSWR from "swr"
import { useWorldAuth } from "@radish-la/world-auth"

export type LeaderboardData = {
  address: Address
  position: number | null
  points: number
  timePlayed: number
}

export const useAccountLeaderboardData = () => {
  const { address } = useWorldAuth()

  const { data = null } = useSWR(
    address ? `leaderboard.data.${address}` : null,
    async () => {
      if (!address) return null
      return await jsonify<LeaderboardData>(
        fetch(`/api/leaderboard/${address}`)
      )
    }
  )

  return {
    data,
  }
}

export const useLeaderboard = () => {
  const { data: leaderboard = [] } = useSWR(`leaderboard.top`, async () => {
    return await jsonify<Array<LeaderboardData>>(fetch(`/api/leaderboard`))
  })

  return {
    leaderboard,
  }
}
