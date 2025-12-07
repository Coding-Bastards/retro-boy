import { type ClassValue, clsx } from "clsx"
import { keccak256, toHex, type Hash } from "viem"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateUUID = () => crypto.randomUUID().replace(/-/g, "")

export const beautifyAddress = (addr: string, size = 4, separator = "...") =>
  `${addr.substr(0, size)}${separator}${addr.substr(-size, size)}`

/** Appends Minikit resulting signature placeholder */
export const appendSignatureResult = (opts?: { slot: number }) =>
  `PERMIT2_SIGNATURE_PLACEHOLDER_${opts?.slot || 0}` as Hash

export const jsonify = <T>(response: Response | Promise<Response>) => {
  return response instanceof Response
    ? (response.json() as Promise<T>)
    : response.then((r) => r.json() as Promise<T>)
}

export function generateInviteCode(address: string) {
  const hash = keccak256(toHex(address.toLowerCase() + "V1_INVITE_RBC"))
  return BigInt(hash).toString(36).slice(0, 6).toUpperCase()
}
