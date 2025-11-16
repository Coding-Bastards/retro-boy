import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const atomIsCatalogueOpen = atom(false)
const atomIsBoardOpen = atom(false)

// Store time played per game: { [gameId]: {[userAddress]: seconds} }
const atomTimePlayed = atomWithStorage<Record<string, Record<string, number>>>(
  "rb.timePlayedData",
  {}
)

export const useAtomIsCatalogueOpen = () => useAtom(atomIsCatalogueOpen)
export const useAtomIsBoardOpen = () => useAtom(atomIsBoardOpen)

/** { [gameId]: {[userAddress]: seconds} } */
export const useAtomTimePlayed = () => useAtom(atomTimePlayed)
