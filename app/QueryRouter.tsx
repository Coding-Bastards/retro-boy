"use client"

import {
  Suspense,
  useEffect,
  type PropsWithChildren,
  type ReactNode,
} from "react"
import { useTrackableRouter } from "@/hooks/history"
import { useSearchParams } from "next/navigation"

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

export default function QueryRouter({ children }: PropsWithChildren) {
  const { history, replace } = useTrackableRouter()

  useEffect(() => {
    // Early exit if we have pushed any history
    if (history.length > 0) return

    const params = new URLSearchParams(location.search)
    const entries = Array.from(params.entries())
    if (entries.length > 0) replace("/")
  }, [history])

  return <Suspense fallback={null}>{children}</Suspense>
}

QueryRouter.Page = QueryPage
