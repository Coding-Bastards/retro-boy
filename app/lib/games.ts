"use client"

import type { TGameNFT, TLikes } from "@/@types/game-nft"
import imageGallery from "@/public/image-gallery.json"
import useSWR from "swr"

import { useWorldAuth } from "@radish-la/world-auth"
import { erc721Abi, type Address } from "viem"
import { clientWorldchain } from "./world"

import {
  ADDRESS_GAME_REGISTRY,
  BASE_CDN_URL,
  BASE_REPO_URL,
  DEV_ADDRESS,
  ZERO,
} from "./constants"
import { ABI_REGISTRY } from "./abi"
import { jsonify } from "./utils"
import { isDev } from "./env"

export interface Game {
  collectionId: Address
  title: string
  description: string
  symbol: string
  rom: string
  nftImage: string
  gallery: string[]
  cover: string
  price: bigint
  licenses: {
    game: {
      type: string
      creators: string[]
      license_url: string
    }
    assets?: {
      type: string
      creators: string[]
      license_url: string
    }
  }
  totalOwners?: number
  likes?: number
  dislikes?: number
}

export const useAllGames = () => {
  const { data: intitialGames = [], error } = useSWR(`all-games`, async () => {
    const addresses = await clientWorldchain.readContract({
      address: ADDRESS_GAME_REGISTRY,
      abi: ABI_REGISTRY,
      functionName: "getGames",
    })

    const onchainData = await clientWorldchain.multicall({
      contracts: [
        ...addresses.map((address) => ({
          address,
          abi: erc721Abi,
          functionName: "symbol",
        })),
        ...addresses.map((address) => ({
          abi: ABI_REGISTRY,
          address: ADDRESS_GAME_REGISTRY,
          functionName: "getPrice",
          args: [address],
        })),
      ],
    })

    const filteredGames = addresses
      .map((collectionId, index) => ({
        collectionId,
        price: onchainData[addresses.length + index]?.result,
        symbol: onchainData[index]?.result,
      }))
      .filter(
        // Filter out invalid records
        (g) => [g.price, g.symbol].every((v) => v !== undefined)
      ) as {
      symbol: keyof typeof imageGallery
      collectionId: Address
      price: bigint
    }[]

    return await Promise.all(
      filteredGames.map(async ({ collectionId, price, symbol }) => {
        const {
          emulator: { rom },
          name: title,
          image: nftImage,
          licenses,
          description,
        } = await jsonify<TGameNFT>(
          // Get NFT collection metadata
          fetch(`${BASE_REPO_URL}/games/${symbol}/data.json`)
        )

        const gallery = (imageGallery[symbol] || []).map(
          (imagePath) => `${BASE_CDN_URL}/games/${symbol}/gallery${imagePath}`
        )

        return {
          rom,
          symbol,
          price,
          gallery,
          title,
          licenses,
          nftImage,
          description,
          collectionId,
          cover: `${BASE_CDN_URL}/games/${symbol}/gallery/cover.png`,
        } as Game
      })
    )
  })

  // Log error for debugging purposes
  if (error) console.debug({ error })

  const { data: finalGames = intitialGames, mutate } = useSWR<Game[]>(
    `games-with-final-data-${intitialGames.length}`,
    async () => {
      /**
       * To be more render optimistically a better state
       * we show initial games data first (while loading final data)
       * then we merge it with final (likes,totalOwners)
       */
      const gameSupplyPerGame = await clientWorldchain.multicall({
        contracts: intitialGames.map((game) => ({
          address: game.collectionId,
          abi: erc721Abi,
          // totalSupply = total accounts owning the NFT
          functionName: "totalSupply",
        })),
      })

      return await Promise.all(
        intitialGames.map(async (game, index) => {
          const likesData = await jsonify<TLikes>(
            fetch(`/api/game/${game.collectionId}/stats`)
          )

          return {
            ...game,
            ...likesData,
            totalOwners: Number(gameSupplyPerGame[index]?.result || ZERO),
          }
        })
      )
    },
    {
      fallbackData: intitialGames,
    }
  )

  return {
    games: finalGames,
    mutate,
  }
}

export const useOwnedGames = () => {
  // Fetch all games from registry
  const { address: connectedAddress } = useWorldAuth()
  const { games: allGames } = useAllGames()

  // Use dev address in dev env + no wallet connected
  const shouldUseDevAddress = isDev() && !connectedAddress
  const address = shouldUseDevAddress ? DEV_ADDRESS : connectedAddress

  const { data: games = [], mutate } = useSWR(
    address ? `games.owned.${address}.${allGames.length}` : null,
    async () => {
      if (!address) return []
      const ownedNFTs = await clientWorldchain.multicall({
        contracts: allGames.map((game) => ({
          address: game.collectionId,
          abi: erc721Abi,
          functionName: "balanceOf",
          args: [address],
        })),
      })

      return (
        ownedNFTs
          .map((nft, index) => {
            const ownedCount = BigInt(nft.result || ZERO)
            return {
              // Conserve collection address to map back to game data
              collectionId: allGames[index].collectionId,
              ownedCount,
            }
          })
          // Filter for "owned" games only
          .filter(({ ownedCount }) => ownedCount > 0)
      )
    }
  )

  // Decouple owned games data from SWR response
  const ownedGames = games
    .map(
      ({ collectionId: id }) =>
        allGames.find((g) => g.collectionId === id) || null
    )
    .filter(Boolean) as Game[]

  return {
    mutate,
    games: ownedGames,
    isEmpty: ownedGames.length === 0,
  }
}
