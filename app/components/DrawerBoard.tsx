"use client"

import type { Address } from "viem"
import { Fragment } from "react/jsx-runtime"
import { useWorldAuth } from "@radish-la/world-auth"
import useSWR from "swr"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import { useAtomIsBoardOpen } from "@/lib/store"
import { beautifyAddress, cn } from "@/lib/utils"
import { localizeNumber, numberToShortWords } from "@/lib/numbers"

import { MdPerson } from "react-icons/md"

import { clientWorldchain } from "@/lib/world"
import { ABI_REGISTRY } from "@/lib/abi"
import { ADDRESS_GAME_REGISTRY } from "@/lib/constants"

import Button from "./Button"
import AddressBlock from "./AddressBlock"

interface Player {
  address: Address
  timePlayed: string
  rbcPoints: number
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

  const { data: totalUniquePlayers = 0 } = useSWR(
    `unique-players`,
    async () => {
      const uniquePlayers = await clientWorldchain.readContract({
        abi: ABI_REGISTRY,
        functionName: "getUniqueUsersCount",
        address: ADDRESS_GAME_REGISTRY,
      })

      return Number(uniquePlayers)
    }
  )

  const isInTopBoard = MOCK_PLAYERS.some((p) => p.address === address)

  const BOARD = [...MOCK_PLAYERS, ...MOCK_PLAYERS]

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle className="text-white text-center uppercase font-black">
            TOP PLAYERS (
            <span className="inline-flex items-center gap-1">
              <span>{numberToShortWords(totalUniquePlayers)}</span>
              <MdPerson />
            </span>
            )
          </DrawerTitle>
        </DrawerHeader>

        <div className="grow flex flex-col gap-2 overflow-y-auto px-4">
          {isInTopBoard || !address ? null : (
            <Fragment>
              <PlayerItem
                isConnectedUser
                isOutsideBoard
                player={{
                  address,
                  rbcPoints: 4,
                  timePlayed: "12h 34m", // Format to seconds later :/
                }}
                position={5420}
              />

              <div className="h-px w-full shrink-0 bg-white/10 my-3" />
            </Fragment>
          )}

          {BOARD.map((player, index) => (
            <PlayerItem
              key={`board-player-${player.address}-${index}`}
              player={player}
              position={index + 1}
              isConnectedUser={player.address === address}
            />
          ))}

          <div className="my-2" />
        </div>

        <div className="px-4 pt-3 pb-6">
          <Button onClick={() => setOpen(false)}>CONTINUE PLAYING</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function PlayerItem({
  player,
  position,
  isConnectedUser,
  isOutsideBoard,
}: {
  player: Player
  position: number
  isConnectedUser?: boolean
  isOutsideBoard?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        isConnectedUser
          ? "bg-rb-green/10 border border-rb-green/30"
          : "bg-rb-dark"
      )}
    >
      <div>
        {isOutsideBoard ? (
          <h2 className="text-xs text-white font-black mt-1">POS</h2>
        ) : null}
        <div
          className={cn(
            "font-black shrink-0 whitespace-nowrap text-center",
            isConnectedUser ? "text-rb-green" : "text-white/40",
            isOutsideBoard ? "text-base -mt-1 mr-2" : "text-xl w-8"
          )}
        >
          #{position}
        </div>
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
