import { useRouter } from "next/navigation"

export const useAppRouter = () => {
  const router = useRouter()

  const pushGamePage = (gameId: string) => router.push(`?game=${gameId}`)
  const pushMarketPage = () => router.push("?market=open")
  const navigateBack = () => router.back()
  const navigateHome = () => router.push("/")

  return {
    pushGamePage,
    pushMarketPage,
    navigateBack,
    navigateHome,
    router,
  } as const
}
