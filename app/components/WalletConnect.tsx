"use client"

import { useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import AddressBlock from "./AddressBlock"
import Dialog from "./Dialog"
import Button from "./Button"
import { FaClock } from "react-icons/fa"

import { beautifyAddress } from "@/app/lib/utils"

export default function WalletConnect() {
  const { address, isConnected, signOut } = useWorldAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDisconnect = () => {
    signOut?.()
    setDialogOpen(false)
  }

  const TRIGGER = (
    <button
      onClick={isConnected ? () => setDialogOpen(true) : undefined}
      className="text-white flex gap-2 items-center"
    >
      <div className="text-right font-black">
        <div className="text-sm">
          {address ? beautifyAddress(address, 3, "") : "WALLET"}
        </div>
        <div className="text-xs -mt-0.5 text-rb-green">1.2K RBC</div>
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
            <span className="font-black">5.2 WLD</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">RBC Balance</span>
            <span className="font-black text-rb-green">1.2K RBC</span>
          </div>
        </div>

        {/* Disconnect Button */}
        <Button
          onClick={handleDisconnect}
          className="mt-2 bg-white/10 text-white border border-white/10"
        >
          DISCONNECT
        </Button>
      </div>
    </Dialog>
  )
}
