"use client"

import type { TGameNFT, TLikes } from "@/@types/game-nft"
import imageGallery from "@/public/image-gallery.json"
import useSWR from "swr"

import { useWorldAuth } from "@radish-la/world-auth"
import { erc721Abi, type Address } from "viem"
import { clientWorldchain } from "./world"

import {
  ADDRESS_GAME_REGISTRY,
  BASE_REPO_URL,
  BASE_CDN_URL,
  ZERO,
} from "./constants"
import { ABI_REGISTRY } from "./abi"
import { jsonify } from "./utils"

export interface Game {
  collectionId: Address
  title: string
  description: string
  symbol: string
  rom: string
  nftImage: string
  gallery: string[]
  price: bigint
  cover?: string
  totalOwners: number
  likes?: number
  dislikes?: number
}

export const useAllGames = () => {
  const { data: games = [], mutate } = useSWR(`all-games`, async () => {
    // TODO: Separate important data from less important (e.g., likes)
    // Merge asynchronously post-fetch

    const addresses = await clientWorldchain.readContract({
      address: ADDRESS_GAME_REGISTRY,
      abi: ABI_REGISTRY,
      functionName: "getGames",
    })

    const rawGames = await clientWorldchain.multicall({
      contracts: [
        ...addresses.map((address) => ({
          address,
          abi: erc721Abi,
          functionName: "symbol",
        })),

        // Get total owners for each game
        ...addresses.map((address) => ({
          address,
          abi: erc721Abi,
          functionName: "totalSupply",
        })),
      ],
    })

    const filteredGames = rawGames
      .map((rawGame, index) => ({
        collectionId: addresses[index],
        // Map total owners from multicall result
        totalOwners: Number(rawGames[addresses.length + index]?.result || 0),
        symbol: rawGame.result,
      }))
      .filter(
        (game) => typeof game?.symbol === "string"
        // Filter out invalid games
      ) as { collectionId: Address; symbol: string; totalOwners: number }[]

    return await Promise.all(
      filteredGames.map(async ({ collectionId, totalOwners, symbol }) => {
        const [gameData, likes, price] = await Promise.all([
          jsonify<TGameNFT>(
            fetch(`${BASE_REPO_URL}/games/${symbol}/data.json`)
          ),
          jsonify<TLikes>(fetch(`/api/game/${collectionId}/stats`)),
          clientWorldchain.readContract({
            abi: ABI_REGISTRY,
            address: ADDRESS_GAME_REGISTRY,
            functionName: "getPrice",
            args: [collectionId],
          }),
        ])

        const { emulator, name: title, image: nftImage, description } = gameData
        const gallery: string[] = ((imageGallery as any)[symbol] || []).map(
          (path: string) => `${BASE_CDN_URL}/games/${symbol}/gallery${path}`
        )

        return {
          ...likes,
          collectionId,
          symbol,
          price,
          title,
          nftImage,
          description,
          totalOwners,
          gallery,
          cover: `${BASE_CDN_URL}/games/${symbol}/gallery/cover.png`,
          rom: emulator.rom,
        } as Game
      })
    )
  })

  return {
    games,
    mutate,
  }
}

export const useOwnedGames = () => {
  // Fetch all games from registry
  const { address: ownerAddress } = useWorldAuth()
  const { games: allGames } = useAllGames()

  const { data: ownedGames = [], mutate } = useSWR(
    ownerAddress ? `games.owned.${ownerAddress}.${allGames.length}` : null,
    async () => {
      if (!ownerAddress) return []

      const ownedNFTs = await clientWorldchain.multicall({
        contracts: allGames.map((game) => ({
          address: game.collectionId,
          abi: erc721Abi,
          functionName: "balanceOf",
          args: [ownerAddress],
        })),
      })

      return ownedNFTs
        .map((nft, index) => {
          const nftAddress = allGames[index].collectionId
          const game = allGames.find((g) => g.collectionId === nftAddress)
          const ownedBalance = BigInt(nft.result || ZERO)
          return game && ownedBalance > 0 ? game : null
        })
        .filter(Boolean) as Game[]
    }
  )

  return {
    mutate,
    games: ownedGames,
    isEmpty: ownedGames.length === 0,
  }
}
