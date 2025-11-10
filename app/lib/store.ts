import { atom } from "jotai"

export const catalogueOpenAtom = atom(false)
export const boardOpenAtom = atom(false)
export const activeGameIdAtom = atom<string | null>(null)
