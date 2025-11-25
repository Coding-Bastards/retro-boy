"use client"

import { useAtomIsBoardOpen, useAtomIsCatalogueOpen } from "@/lib/store"
import { useAppRouter } from "@/lib/routes"

import { ImFolderDownload } from "react-icons/im"
import { MdLeaderboard } from "react-icons/md"
import { PiHandbagSimpleFill } from "react-icons/pi"

export default function Footer() {
  const [, setCatalogueOpen] = useAtomIsCatalogueOpen()
  const [, setBoardOpen] = useAtomIsBoardOpen()
  const { pushMarketPage } = useAppRouter()

  return (
    <div className="bg-black fixed z-5 bottom-safe-bottom left-0 right-0">
      <div className="h-6 border-b-4 border-white/7 bg-rb-black rounded-b-4xl w-full" />
      <nav className="max-w-md [&_button]:pb-5 grid grid-cols-3 text-white h-20 w-full mx-auto">
        <button
          onClick={pushMarketPage}
          id="market-button"
          className="flex gap-0.5 opacity-25 active:opacity-100 flex-col items-center justify-center"
        >
          <div className="size-9 flex justify-center items-end">
            <PiHandbagSimpleFill className="text-xl" />
          </div>
          <span className="uppercase text-xs font-black">MARKET</span>
        </button>

        <button
          onClick={() => setCatalogueOpen(true)}
          className="flex gap-0.5 opacity-25 active:opacity-100 flex-col items-center justify-center"
        >
          <div className="size-9 flex justify-center items-end">
            <ImFolderDownload className="text-xl scale-95" />
          </div>
          <span className="uppercase text-xs font-black">GAME/ROM</span>
        </button>

        <button
          onClick={() => setBoardOpen(true)}
          className="flex gap-0.5 opacity-25 active:opacity-100 flex-col items-center justify-center"
        >
          <div className="size-9 flex justify-center items-end">
            <MdLeaderboard className="text-xl scale-105" />
          </div>
          <span className="uppercase text-xs font-black">BOARD</span>
        </button>
      </nav>
    </div>
  )
}
