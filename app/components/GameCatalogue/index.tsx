"use client"

import { useEffect, useState } from "react"

import { useOwnedGames } from "@/lib/games"
import { useAtomIsCatalogueOpen } from "@/lib/store"
import { useEmulator } from "@/lib/EmulatorContext"
import { cn } from "@/lib/utils"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import Button from "@/components/Button"

import { BiSolidInvader } from "react-icons/bi"
import GameCard from "./GameCard"

export default function GameCatalogue({
  onSelectGame,
}: {
  onSelectGame: (collectionId: string) => void
}) {
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
                  game={game}
                  onSelect={() => onSelectGame(game.collectionId)}
                  key={`game-${game.collectionId}`}
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
