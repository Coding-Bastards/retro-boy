import { alchemy } from "@/lib/alchemy"
import { AssetTransfersCategory } from "alchemy-sdk"

import { PRO_PAYMENT_RECIPIENT } from "@/app/actions/payments"
import { TOKENS } from "@/lib/tokens"
import { getProPrice } from "@/app/lib/pro"

type Params = { params: Promise<{ address: string }> }

export const revalidate = 120 // Cache for 2 minutes

export async function GET(_: Request, { params }: Params) {
  const { address } = await params

  const price = getProPrice(address).toString()
  const { transfers: rawTransfers } = await alchemy.core.getAssetTransfers({
    fromAddress: address,
    withMetadata: false,
    toAddress: PRO_PAYMENT_RECIPIENT,
    // This address is specific (one transfer for payment) but buffer it jic
    maxCount: 3,
    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
    contractAddresses: [TOKENS.WLD.ADDRESS],
  })

  const transfers = rawTransfers.map(({ hash, value, blockNum }) => ({
    hash,
    value,
    blockNum,
  }))

  // User has made a payment matching the pro price
  const isProUser = transfers.some((t) => `${t.value}` == price)

  return Response.json({
    price,
    isProUser,
    transfers,
  })
}
