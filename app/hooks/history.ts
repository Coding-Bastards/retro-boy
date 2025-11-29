"use client"

import { useRouter } from "next/navigation"
import { atom, useAtom } from "jotai"
import { useEffect, useMemo, useState } from "react"
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

      // Try remove last history entry
      setHistory((prev) => {
        const isAppEntryPoint = prev.length === 1 && prev.at(0) === "/"
        // Prevent removing the initial entrypoint
        return isAppEntryPoint ? prev : prev.slice(0, -1)
      })
    }

    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [historySize])

  return {
    nextRouter: router,
    replace: router.replace,
    back: router.back,
    historySize,
    history,
    push,
  }
}

export const useModalQueryHistory = ({
  id,
  // Force controlled open state
  open = false,
  onOpenChange,
  queryName,
}: {
  id?: string
  open?: boolean
  queryName: string
  onOpenChange?: (open: boolean) => void
}) => {
  const [ready, setReady] = useState(false)
  const { historySize, ...router } = useTrackableRouter()

  const ID = useMemo(() => {
    // Freaking react id was sooo annoying to use here
    return id ? id : generateUUID().slice(0, 6)
  }, [id])

  const getWindowParams = () => new URLSearchParams(location.search)
  const getOpenDialogKeys = () => {
    return getWindowParams().get(queryName)?.split(",").filter(Boolean) || []
  }

  function onOpenChangeWrapper(willOpen: boolean) {
    // Regular onOpenChange callback
    onOpenChange?.(willOpen)

    // Early exit - Handled by useEffect when opening
    if (willOpen) return

    const openKeys = getOpenDialogKeys()
    const isLastPushedKey = openKeys.at(-1) === ID
    if (isLastPushedKey && historySize > 0) {
      // Navitate back if this is the last opened item
      // And there is history to go back to
      router.back()
    }
  }

  useEffect(() => {
    // Early exit if not ready
    if (!ready) return

    const openDialogKeys = getOpenDialogKeys()
    const isNotInURL = !openDialogKeys.includes(ID)

    // Sync URL when open prop changes externally
    if (open && isNotInURL) {
      const params = getWindowParams()
      const keys = [...openDialogKeys.filter((k) => k !== ID), ID]
      params.set(queryName, keys.join(","))
      router.push(`?${params.toString()}`)
    }
  }, [open, ID, queryName, ready])

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

  useEffect(() => {
    // Wait for initial load + jotai sync
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return {
    open,
    onOpenChange: onOpenChangeWrapper,
  }
}
