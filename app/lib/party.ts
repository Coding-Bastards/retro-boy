/**
 * Triggers a party popper celebration effect across the screen
 * Perfect for celebrating confirmed transactions!
 */
export async function runParty() {
  const confetti = (await import("canvas-confetti")).default

  // Create a burst from the left side
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { x: 0.1, y: 0.7 },
  })

  // Create a burst from the right side
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { x: 0.9, y: 0.7 },
  })

  // Create a center burst with more particles
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#FF6B35", "#FFED8E", "#FFD700", "#00FF00", "#D1FFB2"],
    })
  }, 250)

  // Final burst with stars
  setTimeout(() => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x: 0.5, y: 0.4 },
      shapes: ["square"],
      colors: ["#00FF00", "#FFED8E", "#FFD700"],
    })
  }, 500)
}
