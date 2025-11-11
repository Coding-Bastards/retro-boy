import { useRouter } from "next/navigation"

export const useAppRouter = () => {
  const router = useRouter()
  const pushGamePage = (gameId: string) => {
    router.push(`?game=${gameId}`)
  }

  const pushMarketPage = () => {
    router.push("?market=open")
  }

  return {
    pushGamePage,
    pushMarketPage,
    router,
  } as const
}
