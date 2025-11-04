"use client"

import { useDragLayer } from "react-dnd"

export default function CartridgeDragPreview() {
  const { isDragging, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }))

  if (isDragging && currentOffset) {
    return (
      <div
        className="fixed pointer-events-none z-50"
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
    )
  }

  return null
}
