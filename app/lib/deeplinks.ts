import type { Address } from "viem"

// Uno Mini App ID
const UNO_APP_ID = "app_a4f7f3e62c1de0b9490a5260cb390b56"

// Our Mini App ID
const APP_ID_PROD = "app_a13136423b04187d0af66d74f5dd7eb6"
const APP_ID_DEV = "app_83edfef6e6d38684b2a6207d271c8a91"

export const getMiniAppId = () =>
  process.env.NODE_ENV === "development" ? APP_ID_DEV : APP_ID_PROD

export function getUnoDeeplinkUrl({
  fromToken,
  toToken,
  amount,
}: {
  fromToken?: Address
  toToken?: Address
  amount?: string
}) {
  let path = `?tab=swap`

  if (fromToken) {
    path += `&fromToken=${fromToken}`
    if (amount) path += `&amount=${amount}`
  }

  if (toToken) path += `&toToken=${toToken}`

  return `https://worldcoin.org/mini-app?app_id=${UNO_APP_ID}&path=${encodeURIComponent(
    `${path}&referrerAppId=${getMiniAppId()}`
  )}`
}
