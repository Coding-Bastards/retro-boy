import { cn } from "@/app/lib/utils"
import { ButtonHTMLAttributes } from "react"

interface Button extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ children, className, ...props }: Button) {
  return (
    <button
      className={cn(
        "w-full bg-rb-green text-black font-black uppercase py-4 rounded-lg hover:opacity-95 transition-opacity active:scale-98",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
