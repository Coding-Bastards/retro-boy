"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

import Dialog from "@/components/Dialog"
import WalletConnect from "@/components/WalletConnect"
import Button from "./Button"

type TopNavigationProps = {
  isActiveLight: boolean
}

export default function TopNavigation({ isActiveLight }: TopNavigationProps) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="flex pb-4 items-center justify-between">
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="ABOUT RETRO BOY"
        trigger={
          <button
            type="button"
            aria-haspopup="dialog"
            className="flex px-1.5 items-center outline-none focus-visible:ring-2 focus-visible:ring-rb-green/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
          >
            <span
              aria-hidden="true"
              className={cn(
                isActiveLight
                  ? "bg-rb-green shadow-[0_0_6px_2px_rgba(34,197,94,0.4),0_0_14px_4px_rgba(34,197,94,0.2)]"
                  : "bg-[#727272]",
                "rounded-full size-2 transition-all duration-300"
              )}
            />
            <span className="text-lg relative px-2.5 italic font-black text-transparent bg-clip-text bg-linear-to-b from-white/25 via-white/40 to-white/25">
              RETRO BOY
            </span>
          </button>
        }
      >
        <p className="text-sm">
          <strong>Retro Boy</strong> is a Mini App that brings on-chain
          emulation for retro gaming consoles directly to your phone.
        </p>

        <Button
          onClick={() => setOpen(false)}
          className="mt-7"
          variant="secondary"
        >
          CLOSE
        </Button>
      </Dialog>

      <WalletConnect />
    </nav>
  )
}
