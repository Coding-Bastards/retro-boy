import type { Address } from "viem"

export const CANVAS_WIDTH = 160
export const CANVAS_HEIGHT = 144
export const ASPECT_RATIO = `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`

export const KEY_LEADERBOARD = "rb.leaderboard" as const
export const getPlayerKey = (address: Address) => `rb.player.${address}`
