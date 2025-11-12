"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import AddressBlock from "./AddressBlock"

import { beautifyAddress } from "@/app/lib/utils"

export default function WalletConnect() {
  const { address } = useWorldAuth()

  return (
    <nav className="text-white flex gap-2 items-center">
      <div className="text-right font-black">
        <div className="text-sm">
          {address ? beautifyAddress(address, 3, "") : "WALLET"}
        </div>
        <div className="text-xs -mt-0.5 text-rb-green">1.2K RBC</div>
      </div>

      <AddressBlock address={address} size={8} />
    </nav>
  )
}
