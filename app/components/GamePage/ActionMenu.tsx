"use client"

import { useState } from "react"
import { toast } from "sonner"
import { erc721Abi } from "viem"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"

import { useOwnedTokenIds } from "@/hooks/nfts"
import { ADDRESS_DEAD } from "@/lib/constants"
import { useAlertModal } from "@/components/Alert"

import { RiExternalLinkLine, RiSettingsFill } from "react-icons/ri"
import { useOwnedGames } from "@/app/lib/games"

export default function ActionMenu({
  gameCollectionId,
}: {
  gameCollectionId: string
}) {
  const { address, signIn } = useWorldAuth()
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: mutateOwnedGames } = useOwnedGames()
  const { findTokenId } = useOwnedTokenIds(address)
  const { showAlert } = useAlertModal()

  const TOKEN_ID = findTokenId(gameCollectionId)
  const isOwnedWithId = TOKEN_ID !== null

  async function handleDeleteGame() {
    // Assume this is not reachable - just in case - edge thingy
    if (!isOwnedWithId) return
    if (!address) return signIn()

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: gameCollectionId,
            abi: erc721Abi,
            functionName: "transferFrom",
            // Burn -> send to dead address
            args: [address, ADDRESS_DEAD, TOKEN_ID],
          },
        ],
      })

      const debugURL = (finalPayload as any)?.details?.debugUrl
      if (debugURL) console.debug(debugURL)

      if (finalPayload.status === "success") {
        mutateOwnedGames(
          (currentOwned = []) =>
            currentOwned.filter((g) => g.collectionId !== gameCollectionId),
          {
            // Keep the UI in sync
            revalidate: false,
          }
        )

        toast.success("Game removed from your collection.")
      }
    } catch (error) {
      console.error({ error })
      toast.error("Oops! Something went wrong while deleting the game.")
    }

    setIsOpen(false)
  }

  function handleTransfer() {
    showAlert({
      title: "NOT AVAILABLE",
      description: "The transfer feature is coming soon!",
    })

    setIsOpen(false)
  }

  function handleViewMetadata() {
    window.open(
      `https://worldscan.org/nft/${gameCollectionId}/${TOKEN_ID}`,
      "_blank"
    )
    setIsOpen(false)
  }

  // Early return if not owned (not token ID)
  if (!isOwnedWithId) return null
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border animate-in fade-in zoom-in-90 group text-white border-white/10 text-lg rounded-lg p-1.5"
      >
        <RiSettingsFill className="rotate-90 transition group-focus-within:rotate-180 scale-105" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute animate-in fade-in-50 slide-in-from-top-2 zoom-in-95 right-0 mt-2 whitespace-nowrap min-w-38 rounded-xl bg-white shadow-lg z-50 overflow-hidden">
            <button
              onClick={handleViewMetadata}
              className="w-full flex gap-3 items-center justify-between px-4 py-3 text-left text-sm hover:bg-black/3 transition"
            >
              <span>View Metadata</span>
              <RiExternalLinkLine className="text-base" />
            </button>

            <button
              onClick={handleTransfer}
              className="w-full px-4 py-3 text-left text-sm hover:bg-black/3 transition"
            >
              Transfer
            </button>

            <div className="h-px bg-black/5" />

            <button
              onClick={() => {
                showAlert({
                  title: "ARE YOU SURE?",
                  description:
                    "This game won't be available in your library anymore.",
                  action: {
                    label: "DELETE",
                    onClick: handleDeleteGame,
                  },
                })
              }}
              className="w-full px-4 py-3 text-left text-sm text-rb-red hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
