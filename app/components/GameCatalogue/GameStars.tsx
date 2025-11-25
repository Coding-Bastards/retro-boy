import type { TLikes } from "@/@types/game-nft"
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"
import { cn } from "@/lib/utils"

export default function GameStars({
  likes = 0,
  dislikes = 0,
  className,
}: Partial<TLikes> & { className?: string }) {
  const total = likes + dislikes
  const rating = total > 0 ? (likes / total) * 5 : 5 // Default to 5 stars

  return (
    <div className={cn("flex gap-0.5 text-yellow-400", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const StarIcon =
          rating >= starValue
            ? FaStar
            : rating >= starValue - 0.5
            ? FaStarHalfAlt
            : FaRegStar
        return <StarIcon key={`stars-${i}`} />
      })}
    </div>
  )
}
