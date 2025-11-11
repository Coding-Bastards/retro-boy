"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAllGames, useOwnedGames } from "@/app/lib/games"
import { localizeNumber } from "@/app/lib/numbers"
import { useEmulator } from "@/app/lib/EmulatorContext"

import { IoArrowBack } from "react-icons/io5"
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai"
import { MdPerson } from "react-icons/md"

import Button from "./Button"

function GamePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const allGames = useAllGames()
  const { games: ownedGames } = useOwnedGames()

  const { loadGame } = useEmulator()
  const collectionId = searchParams.get("game")

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
      loadGame(game.rom, game.collectionId)
    } else {
      // Handle buy logic
      console.debug("Buy game:", game.title)
    }
  }

  const GALLERY = [
    ...(game.nftImage ? [game.nftImage] : []),
    ...(game.gallery || []),
  ]

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

          <h1 className="text-white uppercase font-black text-xl flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {game.title}
          </h1>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-5 pb-4">
          {/* Cover Image */}
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-rb-dark mb-4">
            <img
              src={game.cover}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>

          {/* Score Section */}
          <div className="flex items-center gap-6 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <AiOutlineLike className="text-rb-green text-xl" />
              <span className="text-white font-black">
                {localizeNumber(game.likes)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AiOutlineDislike className="text-red-400 text-xl" />
              <span className="text-white font-black">
                {localizeNumber(game.dislikes)}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <MdPerson className="text-white/60 text-xl" />
              <span className="text-white/80 whitespace-nowrap text-sm">
                {localizeNumber(game.totalOwners)} owners
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-white font-black uppercase text-sm mb-2 tracking-wider">
              About
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {game?.description || "No description available."}
            </p>
          </div>

          {/* Gallery */}
          <div className="mb-6">
            <h3 className="text-white font-black uppercase text-sm mb-3 tracking-wider">
              Gallery
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {GALLERY.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-rb-dark"
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-1 pb-6">
          <Button onClick={handleAction}>
            {isOwned ? "PLAY NOW" : "MINT (5 WLD)"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GamePageContent />
    </Suspense>
  )
}
