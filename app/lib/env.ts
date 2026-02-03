import { DEV_ADDRESS } from "./constants"

/** `true` when not in production environment */
export const isDevEnv = () => {
  return process.env.NODE_ENV != "production"
}

/** `true` when matching developer address from `DEV_ADDRESS` */
export const isDeveloper = (address?: string) => {
  if (!address) return false
  return address === DEV_ADDRESS
}
