"use client"

import { useAtom } from "jotai"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { boardOpenAtom } from "@/app/lib/store"
import Button from "./Button"

export default function DrawerBoard() {
  const [open, setOpen] = useAtom(boardOpenAtom)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100vh-4rem)] mx-auto bg-rb-darker border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white text-center uppercase font-black">
            BOARD
          </DrawerTitle>
        </DrawerHeader>

        {/* Board content goes here */}
        <div className="flex-1 px-4 pb-6">
          {/* Placeholder content */}
          <div className="text-white/60 text-center py-12">
            Board content coming soon...
          </div>
        </div>

        <div className="grow" />

        <div className="px-4 pt-1 pb-6">
          <Button onClick={() => setOpen(false)}>CONTINUE PLAYING</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
