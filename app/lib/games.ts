import { useMemo } from "react"
import type { Address } from "viem"

export interface Game {
  collectionId: Address
  title: string
  playTime: string
  stars: number
  rom?: string
  cover: string
  nftImage?: string
  description?: string
  totalOwners?: number
  likes?: number
  dislikes?: number
  gallery?: string[]
}

const MOCK_GAME = {
  collectionId: "0x1234567890123456789012345678901234567890",
  title: "Tobu Tobu Girl DX",
  playTime: "2h 30m",
  stars: 5,
  rom: "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/game.gb",
  cover: "https://img.itch.zone/aW1nLzI2Mjg1MjcucG5n/original/8xica8.png",
  nftImage:
    "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/cover.png",
  description:
    "A cute platformer where you control Tobu, a girl who can double jump and glide through colorful levels. Collect stars, avoid obstacles, and reach the goal in this charming adventure.",
  totalOwners: 1247,
  likes: 892,
  dislikes: 34,
  gallery: ["https://tangramgames.dk/tobutobugirldx/img/bounce.gif"],
} satisfies Game

const MOCK_GAMES = [MOCK_GAME, { ...MOCK_GAME, collectionId: "0x0" as Address }]

export const useAllGames = () => {
  return MOCK_GAMES
}

export const useOwnedGames = (ownerAddress?: Address) => {
  // TODO: Add real implementation to fetch owned games from
  // the Game Registry contract
  const games = useMemo(() => {
    // Temporary random filter to simulate owned games
    return MOCK_GAMES //.filter(() => Math.random() > 0.5)
  }, [ownerAddress])

  return {
    games,
    isEmpty: games.length === 0,
  }
}
