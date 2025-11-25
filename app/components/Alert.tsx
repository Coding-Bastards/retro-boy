"use client"

import { atom, useAtom } from "jotai"

import Dialog from "@/components/Dialog"
import Button from "./Button"

const modalState = atom({
  isOpen: false,
  title: "",
  description: "",
})

export const useAlertModal = () => {
  const [, setState] = useAtom(modalState)

  const showAlert = ({
    title,
    description,
  }: {
    title: string
    description: string
  }) => setState({ isOpen: true, title, description })

  return { showAlert }
}

export function AlertProvider() {
  const [state, setState] = useAtom(modalState)

  return (
    <Dialog
      open={state.isOpen}
      title={state.title}
      onOpenChange={(isOpen) => setState((prev) => ({ ...prev, isOpen }))}
    >
      <p className="text-sm">{state.description}</p>

      <Button
        onClick={() => setState((prev) => ({ ...prev, isOpen: false }))}
        className="mt-7"
        variant="secondary"
      >
        CLOSE
      </Button>
    </Dialog>
  )
}
