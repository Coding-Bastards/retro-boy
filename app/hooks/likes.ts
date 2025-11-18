import type { TLikes } from "@/@types/game-nft"

import useSWR from "swr"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { jsonify } from "@/lib/utils"
import { useWorldAuth } from "@radish-la/world-auth"

const atomLikedCollections = atomWithStorage<string[]>(
  "rb.liked-collections",
  []
)

const atomDislikedCollections = atomWithStorage<string[]>(
  "rb.disliked-collections",
  []
)

export const useLikesEngine = (gameId: string) => {
  const { isConnected } = useWorldAuth()
  const [likedCollections, setLikedCollections] = useAtom(atomLikedCollections)
  const [dislikedCollections, setDislikedCollections] = useAtom(
    atomDislikedCollections
  )

  const isSelfLiked = likedCollections.includes(gameId)
  const isSelfDisliked = dislikedCollections.includes(gameId)
  const isSelfInteracted = isSelfLiked || isSelfDisliked

  const { data = null, mutate } = useSWR(`like-data.${gameId}`, async () => {
    if (!gameId) return null
    return jsonify<TLikes>(fetch(`/api/game/${gameId}/stats`))
  })

  const vote = async (action: "like" | "dislike") => {
    // Early exit if not connected
    // Or already interacted
    if (!isConnected) return
    if (isSelfInteracted) return

    const isLike = action === "like"
    const keyProp = isLike ? "likes" : "dislikes"

    // Optimistic update
    mutate(
      (current: any = {}) => ({
        ...current,
        [keyProp]: (current[keyProp] || 0) + 1,
      }),
      false
    )

    if (isLike) setLikedCollections((current) => [...current, gameId])
    else setDislikedCollections((current) => [...current, gameId])

    // Backend call
    jsonify<{ ok: boolean }>(
      fetch(`/api/game/${gameId}/stats?action=${action}`, {
        method: "POST",
      })
    )
  }

  return {
    likes: data?.likes || 0,
    dislikes: data?.dislikes || 0,
    /** `true` if user liked or disliked the game */
    isSelfInteracted,
    isSelfDisliked,
    isSelfLiked,
    vote,
  }
}
