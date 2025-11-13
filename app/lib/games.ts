"use client"

import type { TGameNFT } from "@/@types/game-nft"
import imageGallery from "@/public/image-gallery.json"
import useSWR from "swr"

import { useWorldAuth } from "@radish-la/world-auth"
import { erc721Abi, parseAbi, type Address } from "viem"
import { clientWorldchain } from "./world"

import { ADDRESS_GAME_REGISTRY, BASE_REPO_URL, ZERO } from "./constants"

export interface Game {
  collectionId: Address
  title: string
  description: string
  symbol: string
  rom: string
  nftImage: string
  gallery: string[]
  cover?: string
  playTime?: string
  totalOwners?: number
  likes?: number
  dislikes?: number
}

const ABI_REGISTRY = parseAbi([
  "function getGames() external view returns (address[] memory)",
])

export const useAllGames = () => {
  const { data: games = [] } = useSWR(`all-games`, async () => {
    const addresses = await clientWorldchain.readContract({
      address: ADDRESS_GAME_REGISTRY,
      abi: ABI_REGISTRY,
      functionName: "getGames",
    })

    const rawGames = await clientWorldchain.multicall({
      contracts: addresses.map((address) => ({
        address,
        abi: erc721Abi,
        functionName: "symbol",
      })),
    })

    const filteredGames = rawGames
      .map((rawGame, index) => ({
        collectionId: addresses[index],
        symbol: rawGame.result,
      }))
      .filter(
        (game) => typeof game?.symbol === "string"
        // Filter out invalid games
      ) as { collectionId: Address; symbol: string }[]

    return await Promise.all(
      filteredGames.map(async ({ collectionId, symbol }) => {
        const data = await fetch(
          `https://cdn.jsdelivr.net/gh/Coding-Bastards/retro-boy@master/games/${symbol}/data.json`
        )

        const {
          emulator,
          name: title,
          image: nftImage,
          description,
        } = (await data.json()) as TGameNFT

        const gallery: string[] = ((imageGallery as any)[symbol] || []).map(
          (path: string) => `${BASE_REPO_URL}/games/${symbol}/gallery${path}`
        )

        return {
          collectionId,
          symbol,
          title,
          nftImage,
          description,
          gallery,
          cover: `${BASE_REPO_URL}/games/${symbol}/gallery/cover.png`,
          rom: emulator.rom,
        } as Game
      })
    )
  })

  return {
    games,
  }
}

export const useOwnedGames = () => {
  // Fetch all games from registry
  const { address: ownerAddress } = useWorldAuth()
  const { games: allGames } = useAllGames()

  const { data: ownedGames = [] } = useSWR(
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
    games: ownedGames,
    isEmpty: ownedGames.length === 0,
  }
}
