"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { generateUUID } from "@/lib/utils"

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

  const ID = useMemo(() => {
    // Freaking react id was sooo annoying to use here
    return id ? id : generateUUID().slice(0, 6)
  }, [id])

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
    } else if (isLastOpenedDialog && history.length > 1) {
      // Navitate back if this is the last opened dialog
      // And there is history to go back to
      router.back()
    }
  }, [open])

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
