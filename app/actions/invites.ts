"use server"

import type { Address, Hash } from "viem"
import ProtocolKit, { hashSafeMessage } from "@safe-global/protocol-kit"
import { recoverAddress } from "viem"

import { isWorldVerified } from "@/lib/world"
import { generateInviteCode } from "@/components/DialogFriends"
import { INVITE_REWARDS } from "@/lib/constants"
import { ALCHEMY_RPC } from "@/lib/alchemy"
import { redis } from "@/lib/redis"

export type ClaimMessage = {
  inviter: string
  recipient: string
  refCode: string
  nonce: number
}

const getInviteKey = (inviter: Address, recipient: Address) =>
  `rb.i.${inviter}.invited.${recipient}`
const getTotalInvitedKey = (address: Address) => `rb.i.${address}.totalInvited`
const getPointsKey = (address: Address) => `rb.i.${address}.points`

export const getAcceptedInvites = async (address: Address) =>
  (await redis.get<number>(getTotalInvitedKey(address))) || 0

export const incrementAcceptedInvites = async (address: Address) =>
  await redis.incr(getTotalInvitedKey(address))

export const incrementInvitePoints = async (address: Address, points: number) =>
  await redis.incrby(getPointsKey(address), points)

export const getInvitePoints = async (address: Address) =>
  (await redis.get<number>(getPointsKey(address))) || 0

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

  const originalSigner = await recoverAddress({
    hash: hashSafeMessage(message) as Hash,
    signature,
  })

  // Safe message sender should be the expected recipient
  if (originalSigner.toLowerCase() !== recipient) {
    return errorState("InvalidSigner")
  }

  const Safe = await ProtocolKit.init({
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
  if (inviter == recipient) {
    return errorState("CantSelfInvite")
  }

  // Use accepted invites as nonce
  const nonce = await getAcceptedInvites(recipient)
  if (formattedMessage.nonce !== nonce) {
    return errorState("InvalidNonce")
  }

  // Can't invite same person back
  if (await inviteExits(inviter, recipient)) {
    return errorState("AlreadyInvited")
  }

  const nowInSeconds = Math.floor(Date.now() / 1_000)
  await Promise.all([
    redis.set(getInviteKey(inviter, recipient), nowInSeconds),
    incrementInvitePoints(inviter, CLAIMABLE_AMOUNT),

    // Disburse recipient points + update accepted invites
    incrementInvitePoints(recipient, CLAIMABLE_AMOUNT),
    incrementAcceptedInvites(recipient),
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
