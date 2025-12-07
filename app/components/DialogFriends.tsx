"use client"

import { Fragment, useState } from "react"
import { atom, useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"

import Dialog from "@/components/Dialog"
import Button from "@/components/Button"

import { IoCopyOutline } from "react-icons/io5"
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

export default function DialogFriends() {
  const { isOpen, setIsOpen } = useFriendsDialogAtom()
  const { address, signIn } = useWorldAuth()
  const [copied, setCopied] = useState(false)

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="🎮 INVITE FRIENDS">
      <p className="text-sm mt-2 text-white/80">
        <ul className="list-disc list-inside">
          <li>
            Earn{" "}
            <strong className="text-white">{INVITE_REWARDS.REGULAR} RBC</strong>{" "}
            for regular users
          </li>
          <li>
            <strong className="text-white">
              {INVITE_REWARDS.VERIFIED} RBC
            </strong>{" "}
            if human verified
          </li>
        </ul>
      </p>

      <div className="mt-6 space-y-3">
        {address ? (
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 uppercase mb-2">Your Code</p>
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
