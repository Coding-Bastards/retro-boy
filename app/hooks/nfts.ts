import useSWR from "swr"
import type { Address } from "viem"
import { useOwnedGames } from "@/lib/games"
import { jsonify } from "@/lib/utils"

export type CollectionWithTokenId = { tokenId: number; collectionId: string }

export const useOwnedTokenIds = (address?: Address) => {
  const { games, isEmpty } = useOwnedGames()
  const { data: tokenIds = [] } = useSWR(
    address ? `owned.ids.${address}.${games.length}` : null,
    async () => {
      if (!address || isEmpty) return []
      console.debug({ address, games })
      return jsonify<CollectionWithTokenId[]>(
        fetch(
          `/api/game/${address}/token-ids?addresses=${games
            .map((g) => g.collectionId)
            .join(",")}`
        )
      )
    }
  )

  return {
    tokenIds,
    findTokenId: (collectionId: string) => {
      return (
        tokenIds.find((t) => t.collectionId === collectionId.toLowerCase())
          ?.tokenId ?? null
      )
    },
  }
}
