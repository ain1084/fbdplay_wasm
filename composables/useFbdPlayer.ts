import {
  UnderrunEvent,
  StopEvent,
  type StreamNodeFactory,
  type OutputStreamNode } from '@ain1084/audio-worklet-stream'
import { FbdFrameFiller, type FbdFrameFillerParams } from '~/src/fbdPlayer/fbdFrameBufferFiller'
import worker from '@/src/fbdPlayer/fbdPlayWorker?worker'

type EventListeners = Readonly<{
  stop?: (ev: StopEvent) => void
  underrun?: (ev: UnderrunEvent) => void
}>

export class PlayerContext {
  private readonly _node: OutputStreamNode
  private readonly _eventListeners: EventListeners | undefined

  constructor(node: OutputStreamNode, eventListeners?: EventListeners) {
    this._eventListeners = eventListeners
    this._node = node
    node.addEventListener(StopEvent.type, this.handleStopped.bind(this), { once: true })
    node.addEventListener(UnderrunEvent.type, this.handleUnderrun.bind(this))
    node.connect(node.context.destination)
    node.start()
  }

  public static async create(factory: StreamNodeFactory, data: Uint8Array, eventListeners?: EventListeners) {
    const { clockRate, psgCrate, streamType } = useSettings()
    const sampleRate = factory.audioContext.sampleRate

    const fillerParams: FbdFrameFillerParams = {
      data: new Uint8Array(data),
      clockRate: clockRate.value,
      sampleRate,
      psgCrate: psgCrate.value,
    }

    const node = streamType.value === 'timer'
      ? await factory.createTimedBufferNode(new FbdFrameFiller(fillerParams), { sampleRate, channelCount: 1 })
      : await factory.createWorkerBufferNode(worker, { channelCount: 1, fillerParams })
    return new PlayerContext(node, eventListeners)
  }

  private handleStopped(ev: StopEvent) {
    this._eventListeners?.stop?.(ev)
    this._node.removeEventListener(StopEvent.type, this.handleStopped.bind(this))
    this._node.removeEventListener(UnderrunEvent.type, this.handleUnderrun.bind(this))
  }

  private handleUnderrun(ev: UnderrunEvent) {
    this._eventListeners?.underrun?.(ev)
  }

  public async stop() {
    return this._node?.stop()
  }
}

export const useFbdPlayer = (eventListeners?: EventListeners) => {
  return {
    createContext: async (factory: StreamNodeFactory, data: Uint8Array) => {
      return PlayerContext.create(factory, data, eventListeners)
    },
  }
}
