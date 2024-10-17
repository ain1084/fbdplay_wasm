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

  constructor(params: FbdFrameFillerParams) {
    this._fbdPlayer = new FbdPlayer(
      params.data,
      params.clockRate,
      params.sampleRate,
      params.psgCrate,
    )
  }

  fill(writer: FrameBufferWriter): boolean {
    writer.write(buffer => this._fbdPlayer.fill_buffer(buffer))
    return this._fbdPlayer.is_playing()
  }
}
