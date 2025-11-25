"use client"

import { erc20Abi, formatEther, formatUnits, type Address } from "viem"
import useSWR from "swr"

import { TOKENS } from "@/lib/tokens"
import { ADDRESS_DISPENSER, ZERO } from "@/lib/constants"
import { clientWorldchain } from "@/lib/world"
import { ABI_DISPENSER } from "@/lib/abi"

import { useAccountPoints } from "./points"

export const useAccountBalances = (address?: Address) => {
  const { data = null, ...query } = useSWR(
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
    ...query,
    WLD: formatBalance(data?.WLD, TOKENS.WLD.DECIMALS),
    RBC: formatBalance(data?.RBC, TOKENS.RBC.DECIMALS),
  }
}

export const useClaimedRBCPoints = (address?: Address) => {
  const { points } = useAccountPoints()
  const { data: claimedPoints = null, ...query } = useSWR(
    // Revalidate when points change
    address ? `claimed.fs.${address}.${Math.round(points)}` : null,
    async () => {
      if (!address) return null
      const claimed = await clientWorldchain.readContract({
        address: ADDRESS_DISPENSER,
        functionName: "claimed",
        abi: ABI_DISPENSER,
        args: [address],
      })

      return {
        formatted: Number(formatEther(claimed)),
        value: claimed,
      }
    }
  )

  return {
    ...query,
    claimed: {
      value: claimedPoints?.value || BigInt(0),
      formatted: claimedPoints?.formatted || 0,
    },
  }
}
