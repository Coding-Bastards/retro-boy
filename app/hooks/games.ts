import { useWorldAuth } from "@radish-la/world-auth"

export const useGameStats = (gameId: string) => {
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
