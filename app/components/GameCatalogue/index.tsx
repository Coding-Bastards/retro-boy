"use client"

import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import Image from "next/image"

import { useOwnedGames, type Game } from "@/app/lib/games"
import { useAtomIsCatalogueOpen } from "@/app/lib/store"
import { cn } from "@/app/lib/utils"
import { useEmulator } from "@/app/lib/EmulatorContext"

import Button from "@/app/components/Button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer"
import GameStars from "./GameStars"

import { BiSolidInvader } from "react-icons/bi"

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
          src={game.cover}
        />
      </figure>

      {/* Game Info */}
      <div className="flex p-6 flex-col text-left">
        <h3 className="text-white font-black line-clamp-1">{game.title}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{game.playTime}</span>
          <GameStars likes={game.likes || 0} dislikes={game.dislikes || 0} />
        </div>
      </div>
    </button>
  )
}

export default function GameCatalogue({ onSelectGame }: GameCatalogueProps) {
  const [open, setOpen] = useAtomIsCatalogueOpen()
  const { games: ownedGames, isEmpty } = useOwnedGames()
  const { loadGame, currentGame } = useEmulator()
  const isSingleGameOwned = ownedGames.length === 1

  const FIRST_GAME_ID = ownedGames[0]?.collectionId || null
  const [centeredGameId, setCenteredGameId] = useState<string | null>(
    FIRST_GAME_ID
  )

  useEffect(() => {
    if (open) {
      // Reset centered game to first game when opening
      setCenteredGameId(FIRST_GAME_ID)
    }
  }, [open])

  useEffect(() => {
    // Wait for drawer animation to complete
    const timer = setTimeout(() => {
      const container = document.getElementById("game-container")
      const cards = Array.from(
        container?.querySelectorAll("[data-game-id]") || []
      )

      if (!container) return

      const observer = new IntersectionObserver(
        (entries) => {
          let maxRatio = 0
          let mostVisibleId: string | null = null

          entries.forEach((entry) => {
            if (entry.intersectionRatio > maxRatio) {
              maxRatio = entry.intersectionRatio
              const gameId = entry.target.getAttribute("data-game-id")
              if (gameId) mostVisibleId = gameId
            }
          })

          if (mostVisibleId) setCenteredGameId(mostVisibleId)
        },
        {
          root: container,
          threshold: [0, 0.55, 0.8],
        }
      )

      cards.forEach((e) => observer.observe(e))

      return () => observer.disconnect()
    }, 300)

    return () => clearTimeout(timer)
  }, [open])

  const isActiveGameCentered = currentGame?.gameCollectionId === centeredGameId

  const buttonLabel = isEmpty
    ? "GAME MARKET"
    : isActiveGameCentered
    ? "CONTINUE PLAYING"
    : "PLAY NOW"

  const handleButtonClick = () => {
    // Close the catalogue drawer
    setOpen(false)

    // Early exit to continue playing current game
    if (isActiveGameCentered) return

    if (isEmpty) {
      // Show get-games market state
      // if Empty
      return setTimeout(
        () => document.getElementById("market-button")?.click(),
        200
      )
    }

    if (centeredGameId) {
      const game = ownedGames.find((g) => g.collectionId === centeredGameId)
      // Load the game directly
      if (game?.rom) loadGame(game.rom, game.collectionId)
    }
  }

  return (
    <Drawer modal={false} open={open} onOpenChange={setOpen}>
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
          <div
            id="game-container"
            className="overflow-x-auto shrink-0 px-4 pb-6 pt-2 snap-x snap-mandatory"
          >
            <div className="flex gap-4">
              {ownedGames.map((game) => (
                <GameCard
                  key={`game-${game.collectionId}`}
                  game={game}
                  onSelect={() => onSelectGame(game.collectionId)}
                  className={
                    isSingleGameOwned ? "" : "max-w-[calc(100%-2.5rem)]"
                  }
                />
              ))}

              {isSingleGameOwned ? null : <div className="w-2 shrink-0" />}
            </div>
          </div>
        )}

        <div className="grow" />

        <div className="px-4 pt-1 pb-6">
          <Button onClick={handleButtonClick}>{buttonLabel}</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
