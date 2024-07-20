import { StreamNodeFactory } from '@ain1084/audio-worklet-stream'
import { PsgCrate } from '~/rs_fbdplay/pkg/rs_fbdplay'
import type { StreamType } from '~/types/StreamType'

// Singleton class to manage Audio settings and resources
class AudioSettingsManager {
  private static instance: AudioSettingsManager
  private audioContext: AudioContext | null = null
  private currentSampleRate: number | null = null
  private requestedSampleRate: number | null = null
  private streamNodeFactory: StreamNodeFactory | null = null

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Get the singleton instance of AudioSettingsManager
  static getInstance(): AudioSettingsManager {
    if (!this.instance) {
      this.instance = new AudioSettingsManager()
    }
    return this.instance
  }

  // Get the sample rate, considering requested sample rate, current AudioContext, and default system sample rate
  getSampleRate(): number {
    if (this.requestedSampleRate !== null) {
      return this.requestedSampleRate
    }

    if (this.audioContext !== null) {
      return this.audioContext.sampleRate
    }

    // Create a temporary AudioContext to get the default sample rate
    const temporaryAudioContext = new AudioContext()
    const defaultSampleRate = temporaryAudioContext.sampleRate
    temporaryAudioContext.close()
    return defaultSampleRate
  }

  // Create or update the AudioContext based on the requested sample rate
  createAudioContext(): AudioContext {
    if (!this.audioContext || (this.requestedSampleRate && this.requestedSampleRate !== this.currentSampleRate)) {
      if (this.audioContext) {
        this.audioContext.close()
      }
      // Note: AudioContext creation should be triggered by user interaction to comply with browser policies
      this.audioContext = new AudioContext({ sampleRate: this.requestedSampleRate ?? undefined })
      this.currentSampleRate = this.audioContext.sampleRate
      this.requestedSampleRate = null
      this.streamNodeFactory = null
      console.log(`Create AudioContext sampleRate: ${this.currentSampleRate}`)
    }
    return this.audioContext
  }

  // Set the requested sample rate and invalidate the current AudioStreamFactory
  setSampleRate(sampleRate: number): void {
    this.requestedSampleRate = sampleRate
    this.streamNodeFactory = null
  }

  // Create or get the existing AudioStreamFactory based on the current AudioContext
  async createStreamNodeFactory(): Promise<StreamNodeFactory> {
    const audioContext = this.createAudioContext()
    if (!this.streamNodeFactory) {
      console.log(`Create AudioStreamFactory sampleRate: ${audioContext.sampleRate}`)
      this.streamNodeFactory = await StreamNodeFactory.create(audioContext)
    }
    return this.streamNodeFactory
  }
}

// Composable function to use the Audio settings and resources
export const useSettings = () => {
  const manager = AudioSettingsManager.getInstance()
  const sampleRateRef = ref<number | null>(null)

  return {
    // Reactive state for clock rate and PSG crate settings
    clockRate: useState<number>('clock-rate', () => 2.0),
    psgCrate: useState<PsgCrate>('psg-crate', () => PsgCrate.Psg),
    streamType: useState<StreamType>('stream-type', () => 'worker'),

    // Computed property for sample rate, lazy-loaded and updated through the manager
    sampleRate: computed({
      get: (): number => {
        sampleRateRef.value ??= manager.getSampleRate()
        console.log(`Get sampleRate: ${sampleRateRef.value}`)
        return sampleRateRef.value
      },
      set: (sampleRate: number) => {
        console.log(`Set sampleRate: ${sampleRate}`)
        manager.setSampleRate(sampleRate)
        sampleRateRef.value = sampleRate
      },
    }),

    audioContext: () => manager.createAudioContext(),

    // Methods to create AudioContext and AudioStreamFactory
    // Note: These are not reactive to ensure AudioContext creation is user-triggered
    createAudioStreamFactory: () => manager.createStreamNodeFactory(),
  }
}
