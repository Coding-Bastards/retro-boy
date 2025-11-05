"use client"

import { useEffect } from "react"
import { useAtom, useSetAtom } from "jotai"
import Image from "next/image"
import { useDrag } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { useOwnedGames, type Game } from "@/app/lib/games"
import { catalogueOpenAtom } from "@/app/lib/store"
import { cn } from "@/app/lib/utils"
import Button from "./Button"

import { BiSolidInvader } from "react-icons/bi"
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"

import asset_default_cover from "@/public/default-cover.png"

interface GameCatalogueProps {
  onSelectGame: (collectionId: string) => void
}

function GameCard({
  game,
  onSelect,
  className,
}: {
  game: Game
  onSelect: () => void
  className?: string
}) {
  const setOpen = useSetAtom(catalogueOpenAtom)

  const [, drag, preview] = useDrag(() => ({
    type: "game",
    item: { game },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  }))

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const handleDragStart = () => {
    console.log("Drag started:", game.title)
    setOpen(false)
  }

  return (
    <button
      ref={drag as any}
      draggable
      onDragStart={handleDragStart}
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
          src={game.cover}
        />
      </figure>

      {/* Game Info */}
      <div className="flex p-6 flex-col text-left">
        <h3 className="text-white font-bold line-clamp-1">{game.title}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{game.playTime}</span>
          <div className="flex gap-0.5 text-yellow-400">
            {Array.from({ length: 5 }, (_, i) => {
              const starValue = i + 1
              const StarIcon =
                game.stars >= starValue
                  ? FaStar
                  : game.stars >= starValue - 0.5
                  ? FaStarHalfAlt
                  : FaRegStar
              return <StarIcon key={`rate-${game.collectionId}-${i}`} />
            })}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function GameCatalogue({ onSelectGame }: GameCatalogueProps) {
  const [open, setOpen] = useAtom(catalogueOpenAtom)
  const { games: ownedGames, isEmpty } = useOwnedGames()
  const isSingleGameOwned = ownedGames.length === 1

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md min-h-[calc(85vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader>
          <DrawerTitle
            className={cn(
              isEmpty && "hidden",
              "text-white text-center uppercase font-black"
            )}
          >
            GAMES ({ownedGames.length})
          </DrawerTitle>
        </DrawerHeader>

        {isEmpty ? (
          <div className="flex p-6 gap-4 flex-col text-white/60 items-center justify-center">
            <BiSolidInvader className="text-5xl" />
            <p className="text-sm text-center max-w-xs">
              Your game library is empty. Get some games from the Market!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shrink-0 px-4 pb-6 pt-2 snap-x snap-mandatory">
            <div className="flex gap-4">
              {ownedGames.map((game) => (
                <GameCard
                  key={`game-${game.collectionId}`}
                  onSelect={() => onSelectGame(game.collectionId)}
                  className={
                    isSingleGameOwned ? "" : "max-w-[calc(100%-2.5rem)]"
                  }
                  game={game}
                />
              ))}

              {isSingleGameOwned ? null : <div className="w-2 shrink-0" />}
            </div>
          </div>
        )}

        <div className="grow" />

        <div className="px-4 pt-1 pb-6">
          <Button
            onClick={() => {
              setOpen(false)
              if (isEmpty) {
                setTimeout(
                  () => document.getElementById("market-button")?.click(),
                  200 // Wait for stack to clear
                )
              }
            }}
          >
            {isEmpty ? "GAME MARKET" : "CONTINUE PLAYING"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
