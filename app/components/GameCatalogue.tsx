"use client"

import { useAtom } from "jotai"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { catalogueOpenAtom } from "@/app/lib/store"
import { useOwnedGames } from "@/app/lib/games"

interface GameCatalogueProps {
  onSelectGame: () => void
}

export default function GameCatalogue({ onSelectGame }: GameCatalogueProps) {
  const [open, setOpen] = useAtom(catalogueOpenAtom)
  const { games: ownedGames } = useOwnedGames()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md min-h-[calc(85vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white text-center uppercase font-black">
            GAMES (5)
          </DrawerTitle>
        </DrawerHeader>

        {/* Horizontal Scroll Games */}
        <div className="overflow-x-auto shrink-0 px-4 pb-6 pt-2 snap-x snap-mandatory">
          <div className="flex gap-4">
            {ownedGames.map((game) => (
              <button
                onClick={() => {
                  onSelectGame()
                  setOpen(false)
                }}
                key={`game-${game.collectionId}`}
                className="flex flex-col gap-2 p-4 bg-rb-dark rounded-lg active:scale-98 min-w-[calc(100vw-4rem)] max-w-[calc(100vw-4rem)] snap-center"
              >
                {/* Cover Image */}
                <div className="aspect-square bg-rb-lcd rounded-md flex items-center justify-center text-black/20 font-black text-xs">
                  COVER
                </div>

                {/* Game Info */}
                <div className="flex flex-col gap-1 text-left">
                  <h3 className="text-white text-sm font-bold line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{game.playTime}</span>
                    <div className="text-yellow-400">
                      {"★".repeat(game.stars)}
                      {"☆".repeat(5 - game.stars)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <div className="w-2 shrink-0" />
          </div>
        </div>

        <div className="grow" />

        {/* Get More Games Button */}
        <div className="px-4 pt-1 pb-6">
          <button className="w-full bg-rb-green text-black font-black uppercase py-4 rounded-lg hover:opacity-95 transition-opacity active:scale-98">
            GAME MARKET
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
