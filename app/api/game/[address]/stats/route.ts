import type { TLikes } from "@/@types/game-nft"
import { redis } from "@/lib/redis"

type Params = { params: Promise<{ address: string }> }

export const revalidate = 60 // Cache for 60 seconds

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

  return Response.json({
    likes,
    dislikes,
  })
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
