/**
 * Modern Web Audio API wrapper for GameBoy emulator
 * Simpler replacement for XAudioJS
 * @see https://raw.githubusercontent.com/taisel/XAudioJS/master/XAudioServer.js
 */

export default class GameBoyAudio {
  constructor(
    channels,
    sampleRate,
    minBufferSize,
    maxBufferSize,
    underRunCallback,
    heartbeatCallback,
    postheartbeatCallback,
    volume,
    failureCallback
  ) {
    this.channels = channels || 2
    this.sampleRate = sampleRate || 44100
    this.volume = volume || 1
    this.underRunCallback = underRunCallback || (() => [])
    this.failureCallback = failureCallback || (() => {})

    this.audioContext = null
    this.scriptProcessor = null
    this.bufferSize = 4096
    this.audioBuffer = []
    this.isInitialized = false

    this.initializeAudio()
  }

  initializeAudio() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        throw new Error("Web Audio API not supported")
      }

      this.audioContext = new AudioContext({ sampleRate: this.sampleRate })

      // Create script processor (deprecated but still works and is what the emulator needs)
      this.scriptProcessor = this.audioContext.createScriptProcessor(
        this.bufferSize,
        0,
        this.channels
      )

      this.scriptProcessor.onaudioprocess = (event) => {
        const outputBuffer = event.outputBuffer

        // Get audio samples from the buffer
        for (let channel = 0; channel < this.channels; channel++) {
          const output = outputBuffer.getChannelData(channel)

          for (let i = 0; i < output.length; i++) {
            if (this.audioBuffer.length > 0) {
              // Dequeue samples from buffer
              output[i] = this.audioBuffer.shift() * this.volume
            } else {
              // Silence if no data
              output[i] = 0
            }
          }
        }
      }

      // Connect to destination
      this.scriptProcessor.connect(this.audioContext.destination)

      // Resume context (required by some browsers)
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume()
      }

      this.isInitialized = true
      console.debug("GameBoy Audio initialized:", {
        sampleRate: this.audioContext.sampleRate,
        channels: this.channels,
        bufferSize: this.bufferSize,
      })
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      this.failureCallback()
    }
  }

  writeAudio(samples, length) {
    if (!this.isInitialized) return

    // Resume audio context on user interaction
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume()
    }

    // Add samples to buffer
    const samplesToWrite = Math.min(samples.length, length || samples.length)
    for (let i = 0; i < samplesToWrite; i++) {
      this.audioBuffer.push(samples[i])
    }

    // Prevent buffer from growing too large
    const maxBufferLength = this.sampleRate * this.channels // 1 second max
    if (this.audioBuffer.length > maxBufferLength) {
      this.audioBuffer = this.audioBuffer.slice(-maxBufferLength)
    }
  }

  writeAudioNoCallback(samples, length) {
    this.writeAudio(samples, length)
  }

  remainingBuffer() {
    if (!this.isInitialized) return null
    return this.audioBuffer.length
  }

  changeVolume(newVolume) {
    if (newVolume >= 0 && newVolume <= 1) {
      this.volume = newVolume
    }
  }

  executeCallback() {
    // Called by emulator to check if we need more samples
    if (!this.isInitialized) return

    const minBuffer = this.bufferSize * 2
    const samplesNeeded = minBuffer - this.audioBuffer.length

    if (samplesNeeded > 0 && this.underRunCallback) {
      const samples = this.underRunCallback(samplesNeeded)
      if (samples && samples.length > 0) {
        this.writeAudioNoCallback(samples, samples.length)
      }
    }
  }
}
