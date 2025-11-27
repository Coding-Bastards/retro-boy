import { useState } from "react"
import MechanicalButton from "@/components/MechanicalButton"

export default function ABGrid({
  onKeyDown,
  onKeyUp,
}: {
  onKeyDown: (keyCode: number) => void
  onKeyUp: (keyCode: number) => void
}) {
  const [pressedButtons, setPressedButtons] = useState(new Set<number>())

  const cleanUpPressedButtons = () => {
    pressedButtons.forEach((code) => onKeyUp(code))
    setPressedButtons(new Set())
  }

  const handleTouchInteraction = (e: React.TouchEvent) => {
    e.preventDefault()

    // Track buttons currently being touched
    const currentlyTouched = new Set<number>()

    // Check which buttons are currently being touched
    Array.from(e.touches).forEach((touch) => {
      // Get closest button keycode
      const keyCode = document
        .elementFromPoint(touch.clientX, touch.clientY)
        ?.closest("button")
        ?.getAttribute("data-keycode")

      if (keyCode) {
        const code = parseInt(keyCode)
        currentlyTouched.add(code)

        // Press if not already pressed
        if (!pressedButtons.has(code)) onKeyDown(code)
      }
    })

    pressedButtons.forEach((code) => {
      // Release button no longer being touched
      if (currentlyTouched.has(code)) return
      onKeyUp(code)
    })

    // Update pressed state
    setPressedButtons(currentlyTouched)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()

    if (e.touches.length) handleTouchInteraction(e)
    else {
      // If no touches remain, release all buttons
      cleanUpPressedButtons()
    }
  }

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault()
    cleanUpPressedButtons()
  }

  return (
    <div
      className="flex mb-4 gap-4"
      onTouchStart={handleTouchInteraction}
      onTouchMove={handleTouchInteraction}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <MechanicalButton
        isPressed={pressedButtons.has(5)}
        data-keycode="5"
        className="mt-10"
      >
        B
      </MechanicalButton>

      <MechanicalButton isPressed={pressedButtons.has(4)} data-keycode="4">
        A
      </MechanicalButton>
    </div>
  )
}
