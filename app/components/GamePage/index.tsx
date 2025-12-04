"use client"

import Link from "next/link"
import { MiniKit } from "@worldcoin/minikit-js"
import { useSearchParams } from "next/navigation"
import { formatEther } from "viem"

import { useWorldAuth } from "@radish-la/world-auth"
import { useAtomIsCatalogueOpen } from "@/lib/store"
import { useEmulator } from "@/lib/EmulatorContext"
import { useAppRouter } from "@/lib/routes"
import { useGame } from "@/hooks/games"

import { localizeNumber } from "@/lib/numbers"

import {
  AiOutlineLike,
  AiFillLike,
  AiFillDislike,
  AiOutlineDislike,
} from "react-icons/ai"

import { RiExternalLinkLine } from "react-icons/ri"
import { MdPerson } from "react-icons/md"

import { runParty } from "@/lib/party"
import { appendSignatureResult, cn } from "@/lib/utils"
import { useAlertModal } from "@/components/Alert"
import { useLikesEngine } from "@/hooks/likes"

import { ABI_REGISTRY, type WriteParameters } from "@/lib/abi"
import { ADDRESS_GAME_REGISTRY, ONE_HOUR_IN_SECONDS } from "@/lib/constants"
import { useAccountBalances } from "@/hooks/balances"
import { TOKENS } from "@/lib/tokens"

import Button from "@/components/Button"
import PageContainer from "@/components/PageContainer"
import Dialog from "@/components/Dialog"
import ActionMenu from "./ActionMenu"

export default function GamePage() {
  const [, setIsCatalogueOpen] = useAtomIsCatalogueOpen()
  const { showAlert } = useAlertModal()

  const { isConnected, signIn } = useWorldAuth()
  const { loadGame } = useEmulator()
  const { WLD } = useAccountBalances()
  const { navigateHome } = useAppRouter()
  const searchParams = useSearchParams()

  const collectionId = searchParams.get("game")
  const { game, isOwned, markAsOwned } = useGame(collectionId || "")
  const { vote, isSelfDisliked, isSelfLiked } = useLikesEngine(
    collectionId || ""
  )

  if (!game) return null

  const PRICE = game.price
  const isFreeMint = PRICE <= 0
  const handleAction = async () => {
    if (!isConnected) return signIn()
    if (isOwned) {
      loadGame(game.rom, game.collectionId)
      setIsCatalogueOpen(false) // Close catalogue on game load
      return navigateHome()
    }

    // Verify sufficient balance
    // We safe against free mints (value is never negative)
    if (WLD.value < PRICE) {
      return showAlert({
        title: "INSUFFICIENT BALANCE",
        description: "You don't have enough WLD to mint this collection.",
      })
    }

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
          "Collection minted successfully. Now available in your game library.",
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
    <PageContainer
      title={game.title}
      endTitleEnhancer={<ActionMenu gameCollectionId={game.collectionId} />}
    >
      <div className="flex-1 overflow-auto p-5 pt-6">
        {/* Cover Image */}
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/7 mb-4 relative">
          {isOwned && (
            <div
              className="
            animate-in slide-in-from-bottom-3 slide-in-from-right-2 duration-150 fade-in-65 zoom-in-90
            rounded-full shadow-inner tracking-wide text-sm py-0.5 px-3 font-black bg-rb-yellow drop-shadow overflow-hidden absolute top-3 right-3"
            >
              OWNED
            </div>
          )}
          <img src={game.cover} className="size-full object-cover" alt="" />
        </div>

        {/* Score Section */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-white/10">
          <button
            onClick={() => handleVote("like")}
            className={cn(
              isSelfLiked ? "text-rb-green" : "text-white",
              "flex items-center gap-2 active:scale-95"
            )}
          >
            {isSelfLiked ? (
              <AiFillLike className="text-rb-green text-xl" />
            ) : (
              <AiOutlineLike className="text-rb-green text-xl" />
            )}
            <span className="font-black">{localizeNumber(game?.likes)}</span>
          </button>

          <button
            onClick={() => handleVote("dislike")}
            className={cn(
              isSelfDisliked ? "text-red-400" : "text-white",
              "flex items-center gap-2 active:scale-95"
            )}
          >
            {isSelfDisliked ? (
              <AiFillDislike className="text-red-400 text-xl" />
            ) : (
              <AiOutlineDislike className="text-red-400 text-xl" />
            )}
            <span className="font-black">{localizeNumber(game?.dislikes)}</span>
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            <MdPerson className="text-white/60 text-xl" />
            <span className="text-white/80 whitespace-nowrap text-sm">
              {localizeNumber(game?.totalOwners)}
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
          <h3 className="text-white font-black uppercase text-sm tracking-wider">
            Gallery
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3">
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
                        "aspect-square rounded-3xl overflow-hidden bg-white/7"
                      )}
                    >
                      <img
                        src={image}
                        className="size-full object-cover rounded-3xl"
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

        {/* Licenses */}
        {Object.keys(game.licenses).length > 0 && (
          <div className="mt-12 mb-6">
            <h3 className="text-white font-black uppercase text-sm mb-3 tracking-wider">
              LICENSES
            </h3>
            <div className="space-y-3">
              {Object.entries(game.licenses).map(([key, license]) => (
                <div
                  key={`l-${key}`}
                  className="bg-white/5 rounded-lg p-3.5 pl-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white capitalize text-sm">
                      <strong>{key}</strong>{" "}
                      <span className="text-[90%]">({license.type})</span>
                    </h4>

                    <Link
                      target="_blank"
                      href={license.license_url}
                      rel="noopener noreferrer"
                      className="text-white text-lg"
                    >
                      <RiExternalLinkLine />
                    </Link>
                  </div>

                  <p className="mt-1 text-white/60 text-xs">
                    By {license.creators.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 pt-1 pb-6">
        <Button onClick={handleAction}>
          {isConnected
            ? isOwned
              ? "PLAY NOW"
              : isFreeMint
              ? "MINT (FREE)"
              : `MINT (${formatEther(PRICE)} WLD)`
            : "CONNECT WALLET"}
        </Button>
      </div>
    </PageContainer>
  )
}
