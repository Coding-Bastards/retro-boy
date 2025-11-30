"use client"

import useSWR from "swr"
import { useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"
import { atomWithStorage } from "jotai/utils"

import { isDev } from "@/lib/env"
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
  const isProUser = remoteData?.isProUser || isFeatureEnabled || isDev()
  return {
    migrateToPro: () => setIsFeatureEnabled(true),
    isProUser,
  }
}

export const useRemoteProStatus = (address?: string | null) => {
  const { data: status = null } = useSWR(
    address ? `/api/features/pro/${address}` : null,
    async (url) => {
      // Fetch remote status on-chain
      return await jsonify<{
        isProUser: boolean
        price: string
      }>(fetch(url))
    }
  )

  return {
    status,
  }
}
