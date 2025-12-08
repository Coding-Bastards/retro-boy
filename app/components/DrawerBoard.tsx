"use client"

import { Fragment } from "react/jsx-runtime"
import { useWorldAuth } from "@radish-la/world-auth"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import { formatTimePlayed } from "@/lib/date"
import { useAtomIsBoardOpen } from "@/lib/store"
import { beautifyAddress, cn } from "@/lib/utils"

import {
  type LeaderboardData,
  useAccountLeaderboardData,
  useLeaderboard,
} from "@/hooks/leaderboard"
import { useProFeatures, useRemoteProStatus } from "@/hooks/pro"
import { localizeNumber, numberToShortWords } from "@/lib/numbers"
import { formatUSDC } from "@/lib/usdc"

import { FaGift } from "react-icons/fa"
import { MdPerson } from "react-icons/md"

import Button from "./Button"
import AddressBlock from "./AddressBlock"
import { ProBadge } from "./WalletConnect"
import { useAlertModal } from "./Alert"
import { useFriendsDialogAtom } from "./DialogFriends"

export default function DrawerBoard() {
  const [open, setOpen] = useAtomIsBoardOpen()
  const { toggleOpen } = useFriendsDialogAtom()

  const { leaderboard, totalUniquePlayers } = useLeaderboard()
  const { data: accountData } = useAccountLeaderboardData()
  const { address, isConnected } = useWorldAuth()

  const isInTopBoard = leaderboard.some((p) => p.address === address)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100vh-4rem-var(--spacing-safe-bottom))] mx-auto bg-rb-darker border-white/10">
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

        {totalUniquePlayers >= 3 ? (
          <section className="grow flex flex-col gap-2 overflow-y-auto px-4">
            {isInTopBoard || !accountData ? null : (
              <Fragment>
                <PlayerItem
                  isConnectedUser
                  isOutsideBoard
                  player={accountData}
                />
                <div className="h-px w-full shrink-0 bg-white/10 my-3" />
              </Fragment>
            )}

            {leaderboard.length <= 0 ? (
              <PlayerSkeletonList />
            ) : (
              leaderboard.map((player, index) => (
                <PlayerItem
                  player={player}
                  key={`board-player-${player.address}-${index}`}
                  isConnectedUser={player.address === address}
                />
              ))
            )}

            <p className="text-sm pt-8 pb-16 px-3 text-white/60 text-center">
              Leaderboard updates every 30-45 minutes based on RBC points
              earned.
            </p>

            <div className="sticky pointer-events-none w-full shrink-0 h-4 z-1 bottom-0 bg-linear-to-b from-rb-darker/0 to-rb-darker" />
          </section>
        ) : (
          <section className="grow flex gap-3 flex-col items-center px-4 pb-3">
            <PlayerSkeletonList />

            <div className="bg-white/10 mt-8 mb-6 h-px w-full" />
            <p className="text-sm text-white/60 text-center max-w-72">
              Not enough data. Play more to get ranked on the leaderboard!
            </p>
          </section>
        )}

        <div className="px-4 flex flex-col pt-3 gap-3 pb-6">
          {isConnected ? null : (
            <Button
              onClick={toggleOpen}
              className="flex bg-linear-to-br from-rb-yellow/25 border-white/5 to-rb-yellow/0 items-center justify-center gap-3"
              variant="secondary"
            >
              <span>INVITE FRIENDS</span>
              <FaGift />
            </Button>
          )}

          <Button onClick={() => setOpen(false)}>CONTINUE PLAYING</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

const PlayerSkeletonList = () => (
  <Fragment>
    <div className="bg-white/10 animate-pulse w-full h-18 rounded-lg" />
    <div className="bg-white/10 animate-pulse delay-150 w-full h-18 rounded-lg" />
    <div className="bg-white/10 animate-pulse delay-300 w-full h-18 rounded-lg" />
  </Fragment>
)

function PlayerItem({
  player,
  isConnectedUser,
  isOutsideBoard,
}: {
  player: LeaderboardData
  isConnectedUser?: boolean
  isOutsideBoard?: boolean
  className?: string
}) {
  const { showAlert } = useAlertModal()
  const { isProUser: isConnectedUserPro } = useProFeatures()
  const { status: remoteProStatus } = useRemoteProStatus(
    isConnectedUser ? null : player.address
  )

  const showProBadge = Boolean(
    // Fetch from remote when not the connected user
    isConnectedUser ? isConnectedUserPro : remoteProStatus?.isProUser
  )

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
          #{player.position || ">999"}
        </div>
      </div>

      <AddressBlock address={player.address} size={10} />

      <div className="flex-1 grow">
        <div className="flex items-center gap-2">
          <nav className="flex gap-2 items-center">
            <div className="text-white font-black text-sm">
              {beautifyAddress(player.address, 4, "")}
            </div>
            {showProBadge && (
              <button
                onClick={() => {
                  showAlert({
                    title: "RETRO BOY PRO",
                    description:
                      "This user account is subscribed to Retro Boy Pro!",
                  })
                }}
              >
                <ProBadge />
              </button>
            )}
          </nav>
          {isConnectedUser && (
            <span className="text-xs font-black text-rb-green">(YOU)</span>
          )}
        </div>
        <div className="text-xs text-white/60">
          {formatTimePlayed(player.timePlayed)}
        </div>
      </div>

      <div className="text-right">
        <div
          className={cn(
            "font-black text-sm",
            isConnectedUser ? "text-rb-green" : "text-white"
          )}
        >
          {localizeNumber(formatUSDC(player.points))}
        </div>
        <div className="text-xs text-white/40">RBC</div>
      </div>
    </div>
  )
}
