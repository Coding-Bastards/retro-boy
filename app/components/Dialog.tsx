"use client"

import type { ReactNode } from "react"
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/app/components/ui/dialog"
import { cn } from "@/app/lib/utils"

export type DialogProps = {
  trigger: ReactNode
  title?: ReactNode
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export default function Dialog({
  trigger,
  title,
  children,
  open,
  onOpenChange,
  className,
}: DialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("pt-7", className)}>
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        <section className="mt-3">{children}</section>
      </DialogContent>
    </DialogRoot>
  )
}
