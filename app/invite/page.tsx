"use client"

import useSWRImmutable from "swr/immutable"
import { isAddress, type Address } from "viem"
import { Fragment, type PropsWithChildren, Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"

import {
  claimFriendRewards,
  ClaimMessage,
  getInvites,
  inviteExits,
} from "@/app/actions/invites"

import { FaCheck, FaGift } from "react-icons/fa"
import { FaLinkSlash } from "react-icons/fa6"

import { isWorldVerified } from "@/lib/world"
import { cn, generateInviteCode } from "@/lib/utils"
import { redeemRBCTokens } from "@/lib/rbc"
import { runParty } from "@/lib/party"
import { base62ToHex } from "@/lib/base62"

import { INVITE_REWARDS } from "@/lib/constants"
import { Spinner } from "@/components/icons"
import Button from "@/components/Button"

function InvitePage() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, signIn, isConnected } = useWorldAuth()

  const goToHome = () => router.push("/")

  const seed = searchParams.get("seed") as string | null
  const refCode = seed ? seed.slice(0, 6).toUpperCase() : null
  const inviter = seed ? (`0x${base62ToHex(seed.slice(6))}` as Address) : null

  const { data: isHumanVerified = false, isLoading: isVerifyingHumanity } =
    useSWRImmutable(address ? `is.human.${address}` : null, async () => {
      if (!address) return false
      return await isWorldVerified(address)
    })

  const {
    data: isAlreadyclaimed = false,
    isLoading: isCheckingForClaimedStatus,
  } = useSWRImmutable(
    address && inviter ? `is.claimed.${address}.${inviter}` : null,
    async () => {
      if (!address || !inviter) return false
      // Check if any cross-invite exists
      return await inviteExits(address, inviter)
    }
  )

  async function handleClaim() {
    if (!address) return signIn()
    if (!inviter || !refCode || isAlreadyclaimed) return

    try {
      setIsClaiming(true)

      const { invitesAccepted: nonce } = await getInvites(address)
      const message = JSON.stringify({
        inviter,
        recipient: address,
        refCode,
        nonce,
      } satisfies ClaimMessage)

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message,
      })

      if (finalPayload.status === "success") {
        const { error, amount } = await claimFriendRewards({
          message,
          signature: finalPayload.signature as any,
        })

        // Exit if error
        if (error) throw new Error(error)

        const payload = await redeemRBCTokens(address, {
          // Give out the exact amount rewarded
          forcedAmount: amount,
        })

        if (payload.status === "success") {
          // Complete claim flow
          setIsClaimed(true)
          runParty()
        } else {
          throw new Error("ReedemFailed")
        }
      }
    } catch (error) {
      console.error({ error })
      toast.error("Oops. Something went wrong")
    } finally {
      // Done claiming
      setIsClaiming(false)
    }
  }

  const isValidLink =
    inviter &&
    isAddress(inviter) &&
    generateInviteCode(inviter) === refCode &&
    !isAlreadyclaimed

  const REWARD_AMOUNT = isHumanVerified
    ? INVITE_REWARDS.VERIFIED
    : INVITE_REWARDS.REGULAR

  if (isVerifyingHumanity || isCheckingForClaimedStatus) {
    // Show load state while verifying link metadata
    return <PageLoadState />
  }

  return (
    <main className="max-w-md text-white h-dvh flex flex-col p-5 mx-auto">
      {isValidLink ? (
        <div className="text-center h-full flex gap-3 flex-col">
          <div className="space-y-1 grow flex flex-col items-center justify-center">
            {isClaimed ? (
              <IconContainer className="from-rb-green/10 to-rb-green/5 border-rb-green/7">
                <FaCheck className="text-3xl text-rb-green" />
              </IconContainer>
            ) : (
              <IconContainer>
                <FaGift className="text-3xl gift-icon" />
                <style>{`
              @keyframes tada {
                0%, 100% {transform: scale(1) rotate(0deg)}
                10%, 20% {transform: scale(0.95) rotate(-3deg)}
                30%, 50%, 70%, 90% {transform: scale(1.05) rotate(3deg)}
                40%, 60%, 80% {transform: scale(1.05) rotate(-3deg)}
              }
              .gift-icon {
                animation: tada 2s ease-in-out infinite;
              }
            `}</style>
              </IconContainer>
            )}
            <div className="my-2" />
            <p>{isClaimed ? "You've claimed 🥳" : "Someone gifted you"}</p>
            <p className="text-4xl font-black">{REWARD_AMOUNT} RBC</p>
          </div>

          {isClaimed ? null : (
            <Button
              onClick={handleClaim}
              disabled={isClaiming}
              variant="primary"
              className="w-full flex items-center justify-center gap-5"
            >
              {isConnected ? (
                isClaiming ? (
                  <Fragment>
                    <span>CLAIMING</span>
                    <Spinner themeSize="size-5" />
                  </Fragment>
                ) : (
                  "CLAIM NOW"
                )
              ) : (
                "CONNECT WALLET"
              )}
            </Button>
          )}

          <Button
            // Do not block user - just in case (infinite isClaimed=true loop)
            disabled={!isClaimed && isClaiming}
            onClick={goToHome}
            variant="secondary"
            className="w-full"
          >
            {isClaimed ? "TAKE ME HOME" : "CANCEL"}
          </Button>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="grow flex flex-col justify-center items-center gap-1">
            <IconContainer>
              <FaLinkSlash className="text-3xl" />
            </IconContainer>

            <div className="my-2" />

            <h2 className="text-lg font-black">Invalid Link</h2>
            <p className="text-center text-white/60 text-sm max-w-xs">
              This invite link is invalid or has already been claimed.
            </p>
          </div>

          <Button onClick={goToHome} variant="secondary">
            OKAY
          </Button>
        </div>
      )}
    </main>
  )
}

const PageLoadState = () => (
  <main className="max-w-md text-white h-dvh grid place-items-center p-5 mx-auto">
    <Spinner />
  </main>
)

const IconContainer = ({
  className,
  ...props
}: PropsWithChildren<{
  className?: string
}>) => (
  <figure
    {...props}
    className={cn(
      "size-24 grid place-items-center rounded-3xl bg-linear-to-bl from-rb-yellow/10 to-rb-yellow/5 border border-rb-yellow/7",
      className
    )}
  />
)

export default function WithSuspense() {
  return (
    <Suspense fallback={<PageLoadState />}>
      <InvitePage />
    </Suspense>
  )
}
