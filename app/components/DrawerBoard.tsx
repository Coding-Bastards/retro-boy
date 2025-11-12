"use client"

import type { Address } from "viem"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer"
import { useAtomIsBoardOpen } from "@/app/lib/store"
import { beautifyAddress, cn } from "@/app/lib/utils"
import { localizeNumber, numberToShortWords } from "@/app/lib/numbers"

import { MdPerson } from "react-icons/md"

import Button from "./Button"
import AddressBlock from "./AddressBlock"
import { useWorldAuth } from "@radish-la/world-auth"
import { Fragment } from "react/jsx-runtime"

interface Player {
  address: Address
  timePlayed: string
  rbcPoints: number
}

function PlayerItem({
  player,
  position,
  isConnectedUser,
  className,
}: {
  player: Player
  position: number
  isConnectedUser?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        isConnectedUser
          ? "bg-rb-green/10 border border-rb-green/30"
          : "bg-rb-dark",
        className
      )}
    >
      <div
        className={cn(
          "text-xl PositionContainer font-black shrink-0 w-8 whitespace-nowrap text-center",
          isConnectedUser ? "text-rb-green" : "text-white/40"
        )}
      >
        #{numberToShortWords(position)}
      </div>

      <AddressBlock address={player.address} size={10} />

      <div className="flex-1 grow">
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-sm">
            {beautifyAddress(player.address, 4, "")}
          </span>
          {isConnectedUser && (
            <span className="text-xs font-black text-rb-green">(YOU)</span>
          )}
        </div>
        <div className="text-xs text-white/60">{player.timePlayed}</div>
      </div>

      <div className="text-right">
        <div
          className={cn(
            "font-black text-sm",
            isConnectedUser ? "text-rb-green" : "text-white"
          )}
        >
          {localizeNumber(player.rbcPoints)}
        </div>
        <div className="text-xs text-white/40">RBC</div>
      </div>
    </div>
  )
}

const MOCK_PLAYERS: Player[] = [
  {
    address: "0x163f8c2467924be0ae7b5347228cabf260318753" as Address,
    timePlayed: "24h 30m",
    rbcPoints: 1250,
  },
  {
    address: "0x2234567890123456789012345678901234567890" as Address,
    timePlayed: "18h 45m",
    rbcPoints: 980,
  },
  {
    address: "0x3334567890123456789012345678901234567890" as Address,
    timePlayed: "15h 20m",
    rbcPoints: 750,
  },
  {
    address: "0x4434567890123456789012345678901234567890" as Address,
    timePlayed: "12h 10m",
    rbcPoints: 620,
  },
  {
    address: "0x5534567890123456789012345678901234567890" as Address,
    timePlayed: "10h 05m",
    rbcPoints: 510,
  },
]

export default function DrawerBoard() {
  const [open, setOpen] = useAtomIsBoardOpen()
  const { address } = useWorldAuth()

  const isInTopBoard = MOCK_PLAYERS.some((p) => p.address === address)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white text-center uppercase font-black">
            TOP PLAYERS (
            <span className="inline-flex items-center gap-1">
              <span>3.5K</span>
              <MdPerson />
            </span>
            )
          </DrawerTitle>
        </DrawerHeader>

        <div className="grow flex flex-col gap-2 overflow-y-auto px-4">
          {[...MOCK_PLAYERS, ...MOCK_PLAYERS].map((player, index) => (
            <PlayerItem
              key={`board-player-${player.address}`}
              player={player}
              position={index + 1}
              isConnectedUser={player.address === address}
            />
          ))}

          {isInTopBoard || !address ? null : (
            <Fragment>
              <div className="h-px w-full shrink-0 bg-white/15 my-2" />

              <PlayerItem
                isConnectedUser
                className="[&_.PositionContainer]:w-auto [&_.AddressBlock]:border-black"
                player={{
                  address,
                  rbcPoints: 4,
                  timePlayed: "12h 34m", // Format to seconds later :/
                }}
                position={5420}
              />
            </Fragment>
          )}
          <div className="my-2" />
        </div>

        <div className="px-4 pt-3 pb-6">
          <Button onClick={() => setOpen(false)}>CONTINUE PLAYING</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
