import type { Address } from "viem"
import useSWR from "swr"

import { useWorldAuth } from "@radish-la/world-auth"
import { clientWorldchain } from "@/lib/world"
import { jsonify } from "@/lib/utils"

import { ADDRESS_GAME_REGISTRY } from "@/lib/constants"
import { ABI_REGISTRY } from "@/lib/abi"

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
  const { data: totalUniquePlayers = 0 } = useSWR(
    `unique-players`,
    async () => {
      const uniquePlayers = await clientWorldchain.readContract({
        abi: ABI_REGISTRY,
        functionName: "getUniqueUsersCount",
        address: ADDRESS_GAME_REGISTRY,
      })

      return Number(uniquePlayers)
    }
  )

  const { data: leaderboard = [] } = useSWR(
    `leaderboard.top.${totalUniquePlayers}`,
    async () => {
      return await jsonify<Array<LeaderboardData>>(fetch(`/api/leaderboard`))
    },
    {
      keepPreviousData: true,
    }
  )

  return {
    totalUniquePlayers,
    leaderboard,
  }
}
