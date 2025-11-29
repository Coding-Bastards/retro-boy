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
  const { history, nextRouter } = useTrackableRouter()
  const searchParams = useSearchParams()

  const isPartOfParams = searchParams.has(param)
  const isInTrackableHistory = history.some((path) =>
    path.includes(`${param}=`)
  )

  useEffect(() => {
    if (isPartOfParams && !isInTrackableHistory) {
      // Remove param if not part of trackable history
      const params = new URLSearchParams(searchParams.toString())
      params.delete(param)

      nextRouter.replace(`${window.location.pathname}?${params.toString()}`, {
        scroll: false,
      })
    }
  }, [isPartOfParams, param, searchParams, isInTrackableHistory])

  const isActive =
    // Ensure to only show when internal router was pushed
    isPartOfParams && isInTrackableHistory

  return isActive ? children : null
}

export default function QueryRouter({ children }: PropsWithChildren) {
  return <Suspense fallback={null}>{children}</Suspense>
}

QueryRouter.Page = QueryPage
