"use client"

import { useRouter } from "next/navigation"
import { IoArrowBack } from "react-icons/io5"
import type { ReactNode } from "react"

interface PageContainerProps {
  title: string
  children: ReactNode
  endTitleEnhancer?: ReactNode
}

export default function PageContainer({
  title,
  children,
  endTitleEnhancer,
}: PageContainerProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="fixed inset-0 z-60 pointer-events-auto! bg-rb-darker">
      <div className="flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 border-b border-white/10 h-18 pt-1 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-white/80 hover:text-white transition-colors"
          >
            <IoArrowBack className="text-2xl" />
          </button>

          <h1 className="text-white uppercase font-black text-xl flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </h1>

          {endTitleEnhancer || <div className="w-6" />}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
