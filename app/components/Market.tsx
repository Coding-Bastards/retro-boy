"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { IoArrowBack, IoChevronDownSharp } from "react-icons/io5"
import { MdPerson, MdViewModule, MdViewList } from "react-icons/md"
import { useAllGames, useOwnedGames } from "@/app/lib/games"
import { localizeNumber } from "@/app/lib/numbers"
import { cn } from "@/app/lib/utils"
import WalletConnect from "./WalletConnect"
import GameStars from "./GameCatalogue/GameStars"
import {
  TfiLayoutColumn2Alt,
  TfiLayoutColumn3Alt,
  TfiLayoutGrid2Alt,
} from "react-icons/tfi"

type SortBy = "owners" | "score" | "price"
type ViewMode = "grid" | "list"

function MarketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("market") === "open"
  const allGames = useAllGames()
  const { games: ownedGames } = useOwnedGames()

  const [sortBy, setSortBy] = useState<SortBy>("score")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const handleClose = () => {
    router.back()
  }

  if (!isOpen) return null

  // Sort games
  const availableGames = allGames.sort((a, b) => {
    switch (sortBy) {
      case "owners":
        return (b.totalOwners || 0) - (a.totalOwners || 0)
      case "score":
        const scoreA = (a.likes || 0) - (a.dislikes || 0)
        const scoreB = (b.likes || 0) - (b.dislikes || 0)
        return scoreB - scoreA
      case "price":
        return 0 // All same price for now
      default:
        return 0
    }
  })

  return (
    <div className="fixed inset-0 z-60 bg-rb-darker">
      <div className="flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-5 pb-4 flex items-center gap-4">
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <IoArrowBack className="text-2xl" />
          </button>

          <h1 className="text-white uppercase font-black text-xl flex-1">
            MARKET
          </h1>

          <WalletConnect />
        </div>

        {/* Filters */}
        <div className="px-5 pb-4 flex items-center justify-between gap-4">
          <div className="flex rounded-lg overflow-hidden bg-rb-dark text-white/60">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid"
                  ? "bg-rb-green text-black"
                  : "hover:text-white"
              )}
            >
              <TfiLayoutGrid2Alt />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "list"
                  ? "bg-rb-green text-black"
                  : "hover:text-white"
              )}
            >
              <TfiLayoutColumn3Alt className="rotate-90 scale-95" />
            </button>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-white/60 text-xs">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs font-semibold bg-rb-dark text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-rb-green/60 cursor-pointer"
              >
                <option value="score">SCORE</option>
                <option value="owners">OWNERS</option>
                <option value="price">PRICE</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                <IoChevronDownSharp />
              </div>
            </div>
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div
            className={cn(
              "grid gap-3",
              viewMode === "grid" ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            {availableGames.map((game) => {
              const isOwned = ownedGames.some(
                (owned) => owned.collectionId === game.collectionId
              )

              return (
                <button
                  key={`market-game-${game.collectionId}`}
                  onClick={() => router.push(`?game=${game.collectionId}`)}
                  className="flex flex-col rounded-xl bg-rb-dark hover:bg-rb-dark/80 transition-colors text-left overflow-hidden"
                >
                  {/* Cover */}
                  <div
                    className={cn(
                      "w-full aspect-square bg-rb-darker relative",
                      isOwned && "grayscale"
                    )}
                  >
                    {/* Owned Overlay */}
                    {isOwned && (
                      <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white/80 font-black text-lg uppercase tracking-wider">
                          OWNED
                        </span>
                      </div>
                    )}

                    <img
                      src={game.cover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div
                    className={cn(
                      "p-3 flex flex-col gap-2",
                      isOwned && "grayscale saturate-50"
                    )}
                  >
                    <h3 className="text-white font-bold text-sm line-clamp-1">
                      {game.title}
                    </h3>

                    <div className="flex items-center justify-between gap-2">
                      <GameStars
                        likes={game.likes || 0}
                        dislikes={game.dislikes || 0}
                      />
                      <div className="text-rb-green font-bold text-sm">
                        5 WLD
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <MdPerson />
                      <span>{localizeNumber(game.totalOwners)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Market() {
  return (
    <Suspense fallback={null}>
      <MarketContent />
    </Suspense>
  )
}
