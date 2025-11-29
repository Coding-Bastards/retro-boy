import type { Address } from "viem"
import { useWorldAuth } from "@radish-la/world-auth"
import { useAllGames, useOwnedGames } from "@/lib/games"
import { useAtomTimePlayed } from "@/lib/store"

export const useTimePlayed = (address?: Address) => {
  const [timePlayed] = useAtomTimePlayed()

  /** Return the time played in seconds */
  const getTimePlayed = (collectionId: string) => {
    return timePlayed?.[collectionId]?.[address || ""] || 0
  }

  return { getTimePlayed, allTimePlayedRecords: timePlayed }
}

export const useGameStats = (collectionId?: string) => {
  const { address } = useWorldAuth()
  const { getTimePlayed, allTimePlayedRecords } = useTimePlayed(address)

  const allGamesTime = Object.values(allTimePlayedRecords).reduce(
    (acc, game) => acc + (game[address || ""] || 0),
    0
  )

  return {
    gameStats: {
      /** Play time for this specific game */
      playTimeInSeconds: getTimePlayed(collectionId || ""),
    },
    emulator: {
      /** Total play time across all games */
      playTimeInSeconds: allGamesTime,
    },
  }
}

export const useGame = (collectionId: string) => {
  const { games: allGames } = useAllGames()
  const { games: ownedGames, mutate: mutateOwnedGames } = useOwnedGames()

  const game = allGames.find((g) => g.collectionId === collectionId) || null
  const isOwned = ownedGames.some((g) => g.collectionId === collectionId)

  return {
    game,
    isOwned,
    markAsOwned: () => {
      mutateOwnedGames(
        (currentOwned = []) => {
          return game && !isOwned
            ? [
                ...currentOwned,
                // Append newly owned game (assume 1 copy)
                {
                  ...game,
                  ownedCount: BigInt(1),
                },
              ]
            : currentOwned
        },
        {
          revalidate: false,
        }
      )
    },
  }
}
