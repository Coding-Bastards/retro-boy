"use client"

import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { isDev } from "@/lib/env"

const atomIsFeatureStatesEnabled = atomWithStorage(
  "rb.feature.save-states.enabled",
  false
)

export const useProFeatures = () => {
  const [isFeatureEnabled, setIsFeatureEnabled] = useAtom(
    atomIsFeatureStatesEnabled
  )

  // Pro when in local env, or user bought it
  const isProUser = isFeatureEnabled || isDev()
  return {
    migrateToPro: () => setIsFeatureEnabled(true),
    isProUser,
  }
}
