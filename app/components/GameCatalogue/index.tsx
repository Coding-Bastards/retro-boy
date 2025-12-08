"use client"

import { Fragment, PropsWithChildren, useEffect, useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"

import { useOwnedGames } from "@/lib/games"
import { useAtomIsCatalogueOpen } from "@/lib/store"
import { useEmulator } from "@/lib/EmulatorContext"
import { isDevEnv } from "@/lib/env"
import { cn } from "@/lib/utils"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import Button from "@/components/Button"
import { useAppRouter } from "@/lib/routes"

import { PiHandbagSimpleFill } from "react-icons/pi"
import { IoMdArrowForward } from "react-icons/io"
import { RiPokerSpadesFill } from "react-icons/ri"
import GameCard from "./GameCard"

export default function GameCatalogue() {
  const [open, setOpen] = useAtomIsCatalogueOpen()
  const { isConnected, signIn } = useWorldAuth()

  const { pushGamePage, pushMarketPage } = useAppRouter()
  const { games: ownedGames, isEmpty } = useOwnedGames()
  const { loadGame, currentGame } = useEmulator()
  const isSingleGameOwned = ownedGames.length === 1

  const [centeredGameId, setCenteredGameId] = useState<string | null>(null)
  const FIRST_GAME_ID = ownedGames[0]?.collectionId || null

  useEffect(() => {
    if (open) {
      const centeredGameId = currentGame?.gameCollectionId || FIRST_GAME_ID
      setCenteredGameId(centeredGameId)

      if (centeredGameId) {
        return waitForDrawerAnimation(() => {
          document
            .querySelector(`[data-game-id="${centeredGameId}"]`)
            ?.scrollIntoView()
        })
      }
    }
  }, [open, currentGame, FIRST_GAME_ID])

  useEffect(() => {
    waitForDrawerAnimation(() => {
      const cards = Array.from(
        document.querySelectorAll("[data-game-id]") || []
      )

      const observer = new IntersectionObserver(
        (entries) => {
          let bestEntry: IntersectionObserverEntry = {} as any
          let bestScore = -Infinity

          const viewportCenter = window.innerWidth / 2

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return

            const rect = entry.target.getBoundingClientRect()
            const cardCenter = rect.top + rect.height / 2

            // Distance to vertical center
            const distanceToCenter = Math.abs(cardCenter - viewportCenter)

            // Weighted score: high intersection, low distance
            const score = entry.intersectionRatio * 1000 - distanceToCenter
            if (score > bestScore) {
              bestScore = score
              bestEntry = entry
            }
          })

          const gameId = bestEntry?.target?.getAttribute("data-game-id")
          if (gameId) setCenteredGameId(gameId)
        },
        {
          threshold: 0.1,
          rootMargin: "0px -40% 0px -40%", // Horizontal centered
        }
      )

      cards.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    })
  }, [open])

  /** `true` when the emulator game is the active/centered item from the collection list */
  const isEmulatorGameActive = currentGame?.gameCollectionId === centeredGameId

  const handleButtonClick = () => {
    // Close the catalogue drawer
    setOpen(false)

    // Early exit if the emulator game is already active
    if (isEmulatorGameActive) return
    if (centeredGameId) {
      const game = ownedGames.find((g) => g.collectionId === centeredGameId)
      // Load the game directly
      if (game?.rom) loadGame(game.rom, game.collectionId)
    }
  }

  // Force connected state in dev mode
  const isDisconnected = !isDevEnv() && !isConnected

  return (
    <Drawer modal={false} open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md min-h-[calc(85vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader>
          <DrawerTitle
            className={cn(
              (isEmpty || isDisconnected) && "opacity-0",
              "text-white text-center uppercase font-black"
            )}
          >
            GAMES ({ownedGames.length})
          </DrawerTitle>
        </DrawerHeader>

        {isDisconnected ? (
          <DrawerEmptyState
            onActionPress={signIn}
            actionLabel="CONNECT WALLET"
            icon={
              <RiPokerSpadesFill className="text-5xl scale-105 text-white/90" />
            }
          >
            Connect your wallet to access the game library.
          </DrawerEmptyState>
        ) : isEmpty ? (
          <DrawerEmptyState
            onActionPress={pushMarketPage}
            actionLabel={
              <Fragment>
                <span>OPEN MARKET</span>
                <IoMdArrowForward className="text-xl group-active:translate-x-px scale-105" />
              </Fragment>
            }
            icon={<PiHandbagSimpleFill className="text-5xl text-white/90" />}
          >
            Your game library is empty.
            <br />
            Get some games from the Market!
          </DrawerEmptyState>
        ) : (
          <Fragment>
            <div className="overflow-x-auto animate-in fade-in duration-400 shrink-0 px-4 pb-6 pt-2 snap-x snap-mandatory">
              <div className="flex animate-in fade-in duration-350 gap-4">
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

            <div className="grow" />
          </Fragment>
        )}

        <div className="px-4 pt-1 pb-6">
          <Button onClick={handleButtonClick}>
            {isEmpty || isDisconnected || isEmulatorGameActive
              ? "CONTINUE PLAYING"
              : "PLAY NOW"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function DrawerEmptyState({
  onActionPress,
  actionLabel,
  icon,
  children,
}: PropsWithChildren<{
  onActionPress: () => void
  actionLabel: string | React.ReactNode
  icon: React.ReactNode
}>) {
  return (
    <div className="flex grow p-4 gap-4 flex-col items-center justify-end">
      <div className="grow" />

      <figure className="size-24 grid place-items-center rounded-3xl bg-linear-to-bl from-rb-yellow/10 to-rb-yellow/5 border border-rb-yellow/7">
        {icon}
      </figure>

      <p className="mb-6 mt-3 text-sm text-white/60 text-center max-w-72">
        {children}
      </p>

      <div className="grow" />
      <button
        className="border active:scale-98 group rounded-lg bg-linear-to-bl from-white/5 to-white/3 border-white/5 py-4 w-full pl-9 pr-8 gap-4 text-white flex items-center justify-center font-black"
        onClick={onActionPress}
      >
        {actionLabel}
      </button>
    </div>
  )
}

function waitForDrawerAnimation(cb: () => void) {
  const timer = setTimeout(cb, 100)
  return () => clearTimeout(timer)
}
