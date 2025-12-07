import { ZERO } from "./constants"

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const N_62 = BigInt(62)

export function hexToBase62(hex: string): string {
  if (hex.startsWith("0x")) hex = hex.slice(2)
  let n = BigInt("0x" + hex)
  if (n === ZERO) return "0"

  let out = ""
  while (n > ZERO) {
    out = BASE62[Number(n % N_62)] + out
    n /= N_62
  }

  return out
}

export function base62ToHex(str: string): string {
  let n = ZERO
  for (let c of str) n = n * N_62 + BigInt(BASE62.indexOf(c))
  return n.toString(16)
}
