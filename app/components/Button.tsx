import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

interface Button extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary"
}

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: Button) {
  return (
    <button
      className={cn(
        "w-full font-black uppercase py-4 rounded-lg hover:opacity-95 transition-opacity active:scale-98",
        variant === "primary" && "bg-rb-green text-black",
        variant === "secondary" &&
          "bg-white/10 text-white border border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
