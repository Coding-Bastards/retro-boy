"use client"

import { Fragment } from "react/jsx-runtime"

import Emulator from "@/components/Emulator"
import MarketPage from "@/components/MarketPage"
import GamePage from "@/components/GamePage"

import GameCatalogue from "./components/GameCatalogue"
import DrawerBoard from "./components/DrawerBoard"
import TopNavigation from "./components/TopNavigation"
import QueryRouter from "./QueryRouter"

import Footer from "./Footer"

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

      <main className="max-w-md h-dvh overflow-hidden p-5 mx-auto">
        <TopNavigation />
        <Emulator />
      </main>

      <Footer />
    </Fragment>
  )
}
