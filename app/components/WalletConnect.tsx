"use client"

import { useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import AddressBlock from "./AddressBlock"
import Dialog from "./Dialog"
import Button from "./Button"
import { FaClock } from "react-icons/fa"

import { useAccountBalancess } from "@/hooks/balances"
import { beautifyAddress } from "@/lib/utils"
import { numberToShortWords } from "@/lib/numbers"

export default function WalletConnect({
  summaryToken = "RBC",
}: {
  summaryToken?: "WLD" | "RBC"
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { address, isConnected, signOut, signIn } = useWorldAuth()
  const { WLD, RBC } = useAccountBalancess(address)

  const handleDisconnect = () => {
    signOut?.()
    setDialogOpen(false)
  }

  const SUMMARY_TOKEN = summaryToken === "WLD" ? WLD : RBC

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
          {numberToShortWords(SUMMARY_TOKEN.formatted)} {summaryToken}
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
            <div className="flex items-center justify-center gap-1.5 text-white/60 text-sm mt-1">
              <FaClock />
              <span>12h 34m Played</span>
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
