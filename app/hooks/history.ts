"use client"

import { useRouter } from "next/navigation"
import { atom, useAtom } from "jotai"
import { useEffect, useMemo } from "react"
import { generateUUID } from "@/lib/utils"

const atomHistory = atom<string[]>([])
export const useTrackableRouter = () => {
  const router = useRouter()
  const [history, setHistory] = useAtom(atomHistory)
  const historySize = history.length

  const push = (path: string) => {
    setHistory((prev) => [...prev, path])
    router.push(path, {
      scroll: false,
    })
  }

  useEffect(() => {
    function handlePopState(_: PopStateEvent) {
      console.debug("Pop state detected", {
        currentHistorySize: historySize,
        nextHistorySize: Math.max(0, historySize - 1),
      })
      // Remove last history entry
      setHistory((prev) => prev.slice(0, -1))
    }

    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [historySize])

  return {
    replace: router.replace,
    back: router.back,
    historySize: history.length,
    history,
    push,
  }
}

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
  const router = useTrackableRouter()
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
      router.push(`?${params.toString()}`)
    } else if (isLastOpenedDialog && history.length > 1) {
      // Navitate back if this is the last opened dialog
      // And there is history to go back to
      router.back()
    }
  }, [open])

  useEffect(() => {
    function handleRouteChange(_: PopStateEvent) {
      // console.debug(`Changed - ${queryName}: ${ID}`)
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
