import { atom, useAtom } from "jotai"

const atomIsCatalogueOpen = atom(false)
const atomIsBoardOpen = atom(false)

export const useAtomIsCatalogueOpen = () => useAtom(atomIsCatalogueOpen)
export const useAtomIsBoardOpen = () => useAtom(atomIsBoardOpen)
