declare module "../app/lib/gameboy.js" {
  interface GameBoyOptions {
    sound?: boolean
    colorizeGb?: boolean
    bootRom?: boolean
    volume?: number
    channels?: boolean[]
  }

  class GameBoyCore {
    constructor(
      canvas: HTMLCanvasElement,
      rom: Uint8Array,
      options?: GameBoyOptions
    )
    start(): void
    run(): void
    JoyPadEvent(code: number, pressed: boolean): void
    stopEmulator: number
  }

  export default GameBoyCore
}
