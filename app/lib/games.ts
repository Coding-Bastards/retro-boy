import { useMemo } from "react"
import type { Address } from "viem"

export interface Game {
  collectionId: Address
  title: string
  playTime: string
  stars: number
  rom?: string
  cover: string
}

const MOCK_GAMES: Game[] = [
  {
    collectionId: "0x1234567890123456789012345678901234567890",
    title: "Tobu Tobu Girl DX",
    playTime: "2h 30m",
    stars: 5,
    rom: "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/game.gb",
    cover:
      "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/cover.png",
  },
  {
    collectionId: "0x12c4567890123456789012345678901234567890",
    title: "Tobu Tobu Girl DX",
    playTime: "2h 30m",
    stars: 5,
    rom: "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/game.gb",
    cover:
      "https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/cover.png",
  },
  {
    collectionId: "0x2234567890123456789012345678901234567890",
    title: "Adventure Quest",
    playTime: "5h 15m",
    stars: 4,
    cover: "/game-covers/adventure.png",
  },
]

export const useAllGames = () => {
  return MOCK_GAMES
}

export const useOwnedGames = (ownerAddress?: Address) => {
  // TODO: Add real implementation to fetch owned games from
  // the Game Registry contract
  const games = useMemo(() => {
    // Temporary random filter to simulate owned games
    return MOCK_GAMES.filter(() => Math.random() > 0.5)
  }, [ownerAddress])

  return {
    games,
    isEmpty: games.length === 0,
  }
}
