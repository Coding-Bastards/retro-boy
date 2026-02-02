"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { toast } from "sonner"
import { atom, useAtom } from "jotai"

import { useProFeatures } from "@/hooks/pro"
import { getProPrice } from "@/app/lib/pro"
import { runParty } from "@/lib/party"
import { executeWorldPayment } from "@/app/actions/payments"

import Dialog from "@/components/Dialog"
import Button from "@/components/Button"

const atomProDialogOpen = atom(false)
export const useProDialogAtom = () => {
  return useAtom(atomProDialogOpen)
}

export default function DialogProPayment() {
  const [isOpen, setOpen] = useProDialogAtom()
  const { isProUser, migrateToPro } = useProFeatures()
  const { address, isConnected, signIn } = useWorldAuth()

  const AMOUNT = getProPrice(address)
  const closeDialog = () => setOpen(false)

  async function handleGoPro() {
    if (!address) return signIn()

    // Assume this was an edge-case error - we do not want to charge twice
    if (isProUser) return closeDialog()

    const paymentTX = await executeWorldPayment({
      amount: AMOUNT,
      token: "WLD",
      paymentDescription: `Upgrade to PRO - ${address}`,
    })

    if (paymentTX) {
      toast.success("Welcome to PRO!")
      runParty()
      migrateToPro()
      closeDialog()
    }
  }

  return (
    <Dialog title="🖐️ PRO IS REQUIRED" open={isOpen} onOpenChange={setOpen}>
      <p className="text-sm mb-9">
        Level up your gaming experience with <strong>PRO!</strong> Unlock
        exclusive features, no-ads, game discounts, and more.
      </p>

      {isConnected ? (
        <Button
          onClick={handleGoPro}
          className="border-2 rounded-xl border-black/20 bg-linear-[90deg,#ffd700,#10f715,#ffd700] w-full"
          variant="secondary"
        >
          <style scoped>{`
          @keyframes shine {
            to {
              background-position: 200% center;
            }
          }

          .Button {
            background-size: 200% 100%;
            animation: shine 3s linear infinite;
          }
        `}</style>
          {isProUser ? (
            <span className="text-black">LET'S PLAY</span>
          ) : (
            <span className="text-black">
              UPGRADE {"->"} {AMOUNT} WLD
            </span>
          )}
        </Button>
      ) : (
        <Button variant="secondary" onClick={signIn}>
          CONNECT WALLET
        </Button>
      )}
    </Dialog>
  )
}
