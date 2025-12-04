"use client"

import { atom, useAtom } from "jotai"

import Dialog from "@/components/Dialog"
import Button from "./Button"

type ModalAction = {
  label: string
  onClick: () => void
}

const modalState = atom({
  isOpen: false,
  title: "",
  description: "",
  action: {} as ModalAction | undefined,
})

export const useAlertModal = () => {
  const [, setState] = useAtom(modalState)

  const showAlert = ({
    title,
    description,
    action,
  }: {
    title: string
    description: string
    action?: ModalAction
  }) => setState({ isOpen: true, title, description, action })

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
        onClick={() => {
          state.action?.onClick?.()
          setState((prev) => ({ ...prev, isOpen: false }))
        }}
        className="mt-7 uppercase"
        variant="secondary"
      >
        {state.action?.label || "CLOSE"}
      </Button>
    </Dialog>
  )
}
