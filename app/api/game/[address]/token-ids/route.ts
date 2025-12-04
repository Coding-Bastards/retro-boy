import type { CollectionWithTokenId } from "@/app/hooks/nfts"
import { alchemy } from "@/lib/alchemy"
import { AssetTransfersCategory } from "alchemy-sdk"
import { zeroAddress } from "viem"

type Params = { params: Promise<{ address: string }> }

export const revalidate = 30 // Cache for 30 seconds

export async function GET(request: Request, { params }: Params) {
  const { address } = await params
  const searchParams = new URL(request.url).searchParams
  const contractAddresses = searchParams.get("addresses")?.split(",") || []

  const { transfers: mintedTo } = await alchemy.core.getAssetTransfers({
    fromAddress: zeroAddress, // Minted from zero address
    toAddress: address, // Sent to the user address
    contractAddresses,
    category: [AssetTransfersCategory.ERC721], // Only NFTs
    excludeZeroValue: true,
  })

  const formattedNFTs = mintedTo.map(
    ({ erc721TokenId, rawContract, blockNum }) => ({
      tokenId: erc721TokenId ? Number(erc721TokenId) : null,
      collectionId: rawContract.address!.toLowerCase(),
      acquiredAt: Number(blockNum),
    })
  )

  const keepLatestTokenIdPerCollection = Object.values(
    formattedNFTs.reduce((acc, { tokenId, collectionId }) => {
      if (typeof tokenId !== "number") return acc
      return {
        ...acc,
        [collectionId]: {
          tokenId,
          collectionId,
        },
      }
    }, {}) as Record<string, CollectionWithTokenId>
  )

  return Response.json(keepLatestTokenIdPerCollection)
}
