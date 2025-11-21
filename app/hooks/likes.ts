"use client"

import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { jsonify } from "@/lib/utils"
import { useAllGames } from "@/lib/games"
import { useWorldAuth } from "@radish-la/world-auth"

const atomLikedCollections = atomWithStorage<string[]>(
  "rb.liked-collections",
  []
)

const atomDislikedCollections = atomWithStorage<string[]>(
  "rb.disliked-collections",
  []
)

export const useLikesEngine = (collectionId: string) => {
  const { isConnected } = useWorldAuth()
  const [likedCollections, setLikedCollections] = useAtom(atomLikedCollections)
  const [dislikedCollections, setDislikedCollections] = useAtom(
    atomDislikedCollections
  )

  const isSelfLiked = likedCollections.includes(collectionId)
  const isSelfDisliked = dislikedCollections.includes(collectionId)
  const isSelfInteracted = isSelfLiked || isSelfDisliked

  const { mutate } = useAllGames()

  const vote = async (action: "like" | "dislike") => {
    // Early exit if not connected
    // Or already interacted
    if (!isConnected) return
    if (isSelfInteracted) return

    const isLike = action === "like"
    const keyProp = isLike ? "likes" : "dislikes"

    // Optimistic update (like/dislike count)
    mutate(
      (games = []) =>
        games.map((game) =>
          game.collectionId === collectionId
            ? // Increment likes or dislikes for this game
              { ...game, [keyProp]: (game[keyProp] || 0) + 1 }
            : game
        ),
      { revalidate: false }
    )

    if (isLike) setLikedCollections((current) => [...current, collectionId])
    else setDislikedCollections((current) => [...current, collectionId])

    // Backend sync
    jsonify<{ ok: boolean }>(
      fetch(`/api/game/${collectionId}/stats?action=${action}`, {
        method: "POST",
      })
    )
  }

  return {
    /** `true` if user liked or disliked the game */
    isSelfInteracted,
    isSelfDisliked,
    isSelfLiked,
    vote,
  }
}
