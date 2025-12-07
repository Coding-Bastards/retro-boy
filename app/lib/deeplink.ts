import { hexToBase62 } from "./base62"
import { isDevEnv } from "./env"

const APP_ID = isDevEnv()
  ? "app_83edfef6e6d38684b2a6207d271c8a91"
  : "app_a13136423b04187d0af66d74f5dd7eb6"

export const getInviteLink = ({
  code,
  address,
}: {
  code: string
  address: string
}) => {
  return `https://worldcoin.org/mini-app?app_id=${APP_ID}&path=${encodeURIComponent(
    `/invite?seed=${code}${hexToBase62(address)}`
  )}`
}
