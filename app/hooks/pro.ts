"use client"

import useSWR from "swr"
import { useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"
import { atomWithStorage } from "jotai/utils"

import { isDevEnv } from "@/lib/env"
import { jsonify } from "@/lib/utils"

const atomIsFeatureStatesEnabled = atomWithStorage(
  "rb.feature.save-states.enabled",
  false
)

export const useProFeatures = () => {
  const { address } = useWorldAuth()
  const { status: remoteData } = useRemoteProStatus(address)

  const [isFeatureEnabled, setIsFeatureEnabled] = useAtom(
    atomIsFeatureStatesEnabled
  )

  // Pro when in local env, or user bought it
  const isProUser = remoteData?.isProUser || isFeatureEnabled || isDevEnv()
  return {
    migrateToPro: () => setIsFeatureEnabled(true),
    isProUser,
  }
}

export const useRemoteProStatus = (address?: string | null) => {
  const { data: status = null } = useSWR(
    address ? `is.pro.${address}` : null,
    async () => {
      if (!address) return null

      // Fetch remote status @ alchemy SDK
      return await jsonify<{
        isProUser: boolean
        price: string
      }>(fetch(`/api/features/pro/${address}`))
    }
  )

  return {
    status,
  }
}
