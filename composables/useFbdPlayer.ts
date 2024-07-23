import {
  UnderrunEvent,
  StopEvent,
  type OutputStreamNode } from '@ain1084/audio-worklet-stream'
import { FbdFrameFiller, type FbdFrameFillerParams } from '~/src/fbdPlayer/fbdFrameBufferFiller'
import worker from '@/src/fbdPlayer/fbdPlayWorker?worker'

export type PlayerEvent = Readonly<
  {
    type: 'stop'
    frames: bigint
  } | {
    type: 'underrun'
    frames: number
  } | {
    type: 'start'
    node: AudioNode
  }
>

export type PlayerEventListener = (ev: PlayerEvent) => void

const isPlaying = ref<boolean>(false)
const eventListeners: PlayerEventListener[] = []
let playerContext: PlayerContext | undefined = undefined

const fireEvent = (ev: PlayerEvent) => {
  eventListeners.forEach(listener => listener(ev))
}

class PlayerContext {
  private readonly _node: OutputStreamNode

  constructor(node: OutputStreamNode) {
    this._node = node
    node.addEventListener(StopEvent.type, this.handleStopped.bind(this))
    node.addEventListener(UnderrunEvent.type, this.handleUnderrun.bind(this))
    node.connect(node.context.destination)
    node.start()
    isPlaying.value = true
    fireEvent({ type: 'start', node })
  }

  private handleStopped(ev: StopEvent) {
    isPlaying.value = false
    fireEvent({ type: 'stop', frames: ev.frames })
  }

  private handleUnderrun(ev: UnderrunEvent) {
    fireEvent({ type: 'underrun', frames: ev.frames })
  }

  public async stop() {
    await this._node.stop()
    this._node.removeEventListener(StopEvent.type, this.handleStopped.bind(this))
    this._node.removeEventListener(UnderrunEvent.type, this.handleUnderrun.bind(this))
  }

  public static async create(data: Uint8Array) {
    const { audioOutput, createAudioStreamFactory } = useSettings()
    const factory = await createAudioStreamFactory()
    const sampleRate = factory.audioContext.sampleRate

    const fillerParams: FbdFrameFillerParams = {
      data: new Uint8Array(data),
      clockRate: audioOutput.clockRate.value,
      sampleRate: factory.audioContext.sampleRate,
      psgCrate: audioOutput.psgCrate.value,
    }

    const node = audioOutput.streamType.value === 'timer'
      ? await factory.createTimedBufferNode(new FbdFrameFiller(fillerParams), { sampleRate, channelCount: 1 })
      : await factory.createWorkerBufferNode(worker, { sampleRate, channelCount: 1, fillerParams })
    return new PlayerContext(node)
  }

  public get node(): OutputStreamNode {
    return this._node
  }

  public get position(): Date | undefined {
    return new Date(Number(this._node.totalReadFrames * BigInt(1000) / BigInt(this._node.context.sampleRate)))
  }
}

const play = async (data: Uint8Array) => {
  await stop()
  playerContext = await PlayerContext.create(data)
}

const stop = async () => {
  await playerContext?.stop()
  playerContext = undefined
}

const getPosition = (): Date | undefined => {
  return playerContext?.position
}

const addEventListener = (listener: PlayerEventListener) => {
  eventListeners.push(listener)
}

const removeEventListener = (listener: PlayerEventListener) => {
  for (let i = eventListeners.length - 1; i >= 0; i--) {
    if (eventListeners[i] === listener) {
      eventListeners.splice(i, 1)
    }
  }
}

export const useFbdPlayer = () => {
  return {
    play,
    stop,
    isPlaying,
    getPosition,
    addEventListener: (listener: PlayerEventListener) => {
      addEventListener(listener)
      onUnmounted(() => {
        removeEventListener(listener)
      })
    },
  }
}
