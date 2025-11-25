import type { Address } from "viem"

export const KEY_LEADERBOARD = "rb.leaderboard" as const

export const getPlayerKey = (address: Address) => `rb.player.${address}`
