/** `true` when not in production environment */
export const isDev = () => {
  return process.env.NODE_ENV != "production"
}
