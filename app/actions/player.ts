import type { Address } from "viem"

import { getPlayerKey } from "@/components/Emulator/internals"
import { redis } from "@/lib/redis"

export type RedisUserData = {
  lastUpdated: number
  /** Stored in 6 decimals 1 -> 1000000 */
  totalPoints: number
  totalTimePlayed: number
}

export const getPlayerData = async (address: Address) => {
  return await redis.hgetall<RedisUserData>(getPlayerKey(address))
}

export const setPlayerData = async (address: Address, data: RedisUserData) => {
  return await redis.hset(getPlayerKey(address), data)
}
