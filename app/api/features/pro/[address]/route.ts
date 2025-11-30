import { alchemy } from "@/lib/alchemy"
import { AssetTransfersCategory } from "alchemy-sdk"

import { PRO_PAYMENT_RECIPIENT } from "@/app/actions/payments"
import { TOKENS } from "@/lib/tokens"
import { getProPrice } from "@/app/lib/pro"

type Params = { params: Promise<{ address: string }> }

export const revalidate = 60 // Cache for 60 seconds

export async function GET(_: Request, { params }: Params) {
  const { address } = await params

  const price = getProPrice(address).toString()
  const { transfers } = await alchemy.core.getAssetTransfers({
    fromAddress: address,
    toAddress: PRO_PAYMENT_RECIPIENT,
    // This address is specific (one transfer for payment) but buffer it jic
    maxCount: 3,
    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
    contractAddresses: [TOKENS.WLD.ADDRESS],
  })

  const isProUser = transfers.some(
    // User has made a payment matching the pro price
    (transfer) => (transfer.value || "") == price
  )

  return Response.json({
    price,
    isProUser,
    transfers,
  })
}
