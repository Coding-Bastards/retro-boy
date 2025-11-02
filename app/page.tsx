import Game from "@/app/components/Game"
import { IoMdPerson } from "react-icons/io"
import { PiHandbagSimpleFill, PiJoystickFill } from "react-icons/pi"

export default function Home() {
  return (
    <main className="max-w-md mx-auto">
      <Game />
      <div className="bg-black fixed bottom-0 left-0 right-0">
        <div className="h-6 bg-[#161616] rounded-b-4xl w-full" />
        <nav className="max-w-md grid grid-cols-3 text-white h-18 w-full mx-auto">
          <button className="flex gap-0.5 opacity-50 active:opacity-100 /bg-green-300 flex-col items-center justify-center">
            <div className="size-9 /bg-red-500 flex justify-center items-end">
              <PiHandbagSimpleFill className="text-2xl" />
            </div>
            <span className="uppercase text-xs font-black">Market</span>
          </button>

          <button className="flex gap-0.5 opacity-50 active:opacity-100 /bg-green-300 flex-col items-center justify-center">
            <div className="size-9 /bg-red-500 flex justify-center items-end">
              <PiJoystickFill className="text-2xl scale-105" />
            </div>
            <span className="uppercase text-xs font-black">GAME</span>
          </button>

          <button className="flex gap-0.5 opacity-50 active:opacity-100 /bg-green-300 flex-col items-center justify-center">
            <div className="size-9 /bg-red-500 flex justify-center items-end">
              <IoMdPerson className="text-2xl" />
            </div>
            <span className="uppercase text-xs font-black">Profile</span>
          </button>
        </nav>
      </div>
    </main>
  )
}
