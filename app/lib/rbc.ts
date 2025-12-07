"use client"

import type { Address } from "viem"
import { MiniKit } from "@worldcoin/minikit-js"
import { getDispenserPayload } from "@/app/actions/dispenser"

import { ABI_DISPENSER } from "./abi"
import { ADDRESS_DISPENSER } from "./constants"

export const redeemRBCTokens = async (
  address: Address,
  dispenserOpts: Parameters<typeof getDispenserPayload>[1] = {}
) => {
  const { amount, deadline, signature } = await getDispenserPayload(
    address,
    dispenserOpts
  )

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

  return finalPayload
}
