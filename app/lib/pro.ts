import { DEV_ADDRESS } from "./constants"

export const getProPrice = (address?: string) => {
  return address?.toLowerCase() === DEV_ADDRESS.toLowerCase() ? 0.1 : 3.99
}
