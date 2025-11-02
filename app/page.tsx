"use client"

import { useSetAtom } from "jotai"
import Game from "@/app/components/Game"
import { catalogueOpenAtom } from "@/app/lib/store"

import { ImFolderDownload } from "react-icons/im"
import { MdLeaderboard } from "react-icons/md"
import { PiHandbagSimpleFill } from "react-icons/pi"

export default function Home() {
  const setCatalogueOpen = useSetAtom(catalogueOpenAtom)

  return (
    <main className="max-w-md mx-auto">
      <Game />
      <div className="bg-black fixed bottom-0 left-0 right-0">
        <div className="h-6 border-b-4 border-white/7 bg-[#161616] rounded-b-4xl w-full" />
        <nav className="max-w-md [&_button]:pb-5 grid grid-cols-3 text-white h-20 w-full mx-auto">
          <button className="flex gap-0.5 opacity-25 active:opacity-100 flex-col items-center justify-center">
            <div className="size-9 flex justify-center items-end">
              <PiHandbagSimpleFill className="text-xl" />
            </div>
            <span className="uppercase text-xs font-black">Market</span>
          </button>

          <button className="flex gap-0.5 opacity-25 active:opacity-100 flex-col items-center justify-center">
            <div className="size-9 flex justify-center items-end">
              <MdLeaderboard className="text-xl scale-105" />
            </div>
            <span className="uppercase text-xs font-black">BOARD</span>
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
        </nav>
      </div>
    </main>
  )
}
