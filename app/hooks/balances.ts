"use client"

import { erc20Abi, formatUnits, type Address } from "viem"
import useSWR from "swr"

import { TOKENS } from "@/lib/tokens"
import { ZERO } from "@/lib/constants"
import { clientWorldchain } from "@/lib/world"

export const useAccountBalancess = (address?: Address) => {
  const { data = null } = useSWR(
    address ? `balances.${address}` : null,
    async () => {
      if (!address) return null
      const [wld, rbc] = await clientWorldchain.multicall({
        contracts: [
          {
            abi: erc20Abi,
            address: TOKENS.WLD.ADDRESS,
            functionName: "balanceOf",
            args: [address],
          },
          {
            abi: erc20Abi,
            address: TOKENS.RBC.ADDRESS,
            functionName: "balanceOf",
            args: [address],
          },
        ],
      })

      return {
        WLD: wld.result || ZERO,
        RBC: rbc.result || ZERO,
      }
    },
    {
      refreshInterval: 5_000, // 5 seconds
    }
  )

  const formatBalance = (value: bigint = ZERO, decimals: number) => ({
    value,
    decimals,
    formatted: formatUnits(value, decimals),
  })

  return {
    WLD: formatBalance(data?.WLD, TOKENS.WLD.DECIMALS),
    RBC: formatBalance(data?.RBC, TOKENS.RBC.DECIMALS),
  }
}
