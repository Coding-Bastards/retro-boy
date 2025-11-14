import { type ClassValue, clsx } from "clsx"
import type { Hash } from "viem"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const beautifyAddress = (addr: string, size = 4, separator = "...") =>
  `${addr.substr(0, size)}${separator}${addr.substr(-size, size)}`

/** Appends Minikit resulting signature placeholder */
export const appendSignatureResult = (opts?: { slot: number }) =>
  `PERMIT2_SIGNATURE_PLACEHOLDER_${opts?.slot || 0}` as Hash
