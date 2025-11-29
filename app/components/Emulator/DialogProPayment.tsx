"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { toast } from "sonner"

import { useProFeatures } from "@/hooks/pro"
import { runParty } from "@/lib/party"
import { executeWorldPayment } from "@/app/actions/payments"
import { DEV_ADDRESS } from "@/lib/constants"

import Dialog from "@/components/Dialog"
import Button from "@/components/Button"

export default function DialogProPayment({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { isProUser, migrateToPro } = useProFeatures()
  const { address, signIn } = useWorldAuth()

  // Devs get a discount
  const AMOUNT = address === DEV_ADDRESS ? 0.1 : 3.99
  const closeDialog = () => onOpenChange(false)

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
    <Dialog
      title="🖐️ PRO IS REQUIRED"
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <p className="text-sm">
        Level up your gaming experience with <strong>PRO!</strong> Unlock
        exclusive features, discounts, and get rid of ads.
      </p>

      <Button
        onClick={handleGoPro}
        className="mt-9 border-2 rounded-xl border-black/20 bg-linear-[90deg,#ffd700,#10f715,#ffd700] w-full"
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
        <span className="text-black">
          UPGRADE {"->"} {AMOUNT} WLD
        </span>
      </Button>
    </Dialog>
  )
}
