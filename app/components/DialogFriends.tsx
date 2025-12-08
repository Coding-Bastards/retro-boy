"use client"

import { Fragment, useEffect, useState } from "react"
import { atomWithStorage } from "jotai/utils"
import { atom, useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"

import Dialog from "@/components/Dialog"
import Button from "@/components/Button"

import { useIsFirstTimeOpen } from "./TopNavigation"
import { IoCopyOutline } from "react-icons/io5"
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md"

import { INVITE_REWARDS } from "@/lib/constants"
import { generateInviteCode } from "@/lib/utils"
import { getInviteLink } from "@/lib/deeplink"

const atomIsFriendsDialogOpen = atom(false)
export const useFriendsDialogAtom = () => {
  const [isOpen, setIsOpen] = useAtom(atomIsFriendsDialogOpen)
  return {
    isOpen,
    setIsOpen,
    toggleOpen: () => setIsOpen((prev) => !prev),
  }
}

const atomIsInvitesTutorialComplete = atomWithStorage(
  "rb.isInvitesTutorialComplete",
  false
)

export default function DialogFriends() {
  const [copied, setCopied] = useState(false)
  const [isFirstTimeOpen] = useIsFirstTimeOpen()

  const [isInvitesTutorialComplete, setIsInvitesTutorialComplete] = useAtom(
    atomIsInvitesTutorialComplete
  )
  const { isOpen, setIsOpen } = useFriendsDialogAtom()
  const { address, signIn } = useWorldAuth()

  const CODE = address ? generateInviteCode(address) : "000000"

  async function handleCopyCode() {
    if (!address) return signIn()
    await navigator.clipboard.writeText(
      getInviteLink({
        address,
        code: CODE,
      })
    )

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (address && !isInvitesTutorialComplete && !isFirstTimeOpen) {
      // Show tutorial after first app open + address connected
      const timer = setTimeout(() => {
        // Wait a bit for router + stack to settle
        setIsOpen(true)
        setIsInvitesTutorialComplete(true)
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [address, isFirstTimeOpen, isInvitesTutorialComplete])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="🎮 INVITE FRIENDS">
      <ul className="text-sm space-y-2 pt-2 text-white/80">
        <li className="flex items-start gap-2">
          <MdOutlineKeyboardDoubleArrowRight className="text-white text-lg mt-0.5 -translate-y-px" />

          <span>
            Earn{" "}
            <strong className="text-white">{INVITE_REWARDS.REGULAR} RBC</strong>{" "}
            for regular users
          </span>
        </li>

        <li className="flex items-center gap-2">
          <MdOutlineKeyboardDoubleArrowRight className="text-white text-lg mt-0.5 -translate-y-px" />

          <span>
            <strong className="text-white">
              {INVITE_REWARDS.VERIFIED} RBC
            </strong>{" "}
            if human verified
          </span>
        </li>
      </ul>

      <div className="mt-10 space-y-3">
        {address ? (
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 uppercase mb-1">PROFILE CODE</p>
            <p className="text-3xl font-black tracking-widest text-rb-green">
              {CODE}
            </p>
          </div>
        ) : null}

        <Button
          onClick={handleCopyCode}
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          {address ? (
            <Fragment>
              <IoCopyOutline className="text-lg" />
              {copied ? "COPIED" : "COPY LINK"}
            </Fragment>
          ) : (
            "CONNECT WALLET"
          )}
        </Button>
      </div>
    </Dialog>
  )
}
