import { useTrackableRouter } from "@/hooks/history"

export const useAppRouter = () => {
  const router = useTrackableRouter()

  const pushGamePage = (gameId: string) => router.push(`?game=${gameId}`)
  const pushMarketPage = () => router.push("?market=open")
  const navigateHome = () => router.push("/")

  return {
    pushGamePage,
    pushMarketPage,
    navigateHome,
    router,
  } as const
}
