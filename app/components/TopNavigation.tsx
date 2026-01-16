"use client"

import Link from "next/link"
import { useState } from "react"
import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"

import { useEmulator } from "@/lib/EmulatorContext"
import { useProFeatures } from "@/hooks/pro"
import { getUnoDeeplinkUrl } from "@/lib/deeplinks"
import { cn } from "@/lib/utils"

import Dialog from "@/components/Dialog"
import WalletConnect, { ProBadge } from "@/components/WalletConnect"
import Button from "./Button"

import { RiExternalLinkLine } from "react-icons/ri"
import { TOKENS } from "@/lib/tokens"

const atomFirstTimeOpen = atomWithStorage("rb.isFirstTimeOpened", true)
/** Expose if it's the first time app is opened */
export const useIsFirstTimeOpen = () => useAtom(atomFirstTimeOpen)
export default function TopNavigation() {
  const { isGameLoaded } = useEmulator()
  const { isProUser } = useProFeatures()

  const [isFirstTimeOpen, setIsFirstTimeOpen] = useIsFirstTimeOpen()
  const [open, setOpen] = useState(false)

  function handleDialogChange(open: boolean) {
    if (isFirstTimeOpen) setIsFirstTimeOpen(false)
    setOpen(open)
  }

  return (
    <nav className="flex min-h-13 pb-4 items-center justify-between">
      <Dialog
        open={open || isFirstTimeOpen}
        onOpenChange={handleDialogChange}
        title="ABOUT RETRO BOY"
        trigger={
          <button
            type="button"
            aria-haspopup="dialog"
            className="flex px-1.5 items-center outline-none rounded-full"
          >
            <span
              aria-hidden="true"
              className={cn(
                isGameLoaded
                  ? "bg-rb-green shadow-[0_0_6px_2px_rgba(34,197,94,0.4),0_0_14px_4px_rgba(34,197,94,0.2)]"
                  : "bg-[#727272]",
                "rounded-full size-2 transition-all duration-300"
              )}
            />
            <nav className="flex gap-0.5 items-center">
              <span className="text-lg relative px-2.5 italic font-black text-transparent bg-clip-text bg-linear-to-b from-white/25 via-white/40 to-white/25">
                RETRO BOY
              </span>
              {isProUser && <ProBadge />}
            </nav>
          </button>
        }
      >
        <p className="text-sm mt-3">
          <strong>Retro Boy 👾</strong> is a Mini App that brings the charm of
          retro gaming to your phone.
        </p>

        <p className="text-sm mt-4">
          Earn{" "}
          <Link
            className="inline-flex focus-within:scale-105 bg-rb-green/15 text-rb-green rounded pl-2 pr-1 py-px items-center gap-2"
            target="_blank"
            href={getUnoDeeplinkUrl({
              fromToken: TOKENS.WLD.ADDRESS,
              toToken: TOKENS.RBC.ADDRESS,
            })}
          >
            <strong>RBC Tokens</strong>
            <RiExternalLinkLine className="scale-130" />
          </Link>{" "}
          by playing.
          <br /> RBC represents a proof-of-gameplay in the form of a memecoin.
          We do not promote speculation and/or any form of investment.
        </p>

        <Button
          onClick={() => handleDialogChange(false)}
          className="mt-7"
          variant="secondary"
        >
          ACCEPT
        </Button>
      </Dialog>

      <WalletConnect />
    </nav>
  )
}
