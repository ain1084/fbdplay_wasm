import type { FrameBufferFiller, FrameBufferWriter } from '@ain1084/audio-worklet-stream'
import { FbdPlayer, type PsgCrate } from '~/rs_fbdplay/pkg/rs_fbdplay'

export type FbdFrameFillerParams = Readonly<{
  data: Uint8Array
  clockRate: number
  sampleRate: number
  psgCrate: PsgCrate
}>

export class FbdFrameFiller implements FrameBufferFiller {
  private readonly _fbdPlayer: FbdPlayer
  private readonly _sampleBuffer = new Float32Array(512)

  constructor(params: FbdFrameFillerParams) {
    this._fbdPlayer = new FbdPlayer(
      params.data,
      params.clockRate,
      params.sampleRate,
      params.psgCrate,
    )
  }

  fill(writer: FrameBufferWriter): boolean {
    writer.write((frame, _offset) => {
      let total = 0
      while (total < frame.frames) {
        const requestSamples = Math.min(frame.frames - total, this._sampleBuffer.length)
        const filledSamples = this._fbdPlayer.fill_buffer(this._sampleBuffer, 0, requestSamples)
        const frameIndex = total + frame.index
        frame.buffer.setFrames(frameIndex, this._sampleBuffer, 0, filledSamples)
        total += filledSamples
        if (requestSamples > filledSamples) {
          break
        }
      }
      // Since it is mono, return sampleCount as the frame count
      return total
    })
    return this._fbdPlayer.is_playing()
  }
}
