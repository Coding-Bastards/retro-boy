"use server"

import type { Address, Hash } from "viem"
import ProtocolKit, { hashSafeMessage } from "@safe-global/protocol-kit"

import { isWorldVerified } from "@/lib/world"
import { INVITE_REWARDS } from "@/lib/constants"
import { ALCHEMY_RPC } from "@/lib/alchemy"
import { generateInviteCode } from "@/lib/utils"
import { redis } from "@/lib/redis"

export type ClaimMessage = {
  inviter: string
  recipient: string
  refCode: string
  nonce: number
}

const getAccountKey = (address: Address) => `rb.i.${address}`
const getInviteKey = (inviter: Address, recipient: Address) =>
  `rb.i.${inviter}.invited.${recipient}`

const incrementInviteStats = async (
  Address: Address,
  {
    sent,
    accepted,
    points,
  }: {
    sent?: number
    accepted?: number
    points?: number
  }
) => {
  await Promise.all([
    points && redis.hincrby(getAccountKey(Address), "points", points),
    sent && redis.hincrby(getAccountKey(Address), "invitesSent", sent),
    accepted &&
      redis.hincrby(getAccountKey(Address), "invitesAccepted", accepted),
  ])
}

export const getInvites = async (address: Address) => {
  const data = await redis.hgetall<{
    points: number
    invitesSent: number
    invitesAccepted: number
  }>(getAccountKey(address))

  return {
    /** Accumulated earned points from invites (non-USDC formatted) */
    points: 0,
    /** Invites given + accepted from recipient */
    invitesSent: 0,
    /** Invites you have accepted from others */
    invitesAccepted: 0,
    ...(data || {}),
  }
}

//////////////////////////////////////////
// External Actions
//////////////////////////////////////////

export const inviteExits = async (person1: Address, person2: Address) => {
  // Check if either person has invited the other
  return (
    await Promise.all([
      redis.get(getInviteKey(person1, person2)), // Peson1 -> Person2
      redis.get(getInviteKey(person2, person1)), // Person2 -> Person1
    ])
  ).some(Boolean)
}

export const claimFriendRewards = async ({
  message = "null",
  signature,
}: {
  message: string
  signature: Hash
}) => {
  const formattedMessage = JSON.parse(message) as ClaimMessage | null
  const inviter = formattedMessage?.inviter?.toLowerCase() as Address
  const recipient = formattedMessage?.recipient?.toLowerCase() as Address

  const Safe = await ProtocolKit.init({
    // Initialize with recipient address (Load as Safe Wallet)
    safeAddress: recipient,
    provider: ALCHEMY_RPC.http,
  })

  const isValidSignature = Safe.isValidSignature(
    hashSafeMessage(message),
    signature
  )

  if (!isValidSignature || !formattedMessage) {
    return errorState("InvalidSigner")
  }

  if (generateInviteCode(inviter) !== formattedMessage.refCode) {
    return errorState("InvalidRefCode")
  }

  const isHumanRecipient = await isWorldVerified(recipient)
  const CLAIMABLE_AMOUNT = isHumanRecipient
    ? INVITE_REWARDS.VERIFIED
    : INVITE_REWARDS.REGULAR

  // Can't self invite
  if (
    false &&
    inviter == recipient) {
    return errorState("CantSelfInvite")
  }

  // Use recipient's accepted invites as nonce
  const { invitesAccepted: nonce } = await getInvites(recipient)
  if (formattedMessage.nonce !== nonce) {
    return errorState("InvalidNonce")
  }

  // Can't invite same person back
  if (await inviteExits(inviter, recipient)) {
    return errorState("AlreadyInvited")
  }

  const nowInSeconds = Math.floor(Date.now() / 1_000)
  await Promise.all([
    // Set invite record to prevent re-invite
    redis.set(getInviteKey(inviter, recipient), nowInSeconds),

    // Update inviter stats
    incrementInviteStats(inviter, { points: CLAIMABLE_AMOUNT, sent: 1 }),

    // Disburse recipient points + update accepted invites
    incrementInviteStats(recipient, { points: CLAIMABLE_AMOUNT, accepted: 1 }),
  ])

  return {
    error: null,
    amount: CLAIMABLE_AMOUNT,
  }
}

const errorState = (error: string) => {
  console.error({ error })
  return {
    amount: 0,
    error,
  }
}
