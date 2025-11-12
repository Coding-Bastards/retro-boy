"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { useAllGames, useOwnedGames } from "@/app/lib/games"
import { localizeNumber } from "@/app/lib/numbers"
import { useAtomIsCatalogueOpen } from "@/lib/store"
import { useEmulator } from "@/app/lib/EmulatorContext"

import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai"
import { MdPerson } from "react-icons/md"

import Button from "./Button"
import PageContainer from "./PageContainer"

export default function GamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const allGames = useAllGames()
  const { games: ownedGames } = useOwnedGames()
  const [, setIsCatalogueOpen] = useAtomIsCatalogueOpen()

  const { loadGame } = useEmulator()
  const collectionId = searchParams.get("game")

  if (!collectionId) return null

  const game = allGames.find((g) => g.collectionId === collectionId)
  if (!game) return null

  const isOwned = ownedGames.some((g) => g.collectionId === collectionId)

  const handleAction = () => {
    if (isOwned) {
      router.push("/") // Back to main emulator page
      loadGame(game.rom, game.collectionId)
      setIsCatalogueOpen(false) // Close catalogue on game load
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
    <PageContainer title={game.title}>
      <div className="flex-1 overflow-auto p-5 pt-6">
        {/* Cover Image */}
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-rb-dark mb-4">
          <img src={game.cover} className="w-full h-full object-cover" alt="" />
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
              {localizeNumber(game.totalOwners)}
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
          <div className="grid grid-cols-2 gap-3">
            {GALLERY.map((image, index) => (
              <div
                key={index}
                className="aspect-square rounded-3xl overflow-hidden bg-rb-dark"
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
    </PageContainer>
  )
}
