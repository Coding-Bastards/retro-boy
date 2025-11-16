"use client"

import type { Game } from "@/lib/games"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { useGameStats } from "@/hooks/games"
import { formatTimePlayed } from "@/lib/date"

import GameStars from "./GameStars"

import asset_default_cover from "@/public/default-cover.png"

export default function GameCard({
  game,
  onSelect,
  className,
}: {
  game: Game
  onSelect: () => void
  className?: string
}) {
  const { gameStats } = useGameStats(game.collectionId)

  return (
    <button
      data-game-id={game.collectionId}
      onClick={onSelect}
      className={cn(
        "flex rounded-b-2xl active:scale-98 overflow-hidden shrink-0 w-full flex-col gap-2 bg-linear-to-b from-rb-dark/0 to-rb-dark snap-center",
        className
      )}
    >
      {/* Cover Image */}
      <figure className="rounded-4xl w-full overflow-hidden">
        <Image
          className="w-full aspect-square"
          placeholder="blur"
          blurDataURL={asset_default_cover.src}
          onError={(e) => {
            // Fallback to default cover image if loading fails
            e.currentTarget.src = asset_default_cover.src
          }}
          width={800}
          height={800}
          alt=""
          src={game?.cover || asset_default_cover.src}
        />
      </figure>

      {/* Game Info */}
      <div className="flex p-6 flex-col text-left">
        <h3 className="text-white font-black line-clamp-1">{game.title}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">
            {gameStats.playTimeInSeconds
              ? formatTimePlayed(gameStats.playTimeInSeconds)
              : "Never played"}
          </span>
          <GameStars likes={game.likes || 0} dislikes={game.dislikes || 0} />
        </div>
      </div>
    </button>
  )
}
