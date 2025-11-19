import type { Address } from "viem"

import { getPlayerKey } from "@/components/Emulator/internals"
import { redis } from "@/lib/redis"

export type RedisUserData = {
  lastUpdated: number
  totalPoints: number
  totalTimePlayed: number
}

export const getPlayerData = async (address: Address) => {
  return await redis.hgetall<RedisUserData>(getPlayerKey(address))
}

export const setPlayerData = async (address: Address, data: RedisUserData) => {
  return await redis.hset(getPlayerKey(address), data)
}
