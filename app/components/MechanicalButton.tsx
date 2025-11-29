import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative flex items-center justify-center select-none bg-linear-to-b from-rb-dark to-rb-darker text-white/40 font-black shadow-rb-button",
  {
    variants: {
      variant: {
        round: "w-16 h-16 rounded-full text-2xl",
        pill: "px-6 py-2 rounded-full text-sm",
      },
    },
    defaultVariants: {
      variant: "round",
    },
  }
)

interface MechanicalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isPressed?: boolean
  onTapStart?: () => void
  onTapEnd?: () => void
}

export default function MechanicalButton({
  children,
  variant,
  className,
  isPressed,
  onTapEnd,
  onTapStart,
  ...props
}: MechanicalButtonProps) {
  return (
    <button
      onTouchStart={onTapStart}
      onTouchEnd={onTapEnd}
      onMouseDown={onTapStart}
      onMouseUp={onTapEnd}
      className={cn(
        buttonVariants({ variant }),
        className,
        "active:translate-y-1 active:shadow-rb-button-down",
        isPressed && "translate-y-1 shadow-rb-button-down"
      )}
      {...props}
    >
      {children}
    </button>
  )
}
