"use client"

import { useEffect, useState } from "react"
import { useDragLayer } from "react-dnd"
import { Fragment } from "react/jsx-runtime"

export default function CartridgeDragPreview() {
  const { isDragging, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }))

  const [isActive, setIsActive] = useState(false)

  useEffect(() => setIsActive(isDragging), [isDragging])

  if (isDragging && currentOffset) {
    return (
      <Fragment>
        <button
          onClick={() => setIsActive(false)}
          className="fixed inset-0 z-9 bg-black/25"
        />
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: currentOffset.x,
            top: currentOffset.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
      `}</style>
          <div
            style={{
              backgroundImage:
                "url(https://raw.githubusercontent.com/Coding-Bastards/retro-boy/master/games/tobutobugirl-dx/cover.png)",
              animation: "shake 0.15s ease-in-out infinite",
            }}
            className="size-[min(20rem,calc(100vw-7rem))] drop-shadow-lg bg-cover bg-center"
          />
        </div>
      </Fragment>
    )
  }

  return null
}
