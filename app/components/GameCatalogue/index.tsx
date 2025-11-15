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

import GameCard from "./GameCard"
import { PiHandbagSimpleFill } from "react-icons/pi"
import Link from "next/link"
import { IoMdArrowForward } from "react-icons/io"
import { useAppRouter } from "@/app/lib/routes"

export default function GameCatalogue() {
  const [open, setOpen] = useAtomIsCatalogueOpen()

  const { pushGamePage } = useAppRouter()
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

  const handleButtonClick = () => {
    // Close the catalogue drawer
    setOpen(false)

    if (centeredGameId) {
      const game = ownedGames.find((g) => g.collectionId === centeredGameId)
      // Load the game directly
      if (game?.rom) loadGame(game.rom, game.collectionId)
      return // Exit early if game is found and loaded
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
          <div className="flex p-5 gap-4 flex-col items-center justify-center">
            <figure className="size-24 text-white/90 grid place-items-center rounded-3xl bg-linear-to-bl from-rb-green/15 to-rb-green/10 border-2 border-rb-green/15">
              <PiHandbagSimpleFill className="text-5xl" />
            </figure>

            <Link
              className="mt-8 text-white inline-flex items-center gap-1.5 font-black"
              href="/?market"
            >
              <span>Open Market</span>
              <IoMdArrowForward className="text-xl" />
            </Link>

            <p className="text-sm text-white/60 text-center max-w-72">
              Your game library is empty.
              <br />
              Get some games from the Market!
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
                  onSelect={() => pushGamePage(game.collectionId)}
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
          <Button onClick={handleButtonClick}>
            {isEmpty || isActiveGameCentered ? "CONTINUE PLAYING" : "PLAY NOW"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
