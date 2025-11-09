import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"

interface GameStarsProps {
  likes: number
  dislikes: number
}

export default function GameStars({ likes, dislikes }: GameStarsProps) {
  const total = likes + dislikes
  const rating = total > 0 ? (likes / total) * 5 : 0

  return (
    <div className="flex gap-0.5 text-yellow-400">
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
