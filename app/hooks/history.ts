"use client"

import { useRouter } from "next/navigation"
import { useEffect, useId } from "react"

export const useModalQueryHistory = ({
  id,
  open,
  onOpenChange,
  queryName,
}: {
  id?: string
  open?: boolean
  queryName: string
  onOpenChange?: (open: boolean) => void
}) => {
  const router = useRouter()
  const reactId = useId()
  const ID = id || reactId

  const getWindowParams = () => new URLSearchParams(location.search)
  const getOpenDialogKeys = () => {
    return getWindowParams().get(queryName)?.split(",").filter(Boolean) || []
  }

  useEffect(() => {
    const params = getWindowParams()
    const openDialogKeys = getOpenDialogKeys()
    const isLastOpenedDialog = openDialogKeys.at(-1) === ID

    if (open) {
      // Remove duplicate keys for ID
      const filteredKeys = openDialogKeys.filter((k) => k !== ID)
      const keys = open ? [...filteredKeys, ID] : filteredKeys
      params.set(queryName, keys.join(","))
      router.push(`?${params.toString()}`, {
        scroll: false,
      })
    } else if (isLastOpenedDialog) {
      // Navitate back if this is the last opened dialog
      router.back()
    }
  }, [ID, open, queryName])

  useEffect(() => {
    console.debug(`Listening route changes for ${queryName}: ${ID}`)

    function handleRouteChange(_: PopStateEvent) {
      const openDialogKeys = getOpenDialogKeys()
      const isNotOpenedDialogKey = !openDialogKeys.includes(ID)

      if (isNotOpenedDialogKey && open) {
        // Close when dialog key is removed from URL
        // Or when there are no dialog keys "open"
        onOpenChange?.(false)
      }
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [ID, open, queryName])

  return {
    open,
    onOpenChange,
  }
}
