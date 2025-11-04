"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { IoArrowBack } from "react-icons/io5"
import Button from "./Button"
import { useAllGames, useOwnedGames } from "@/app/lib/games"

interface GamePageContentProps {
  onPlay: () => void
}

function GamePageContent({ onPlay }: GamePageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const collectionId = searchParams.get("game")
  const allGames = useAllGames()
  const { games: ownedGames } = useOwnedGames()

  if (!collectionId) return null

  const game = allGames.find((g) => g.collectionId === collectionId)
  if (!game) return null

  const isOwned = ownedGames.some((g) => g.collectionId === collectionId)

  const handleBack = () => {
    router.back()
  }

  const handleAction = () => {
    if (isOwned) {
      handleBack()
      onPlay()
    } else {
      // Handle buy logic
      console.log("Buy game:", game.title)
    }
  }

  return (
    <div className="fixed inset-0 z-60 pointer-events-auto! bg-rb-darker">
      <div className="flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-5 pb-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-white/80 hover:text-white transition-colors"
          >
            <IoArrowBack className="text-2xl" />
          </button>

          <h1 className="text-white uppercase font-black text-xl flex-1">
            {game.title}
          </h1>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5">
          <div className="text-white/60 text-center py-12">
            Game details coming soon...
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-1 pb-6">
          <Button onClick={handleAction}>
            {isOwned ? "PLAY NOW" : "BUY (5 WLD)"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function GamePage({ onPlay }: GamePageContentProps) {
  return (
    <Suspense fallback={null}>
      <GamePageContent onPlay={onPlay} />
    </Suspense>
  )
}
