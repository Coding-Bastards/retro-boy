import { useMemo } from "react"
import type { Address } from "viem"

export interface Game {
  collectionId: Address
  title: string
  playTime: string
  stars: number
  cover: string
}

const MOCK_GAMES: Game[] = [
  {
    collectionId: "0x1234567890123456789012345678901234567890",
    title: "Tobu Tobu Girl DX",
    playTime: "2h 30m",
    stars: 5,
    cover: "/game-covers/tobutobugirl.png",
  },
  {
    collectionId: "0x2234567890123456789012345678901234567890",
    title: "Adventure Quest",
    playTime: "5h 15m",
    stars: 4,
    cover: "/game-covers/adventure.png",
  },
  {
    collectionId: "0x3234567890123456789012345678901234567890",
    title: "Pixel Racer",
    playTime: "1h 45m",
    stars: 5,
    cover: "/game-covers/racer.png",
  },
  {
    collectionId: "0x4234567890123456789012345678901234567890",
    title: "Retro Legends",
    playTime: "3h 20m",
    stars: 4,
    cover: "/game-covers/legends.png",
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
