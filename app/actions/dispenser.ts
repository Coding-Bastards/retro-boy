"use server"

import { type Address, encodePacked, keccak256 } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { worldchain } from "viem/chains"

import { clientWorldchain } from "@/lib/world"
import { ADDRESS_DISPENSER, ZERO } from "@/lib/constants"
import { ABI_DISPENSER } from "@/lib/abi"

import { getPlayerData } from "./player"

const account = privateKeyToAccount(
  process.env.PK_OFFCHAIN_SIGNER as `0x${string}`
)

export async function getDispenserPayload(address: Address) {
  const [playerData, claimed, nonce] = await Promise.all([
    getPlayerData(address),
    clientWorldchain.readContract({
      abi: ABI_DISPENSER,
      functionName: "claimed",
      address: ADDRESS_DISPENSER,
      args: [address],
    }),
    clientWorldchain.readContract({
      abi: ABI_DISPENSER,
      functionName: "nonces",
      address: ADDRESS_DISPENSER,
      args: [address],
    }),
  ])

  // convert 6decimal to 18decimals
  const totalPoints = BigInt(playerData?.totalPoints || 0) * BigInt(1e12)
  const claimableAmount = totalPoints > claimed ? totalPoints - claimed : ZERO
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300) // 5 minutes
  const encoded = encodePacked(
    [
      "string",
      "uint256",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      "RBCDispenser",
      BigInt(worldchain.id),
      ADDRESS_DISPENSER,
      address,
      nonce,
      claimableAmount,
      deadline,
    ]
  )

  const signature = await account.signMessage({
    message: { raw: keccak256(encoded) },
  })

  return { signature, amount: claimableAmount, deadline }
}
