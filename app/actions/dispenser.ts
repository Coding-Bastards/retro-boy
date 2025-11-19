"use server"

import {
  type Address,
  encodePacked,
  keccak256,
  parseAbi,
  parseEther,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { worldchain } from "viem/chains"

import { clientWorldchain } from "@/lib/world"
import { ADDRESS_DISPENSER } from "@/lib/constants"
import { getPlayerData } from "./player"

const account = privateKeyToAccount(
  process.env.PK_OFFCHAIN_SIGNER as `0x${string}`
)

const ABI_DISPENSER = parseAbi([
  "function claim(uint256 amount, uint256 deadline, bytes calldata signature) external",
  "function nonces(address) public view returns (uint256)",
  "function claimed(address) view returns (uint256)",
])

export async function getDispenserPayload(address: Address) {
  const [playerData, nonce] = await Promise.all([
    getPlayerData(address),
    clientWorldchain.readContract({
      abi: ABI_DISPENSER,
      functionName: "nonces",
      address: ADDRESS_DISPENSER,
      args: [address],
    }),
  ])

  const amount = parseEther(`${playerData?.totalPoints || 0}`)
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
      amount,
      deadline,
    ]
  )

  const signature = await account.signMessage({
    message: { raw: keccak256(encoded) },
  })

  return { signature, amount, deadline }
}
