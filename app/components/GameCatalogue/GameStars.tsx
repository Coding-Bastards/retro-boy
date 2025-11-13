import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"
import { cn } from "@/lib/utils"

interface GameStarsProps {
  likes: number
  dislikes: number
  className?: string
}

export default function GameStars({
  likes,
  dislikes,
  className,
}: GameStarsProps) {
  const total = likes + dislikes
  const rating = total > 0 ? (likes / total) * 5 : 0

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
        return <StarIcon key={i} />
      })}
    </div>
  )
}
