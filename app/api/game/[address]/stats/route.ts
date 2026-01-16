import type { TLikes } from "@/@types/game-nft"
import { staledResponse } from "@/app/lib/server"
import { redis } from "@/lib/redis"

type Params = { params: Promise<{ address: string }> }

// Cache for some time since we do optimistic update in the client, no need to be real-time
export const revalidate = 180 // Cache for 3 minutes
export async function GET(_: Request, { params }: Params) {
  const { address } = await params

  let likes = 0
  let dislikes = 0

  try {
    const stats = await redis.hgetall<TLikes>(`game:${address}`)

    likes = stats?.likes || 0
    dislikes = stats?.dislikes || 0
  } catch (error) {
    console.error({ error })
  }

  return staledResponse(
    {
      likes,
      dislikes,
    },
    {
      timeInSeconds: revalidate,
    }
  )
}

export async function POST(request: Request, { params }: Params) {
  const { address } = await params
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    if (!["like", "dislike"].includes(action || "")) {
      throw new Error("Invalid action")
    }

    const field = action === "like" ? "likes" : "dislikes"
    await redis.hincrby(`game:${address}`, field, 1)
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: (error as Error).message,
      },
      {
        status: 400,
      }
    )
  }

  return Response.json({
    ok: true,
    error: null,
  })
}
