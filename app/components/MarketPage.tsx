"use client"

import { useState } from "react"
import { formatEther } from "viem"

import { type Game, useAllGames, useOwnedGames } from "@/lib/games"
import { useAppRouter } from "@/lib/routes"
import { localizeNumber, numberToShortWords } from "@/lib/numbers"
import { cn } from "@/lib/utils"

import { TfiLayoutColumn3Alt, TfiLayoutGrid2Alt } from "react-icons/tfi"
import { IoChevronDownSharp } from "react-icons/io5"
import { MdPerson } from "react-icons/md"

import WalletConnect from "./WalletConnect"
import GameStars from "./GameCatalogue/GameStars"
import PageContainer from "./PageContainer"

type SortBy = "minted" | "score" | "price"
type ViewMode = "grid" | "list"

export default function MarketPage() {
  const { pushGamePage } = useAppRouter()
  const { games: allGames } = useAllGames()
  const { games: ownedGames } = useOwnedGames()

  const [sortBy, setSortBy] = useState<SortBy>("score")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Sort games
  const availableGames = allGames.sort((a, b) => {
    switch (sortBy) {
      case "minted":
        // More owners first
        return (b?.totalOwners || 0) - (a?.totalOwners || 0)
      case "score":
        // Higher score first
        const scoreA = (a?.likes || 0) - (a?.dislikes || 0)
        const scoreB = (b?.likes || 0) - (b?.dislikes || 0)
        return scoreB - scoreA
      case "price":
        // Cheap to expensive
        return a.price < b.price ? -1 : 1
      default:
        return 0
    }
  })

  return (
    <PageContainer
      title="MARKET"
      endTitleEnhancer={<WalletConnect summaryToken="WLD" />}
    >
      {/* Filters */}
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex border border-white/10 rounded-lg overflow-hidden bg-rb-dark text-white/60">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "size-8 grid place-items-center pl-0.5 transition-colors",
              viewMode === "grid"
                ? "bg-rb-green-light text-black"
                : "hover:text-white"
            )}
          >
            <TfiLayoutGrid2Alt />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "size-8 grid place-items-center pr-0.5 transition-colors",
              viewMode === "list"
                ? "bg-rb-green-light text-black/85"
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
              className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs font-black bg-rb-dark text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-rb-green/60 cursor-pointer"
            >
              <option value="score">SCORE</option>
              <option value="minted">MINTED</option>
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

            const Container = viewMode === "grid" ? ItemGrid : ItemList
            return (
              <Container
                key={`game-cat-${game.collectionId}`}
                game={game}
                isOwned={isOwned}
                onSelect={() => pushGamePage(game.collectionId)}
              />
            )
          })}
        </div>
      </div>
    </PageContainer>
  )
}

interface MarketItemProps {
  game: Game
  isOwned: boolean
  onSelect: () => void
}

function ItemGrid({ game, isOwned, onSelect }: MarketItemProps) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col rounded-xl bg-rb-dark hover:bg-rb-dark/80 transition-colors text-left overflow-hidden relative"
    >
      <div
        className={cn(
          "absolute right-0 bottom-0 w-32 h-10 bg-linear-to-tl from-rb-green/15 via-rb-green/0 to-rb-green/0 pointer-events-none",
          isOwned && "grayscale"
        )}
      />

      {/* Cover */}
      <div
        className={cn(
          "w-full aspect-square bg-white/3 relative",
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

        <img src={game.cover} alt="" className="size-full object-cover" />
      </div>

      {/* Info */}
      <div className={cn("p-3", isOwned && "grayscale saturate-50")}>
        <h3 className="text-white font-black text-sm line-clamp-1">
          {game.title}
        </h3>

        <nav className="mt-1">
          <GameStars {...game} className="text-xs" />
        </nav>

        <div className="flex border-t mt-7 pt-2.5 -mx-3 px-3 border-white/15 items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <MdPerson />
            <span>{localizeNumber(game?.totalOwners)}</span>
          </div>
          <div className="text-rb-green font-black whitespace-nowrap text-sm">
            {game.price > 0 ? `${formatEther(game.price)} WLD` : "FREE"}
          </div>
        </div>
      </div>
    </button>
  )
}

function ItemList({ game, isOwned, onSelect }: MarketItemProps) {
  return (
    <button
      onClick={onSelect}
      className="flex gap-1 pr-1 rounded-xl bg-rb-dark hover:bg-rb-dark/80 transition-colors text-left overflow-hidden relative"
    >
      {/* Gradient overlay on right edge */}
      <div
        className={cn(
          "absolute right-0 bottom-0 w-40 h-14 bg-linear-to-tl from-rb-green/15 via-rb-green/0 to-rb-green/0 pointer-events-none",
          isOwned && "grayscale"
        )}
      />

      {/* Cover */}
      <div
        className={cn(
          "size-28 rounded-xl overflow-hidden shrink-0 bg-white/5 relative",
          isOwned && "grayscale"
        )}
      >
        {/* Owned Overlay */}
        {isOwned && (
          <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white/80 font-black text-xs uppercase tracking-wider">
              OWNED
            </span>
          </div>
        )}

        <img src={game.cover} alt="" className="size-full object-cover" />
      </div>

      {/* Info */}
      <div
        className={cn(
          "flex-1 flex flex-col justify-between min-w-0 p-3",
          isOwned && "grayscale saturate-50"
        )}
      >
        <div>
          <h3 className="text-white font-black text-sm line-clamp-1 mb-1">
            {game.title}
          </h3>
          <p className="text-white/60 text-xs line-clamp-2 mb-2">
            {game.description || "No description available."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <GameStars {...game} className="text-xs" />
            <div className="flex items-center gap-1 text-xs text-white/60">
              <MdPerson />
              <span>{numberToShortWords(game?.totalOwners || 0)}</span>
            </div>
          </div>
          <div className="text-rb-green font-black whitespace-nowrap text-sm">
            {game.price > 0 ? `${formatEther(game.price)} WLD` : "FREE"}
          </div>
        </div>
      </div>
    </button>
  )
}
