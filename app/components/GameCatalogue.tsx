"use client"

import { useAtom } from "jotai"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { catalogueOpenAtom } from "@/app/lib/store"
import { useOwnedGames } from "@/app/lib/games"
import { BiSolidInvader } from "react-icons/bi"
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"
import { cn } from "../lib/utils"

interface GameCatalogueProps {
  onSelectGame: () => void
}

export default function GameCatalogue({ onSelectGame }: GameCatalogueProps) {
  const [open, setOpen] = useAtom(catalogueOpenAtom)
  const { games: ownedGames, isEmpty } = useOwnedGames()
  const isOwnedOneSingleGame = ownedGames.length === 1

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md min-h-[calc(85vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader>
          <DrawerTitle
            className={cn(
              isEmpty && "hidden",
              "text-white text-center uppercase font-black"
            )}
          >
            GAMES ({ownedGames.length})
          </DrawerTitle>
        </DrawerHeader>

        {isEmpty ? (
          <div className="flex p-6 gap-4 flex-col text-white/60 items-center justify-center">
            <BiSolidInvader className="text-5xl" />
            <p className="text-sm text-center max-w-xs">
              Your game library is empty. Get some games from the Market!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shrink-0 px-4 pb-6 pt-2 snap-x snap-mandatory">
            <div className="flex gap-4">
              {ownedGames.map((game) => (
                <button
                  onClick={() => {
                    onSelectGame()
                    setOpen(false)
                  }}
                  key={`game-${game.collectionId}`}
                  className={cn(
                    isOwnedOneSingleGame || "max-w-[calc(100vw-4rem)]",
                    "flex flex-col gap-2 p-4 bg-rb-dark rounded-lg active:scale-98 w-full shrink-0 snap-center"
                  )}
                >
                  {/* Cover Image */}
                  <div className="aspect-square bg-rb-lcd rounded-md flex items-center justify-center text-black/35 font-black text-lg">
                    GAME COVER
                  </div>

                  {/* Game Info */}
                  <div className="flex flex-col gap-1 text-left">
                    <h3 className="text-white text-sm font-bold line-clamp-1">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">{game.playTime}</span>
                      <div className="flex gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }, (_, i) => {
                          const starValue = i + 1
                          const StarIcon =
                            game.stars >= starValue
                              ? FaStar
                              : game.stars >= starValue - 0.5
                              ? FaStarHalfAlt
                              : FaRegStar
                          return (
                            <StarIcon key={`rate-${game.collectionId}-${i}`} />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {isOwnedOneSingleGame || <div className="w-2 shrink-0" />}
            </div>
          </div>
        )}

        <div className="grow" />

        <div className="px-4 pt-1 pb-6">
          <button className="w-full bg-rb-green text-black font-black uppercase py-4 rounded-lg hover:opacity-95 transition-opacity active:scale-98">
            GAME MARKET
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
