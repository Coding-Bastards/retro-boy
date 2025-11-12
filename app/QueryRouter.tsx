"use client"

import { Suspense, type PropsWithChildren, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"

function QueryPage({
  param,
  children,
}: {
  param: string
  children: ReactNode
}) {
  const searchParams = useSearchParams()
  const isActive = searchParams.has(param)
  return isActive ? children : null
}

export default function QueryRouter({ children }: PropsWithChildren) {
  return <Suspense fallback={null}>{children}</Suspense>
}

QueryRouter.Page = QueryPage
