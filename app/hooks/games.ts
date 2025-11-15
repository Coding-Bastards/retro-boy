import { useWorldAuth } from "@radish-la/world-auth"
import { useAllGames, useOwnedGames } from "@/lib/games"

export const useGameStats = (collectionId: string) => {
  // TODO: Fetch real stats
  const { address } = useWorldAuth()

  return {
    gameStats: {
      /** Play time for this specific game */
      playTimeInSeconds: 0,
      /** Raw saved state data */
      lastSavedState: null,
    },
    emulator: {
      /** Total play time across all games */
      playTimeInSeconds: 0,
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
        (current = []) => {
          if (isOwned) return current
          return game ? [...current, game] : current
        },
        {
          revalidate: false,
        }
      )
    },
  }
}
