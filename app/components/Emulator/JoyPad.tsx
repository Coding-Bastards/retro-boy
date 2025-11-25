import type { ComponentPropsWithoutRef } from "react"
import { RiArrowUpWideLine } from "react-icons/ri"
import { Joystick } from "react-joystick-component"

export default function JoyPad(
  props: Pick<ComponentPropsWithoutRef<typeof Joystick>, "move" | "stop">
) {
  return (
    <div className="flex bg-white/1 border border-black/15 shadow-inner rounded-full joy-container items-center justify-center relative">
      <div className="absolute pointer-events-none text-white/5 text-xl grid grid-cols-2 p-1 inset-0">
        <div
          id="FORWARD"
          className="col-span-2 flex items-start justify-center"
        >
          <RiArrowUpWideLine />
        </div>
        <div id="LEFT" className="flex items-center justify-start">
          <RiArrowUpWideLine className="-rotate-90" />
        </div>
        <div id="RIGHT" className="flex items-center justify-end">
          <RiArrowUpWideLine className="rotate-90" />
        </div>
        <div id="BACKWARD" className="col-span-2 flex items-end justify-center">
          <RiArrowUpWideLine className="rotate-180" />
        </div>
      </div>

      <style scoped>{`
        .joy-container button {
          width: 100% !important;
          height: 100% !important;
        }

        .joy-container button::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 58%;
          height: 58%;
          border-radius: 100%;
          background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
          box-shadow: 0 0px 4px 2px rgba(0, 0, 0, 0.1),
            0 0px 12px 0 rgba(0, 0, 0, 0.4);
        }
      `}</style>

      <Joystick
        {...props}
        size={120}
        baseColor="transparent"
        stickColor="transparent"
        minDistance={5}
        throttle={10}
      />
    </div>
  )
}
