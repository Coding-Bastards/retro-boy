"use client"

import { Fragment } from "react/jsx-runtime"
import dynamic from "next/dynamic"

import Emulator from "@/components/Emulator"
import MarketPage from "@/components/MarketPage"
import GamePage from "@/components/GamePage"

import GameCatalogue from "./components/GameCatalogue"
import DialogFriends from "./components/DialogFriends"
import DrawerBoard from "./components/DrawerBoard"
import QueryRouter from "./QueryRouter"

import Footer from "./Footer"

const TopNavigation = dynamic(() => import("./components/TopNavigation"), {
  ssr: false,
  loading: () => (
    <div className="h-13 flex pb-5 px-px w-full">
      <div className="w-full animate-pulse rounded-lg bg-white/5" />
    </div>
  ),
})

export default function Home() {
  return (
    <Fragment>
      <QueryRouter>
        <QueryRouter.Page param="market">
          <MarketPage />
        </QueryRouter.Page>
        <QueryRouter.Page param="game">
          <GamePage />
        </QueryRouter.Page>
      </QueryRouter>

      <GameCatalogue />
      <DrawerBoard />
      <DialogFriends />

      <main className="max-w-md h-dvh overflow-hidden p-5 mx-auto">
        <TopNavigation />
        <Emulator />
      </main>

      <Footer />
    </Fragment>
  )
}
