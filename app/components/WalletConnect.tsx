"use client"

import { useState, useEffect } from "react"
import { useWorldAuth } from "@radish-la/world-auth"

import { useAccountBalancess } from "@/hooks/balances"
import { useGameStats } from "@/hooks/games"
import { beautifyAddress } from "@/lib/utils"
import { numberToShortWords } from "@/lib/numbers"
import { formatTimePlayed } from "@/lib/date"

import AddressBlock from "./AddressBlock"
import Dialog from "./Dialog"
import Button from "./Button"
import { useAccountPoints } from "../hooks/points"

export default function WalletConnect({
  summaryToken = "RBC",
}: {
  summaryToken?: "WLD" | "RBC"
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { points: RBC_POINTS } = useAccountPoints()
  const { address, isConnected, signOut, signIn } = useWorldAuth()
  const { emulator } = useGameStats()
  const { WLD, RBC } = useAccountBalancess(address)

  useEffect(() => {
    // For debugging purposes
    console.debug(`Address - ${address}`)
  }, [address])

  const handleDisconnect = () => {
    signOut?.()
    setDialogOpen(false)
  }

  const isWLDSummary = summaryToken === "WLD"

  const TRIGGER = (
    <button
      onClick={
        // undefined if connected so the dialog opens automatically
        isConnected ? undefined : signIn
      }
      className="text-white flex gap-2 items-center"
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

      <AddressBlock address={address} size={8} />
    </button>
  )

  if (!isConnected) return TRIGGER
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} trigger={TRIGGER}>
      <div className="flex flex-col gap-6 text-white">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-3 py-4">
          <AddressBlock address={address} size={18} />
          <div className="text-center">
            <div className="font-black text-lg">
              {address ? beautifyAddress(address, 6, "") : "Not Connected"}
            </div>
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
            <span className="text-white/60 text-sm">WLD Balance</span>
            <span className="font-black">
              {numberToShortWords(WLD.formatted)} WLD
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">RBC Balance</span>
            <span className="font-black text-rb-green">
              {numberToShortWords(RBC.formatted)} RBC
            </span>
          </div>
        </div>

        {/* Disconnect Button */}
        <Button onClick={handleDisconnect} className="mt-2" variant="secondary">
          DISCONNECT
        </Button>
      </div>
    </Dialog>
  )
}
