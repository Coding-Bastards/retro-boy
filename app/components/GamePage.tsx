"use client"

import { MiniKit } from "@worldcoin/minikit-js"
import { useSearchParams } from "next/navigation"
import { formatEther } from "viem"

import { useWorldAuth } from "@radish-la/world-auth"
import { useAtomIsCatalogueOpen } from "@/lib/store"
import { useEmulator } from "@/lib/EmulatorContext"
import { useAppRouter } from "@/lib/routes"
import { useGame } from "@/hooks/games"

import { localizeNumber } from "@/lib/numbers"

import { FaHeart } from "react-icons/fa6"
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai"
import { MdPerson } from "react-icons/md"

import { appendSignatureResult, cn } from "@/lib/utils"
import { ABI_REGISTRY, type WriteParameters } from "@/lib/abi"
import { useLikesEngine } from "@/hooks/likes"
import { ADDRESS_GAME_REGISTRY, ONE_HOUR_IN_SECONDS } from "@/lib/constants"
import { runParty } from "@/lib/party"
import { TOKENS } from "@/lib/tokens"

import Button from "./Button"
import PageContainer from "./PageContainer"
import Dialog from "./Dialog"
import { useAlertModal } from "./Alert"

export default function GamePage() {
  const [, setIsCatalogueOpen] = useAtomIsCatalogueOpen()
  const { showAlert } = useAlertModal()

  const { isConnected, signIn } = useWorldAuth()
  const { loadGame } = useEmulator()
  const { navigateHome } = useAppRouter()
  const searchParams = useSearchParams()

  const collectionId = searchParams.get("game")
  const { game, isOwned, markAsOwned } = useGame(collectionId || "")
  const { vote } = useLikesEngine(collectionId || "")

  if (!game) return null
  const PRICE = game.price
  const isFreeMint = PRICE <= 0

  const handleAction = async () => {
    if (isOwned) {
      loadGame(game.rom, game.collectionId)
      setIsCatalogueOpen(false) // Close catalogue on game load
      return navigateHome()
    }

    if (!isConnected) return signIn()

    // 1 hour in the future
    const DEADLINE = Math.floor(Date.now() / 1000) + ONE_HOUR_IN_SECONDS
    const NONCE = Date.now()

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_REGISTRY,
          address: ADDRESS_GAME_REGISTRY,
          functionName: "mintCartridge",
          // game, nonce, deadline, signature
          args: [
            game.collectionId,
            BigInt(NONCE),
            BigInt(DEADLINE),
            isFreeMint ? "0x" : appendSignatureResult(),
          ],
        } satisfies WriteParameters<typeof ABI_REGISTRY>,
      ],
      permit2: isFreeMint
        ? undefined
        : [
            {
              deadline: DEADLINE,
              nonce: NONCE,
              spender: ADDRESS_GAME_REGISTRY,
              permitted: {
                amount: PRICE,
                token: TOKENS.WLD.ADDRESS,
              },
            },
          ],
    })

    if (finalPayload.status === "success") {
      showAlert({
        title: "🎉 CONGRATULATIONS",
        description:
          "You have successfully minted this collection. It's now available in your game library.",
      })
      // Wait for stack to be cleared
      setTimeout(runParty)
      return markAsOwned()
    }
  }

  function handleVote(action: "like" | "dislike") {
    if (isOwned) {
      // Only allow voting if the user owns the game
      return vote(action)
    }

    showAlert({
      title: "GAME REQUIRED",
      description: "Only NFT owners can like or dislike this game.",
    })
  }

  const GALLERY = [game.nftImage, ...game.gallery]

  return (
    <PageContainer title={game.title}>
      <div className="flex-1 overflow-auto p-5 pt-6">
        {/* Cover Image */}
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-rb-dark mb-4 relative">
          {isOwned && (
            <div className="absolute flex items-center gap-1.5 z-1 top-3 right-3 rounded-full bg-linear-to-tr border border-white/10 from-white/60 to-white/30 text-black px-3 py-1 text-xs font-black">
              <span>OWNED</span>
              <FaHeart />
            </div>
          )}
          <img src={game.cover} className="w-full h-full object-cover" alt="" />
        </div>

        {/* Score Section */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-white/10">
          <button
            onClick={() => handleVote("like")}
            className="flex items-center gap-2"
          >
            <AiOutlineLike className="text-rb-green text-xl" />
            <span className="text-white font-black">
              {localizeNumber(game.likes)}
            </span>
          </button>

          <button
            onClick={() => handleVote("dislike")}
            className="flex items-center gap-2"
          >
            <AiOutlineDislike className="text-red-400 text-xl" />
            <span className="text-white font-black">
              {localizeNumber(game.dislikes)}
            </span>
          </button>

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
            {GALLERY.map((image, index) => {
              const isNFTImage = index === 0

              return (
                <Dialog
                  key={`gallery-dialog-${index}`}
                  title={isNFTImage ? "NFT CARTRIDGE" : "GAME IMAGE"}
                  trigger={
                    <div
                      role="button"
                      className={cn(
                        isNFTImage &&
                          "drop-shadow-[2px_2px_8px_rgba(255,255,0,0.4)]",
                        "aspect-square rounded-3xl overflow-hidden bg-white/10"
                      )}
                    >
                      <img
                        src={image}
                        className="w-full h-full object-cover rounded-3xl"
                        alt=""
                      />
                    </div>
                  }
                >
                  <figure className="mt-5 rounded-3xl overflow-hidden">
                    <img className="w-full" src={image} alt="" />
                  </figure>
                </Dialog>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-1 pb-6">
        <Button onClick={handleAction}>
          {isOwned
            ? "PLAY NOW"
            : isFreeMint
            ? "MINT (FREE)"
            : `MINT (${formatEther(PRICE)} WLD)`}
        </Button>
      </div>
    </PageContainer>
  )
}
