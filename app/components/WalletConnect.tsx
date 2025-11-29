"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useWorldAuth } from "@radish-la/world-auth"
import { toast } from "sonner"

import { useAccountBalances, useClaimedRBCPoints } from "@/hooks/balances"
import { useAccountPoints } from "@/hooks/points"
import { useProFeatures } from "@/hooks/pro"
import { useGameStats } from "@/hooks/games"

import { getDispenserPayload } from "@/app/actions/dispenser"
import { beautifyAddress } from "@/lib/utils"
import { numberToShortWords } from "@/lib/numbers"
import { formatTimePlayed } from "@/lib/date"

import { ABI_DISPENSER } from "@/lib/abi"
import { ADDRESS_DISPENSER, DEV_ADDRESS } from "@/lib/constants"

import AddressBlock from "./AddressBlock"
import Dialog from "./Dialog"
import Button from "./Button"

export default function WalletConnect({
  summaryToken = "RBC",
}: {
  summaryToken?: "WLD" | "RBC"
}) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)

  const { points: RBC_POINTS, syncPoints } = useAccountPoints()
  const { address, isConnected, signOut, signIn } = useWorldAuth()
  const { isProUser } = useProFeatures()
  const { emulator } = useGameStats()

  const { WLD, RBC } = useAccountBalances(address)
  const { claimed, isLoading: isLoadingClaimedPoints } =
    useClaimedRBCPoints(address)

  const closeDialog = () => setDialogOpen(false)
  const handleDisconnect = () => {
    signOut?.()
    closeDialog()
  }

  const POINTS_TO_COLLECT =
    RBC_POINTS > claimed.formatted ? RBC_POINTS - claimed.formatted : 0

  async function handleClaim() {
    if (POINTS_TO_COLLECT <= 0 || !address || isClaimed) {
      // Early return for debugging
      return console.debug({ POINTS_TO_COLLECT, address, isClaimed })
    }

    // Sync claiming points with backend
    await syncPoints()
    const { amount, deadline, signature } = await getDispenserPayload(address)
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_DISPENSER,
          address: ADDRESS_DISPENSER,
          functionName: "claim",
          args: [amount, deadline, signature],
        },
      ],
    })

    if (finalPayload.status === "success") {
      setIsClaimed(true)
      return toast.success(
        `${numberToShortWords(POINTS_TO_COLLECT)} RBC claimed!`
      )
    }

    // Do not show error state if user denied the transaction
    // Only if there was an error when executing the transaction
    const debugURL = (finalPayload as any)?.details?.debugUrl
    const isErrored = Boolean(debugURL)
    if (isErrored) {
      toast.error("Failed to claim. Please try again.")
      console.debug(debugURL)
    }
  }

  useEffect(() => {
    if (isDialogOpen) {
      // Reset claimed state
      setIsClaimed(false)
    }
  }, [isDialogOpen])

  const isWLDSummary = summaryToken === "WLD"

  // Show claim action when diff >= 1 RBC
  const showClaimAction =
    !isClaimed &&
    !isLoadingClaimedPoints &&
    isConnected &&
    POINTS_TO_COLLECT >= 1

  const TRIGGER = (
    <button
      onClick={
        // undefined if connected so the dialog opens automatically
        isConnected ? undefined : signIn
      }
      className="text-white active:scale-98 flex gap-2 items-center"
    >
      <div className="text-right font-black">
        <div className="text-sm">
          {address ? beautifyAddress(address, 3, "") : "CONN"}
        </div>
        <div className="text-xs -mt-0.5 text-rb-green">
          {numberToShortWords(isWLDSummary ? WLD.formatted : RBC_POINTS)}{" "}
          {summaryToken}
        </div>
      </div>

      <div className="relative">
        {showClaimAction && (
          <div className="rounded-full pointer-events-none absolute z-1 -top-0.5 -right-0.5 size-2 bg-linear-to-tl backdrop-blur-sm border border-rb-yellow/50 from-rb-yellow/70 to-rb-yellow" />
        )}
        <AddressBlock address={address} size={8} />
      </div>
    </button>
  )

  if (!isConnected) return TRIGGER
  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen} trigger={TRIGGER}>
      <div className="flex flex-col gap-6 text-white">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-3 py-4">
          <AddressBlock address={address} size={18} />
          <div className="text-center">
            <nav className="flex justify-center items-center gap-1.5">
              <div className="font-black text-lg">
                {address ? beautifyAddress(address, 5, "") : "Not Connected"}
              </div>

              {isProUser && <ProBadge />}
            </nav>
            <div className="text-white/60 text-sm mt-1">
              <span>
                {formatTimePlayed(emulator.playTimeInSeconds)} ― Played
              </span>
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">RBC Balance</span>
            <span className="font-black text-rb-green">
              {numberToShortWords(RBC.formatted)} RBC
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">WLD Balance</span>
            <span className="font-black">
              {numberToShortWords(WLD.formatted)} WLD
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Earned Points</span>
            <span className="font-black">
              {numberToShortWords(RBC_POINTS)} RBC
            </span>
          </div>
        </div>

        <div className="my-1.5" />

        {showClaimAction && (
          <Button
            className="bg-linear-to-tr from-white/95 to-white/80 -mb-1"
            onClick={handleClaim}
          >
            COLLECT ({numberToShortWords(POINTS_TO_COLLECT)} RBC)
          </Button>
        )}

        {/* Disconnect Button */}
        <Button onClick={handleDisconnect} variant="secondary">
          DISCONNECT
        </Button>
      </div>
    </Dialog>
  )
}

export function ProBadge() {
  return (
    <div className="bg-white/15 text-white/80 text-xs px-1.5 py-px font-black rounded-full">
      PRO
    </div>
  )
}
