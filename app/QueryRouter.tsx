"use client"

import type { PropsWithChildren, ReactNode } from "react"
import { Suspense, useEffect } from "react"
import { atom, useAtom } from "jotai"

import { useSearchParams } from "next/navigation"
import { useTrackableRouter } from "@/hooks/history"

function QueryPage({
  param,
  children,
}: {
  param: string
  children: ReactNode
}) {
  const { history } = useTrackableRouter()
  const searchParams = useSearchParams()

  const isPartOfParams = searchParams.has(param)
  const isInTrackableHistory = history.some((path) =>
    path.includes(`${param}=`)
  )

  const isActive =
    // Ensure to only show when internal router was pushed
    isPartOfParams && isInTrackableHistory

  return isActive ? children : null
}

const atomIsClearedUp = atom(false)
export default function QueryRouter({ children }: PropsWithChildren) {
  const [isCleared, setIsCleared] = useAtom(atomIsClearedUp)
  const { history, ...router } = useTrackableRouter()

  useEffect(() => {
    // Early exit if we have pushed any history
    // Or if we already cleared up
    if (history.length > 0 || isCleared) return

    const params = new URLSearchParams(location.search)
    const entries = Array.from(params.entries())
    if (entries.length > 0) {
      setIsCleared(true)
      // Append a fresh history entrypoint
      // This is a work around for mini app envs that
      // stale browser history when re-opening the app
      router.push("/")
    }
  }, [isCleared, history])

  return <Suspense fallback={null}>{children}</Suspense>
}

QueryRouter.Page = QueryPage
