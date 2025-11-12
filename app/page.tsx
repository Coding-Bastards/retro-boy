"use client"

import { Fragment } from "react/jsx-runtime"

import { useEmulator } from "./lib/EmulatorContext"
import { useAppRouter } from "./lib/routes"

import Game from "@/app/components/Game"
import MarketPage from "@/app/components/Market"
import GamePage from "@/app/components/GamePage"

import GameCatalogue from "./components/GameCatalogue"
import DrawerBoard from "./components/DrawerBoard"
import TopNavigation from "./components/TopNavigation"
import QueryRouter from "./QueryRouter"

import Footer from "./Footer"

export default function Home() {
  const { pushGamePage } = useAppRouter()
  const { isGameLoaded } = useEmulator()

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

      <GameCatalogue onSelectGame={pushGamePage} />
      <DrawerBoard />

      <main className="max-w-md p-5 mx-auto">
        <TopNavigation isActiveLight={isGameLoaded} />
        <Game />
      </main>

      <Footer />
    </Fragment>
  )
}
