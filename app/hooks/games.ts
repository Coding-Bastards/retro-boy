import { useWorldAuth } from "@radish-la/world-auth"
import { useAllGames, useOwnedGames } from "@/lib/games"
import { useAtomTimePlayed } from "@/lib/store"

export const useGameStats = (collectionId?: string) => {
  const [timePlayed] = useAtomTimePlayed()
  const { address } = useWorldAuth()

  const playTimeInSeconds =
    timePlayed?.[collectionId || ""]?.[address || ""] || 0

  const allGamesTime = Object.values(timePlayed).reduce((acc, game) => {
    return acc + (game[address || ""] || 0)
  }, 0)

  return {
    gameStats: {
      /** Play time for this specific game */
      playTimeInSeconds,
      /** Raw saved state data */
      lastSavedState: null,
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
