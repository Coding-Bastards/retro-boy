import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const buttonVariants = cva(
  "relative flex items-center justify-center select-none bg-linear-to-b from-rb-dark to-rb-darker text-white/40 font-black shadow-[0_6px_0_0_#0a0a0a,0_8px_12px_0_rgba(0,0,0,0.4)] active:shadow-[0_2px_0_0_#0a0a0a,0_3px_6px_0_rgba(0,0,0,0.4)] active:translate-y-1",
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
  onPress: () => void
  onRelease: () => void
}

export default function MechanicalButton({
  onPress,
  onRelease,
  children,
  variant,
  className,
  ...props
}: MechanicalButtonProps) {
  return (
    <button
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {children}
    </button>
  )
}
