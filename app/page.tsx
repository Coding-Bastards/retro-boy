"use client"

import { Fragment } from "react/jsx-runtime"
import { useRouter } from "next/navigation"

import { useSetAtom } from "jotai"
import { catalogueOpenAtom, boardOpenAtom } from "@/app/lib/store"

import { ImFolderDownload } from "react-icons/im"
import { MdLeaderboard } from "react-icons/md"
import { PiHandbagSimpleFill } from "react-icons/pi"

import Game from "@/app/components/Game"
import Market from "@/app/components/Market"
import GamePage from "@/app/components/GamePage"

import GameCatalogue from "./components/GameCatalogue"
import DrawerBoard from "./components/DrawerBoard"
import TopNavigation from "./components/TopNavigation"

export default function Home() {
  const router = useRouter()
  const setCatalogueOpen = useSetAtom(catalogueOpenAtom)
  const setBoardOpen = useSetAtom(boardOpenAtom)

  const openMarket = () => {
    router.push("?market=open")
  }

  return (
    <Fragment>
      <Market />
      <GamePage />
      <GameCatalogue
        onSelectGame={(gameCollectionId) => {
          // Show game page
          router.push(`?game=${gameCollectionId}`)
        }}
      />
      <DrawerBoard />

      <main className="max-w-md p-5 mx-auto">
        <TopNavigation isActiveLight />

        <Game />

        <div className="bg-black fixed bottom-0 left-0 right-0">
          <div className="h-6 border-b-4 border-white/7 bg-rb-black rounded-b-4xl w-full" />
          <nav className="max-w-md [&_button]:pb-5 grid grid-cols-3 text-white h-20 w-full mx-auto">
            <button
              onClick={openMarket}
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
      </main>
    </Fragment>
  )
}
