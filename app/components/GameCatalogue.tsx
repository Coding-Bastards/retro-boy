"use client"

import { useAtom } from "jotai"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { catalogueOpenAtom } from "@/app/lib/store"

interface Game {
  id: string
  title: string
  playTime: string
  stars: number
  cover: string
}

const MOCK_GAMES: Game[] = [
  {
    id: "1",
    title: "Tobu Tobu Girl DX",
    playTime: "2h 30m",
    stars: 5,
    cover: "/game-covers/tobutobugirl.png",
  },
  {
    id: "2",
    title: "Adventure Quest",
    playTime: "5h 15m",
    stars: 4,
    cover: "/game-covers/adventure.png",
  },
  {
    id: "3",
    title: "Pixel Racer",
    playTime: "1h 45m",
    stars: 5,
    cover: "/game-covers/racer.png",
  },
  {
    id: "4",
    title: "Retro Legends",
    playTime: "3h 20m",
    stars: 4,
    cover: "/game-covers/legends.png",
  },
]

interface GameCatalogueProps {
  onSelectGame: () => void
}

export default function GameCatalogue({ onSelectGame }: GameCatalogueProps) {
  const [open, setOpen] = useAtom(catalogueOpenAtom)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md mx-auto bg-[#1a1a1a] border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white text-center uppercase font-black">
            YOUR GAMES
          </DrawerTitle>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-4 pb-8">
          {MOCK_GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                onSelectGame()
                setOpen(false)
              }}
              className="flex flex-col gap-2 p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors active:scale-95"
            >
              {/* Cover Image */}
              <div className="aspect-square bg-[#8b956d] rounded-md flex items-center justify-center text-black/20 font-black text-xs">
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
        </div>
      </DrawerContent>
    </Drawer>
  )
}
