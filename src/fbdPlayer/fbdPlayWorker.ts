import { BufferFillWorker } from '@ain1084/audio-worklet-stream'
import { FbdFrameFiller, type FbdFrameFillerParams } from './fbdFrameBufferFiller'
import wasmModuleInit from '@/rs_fbdplay/pkg/rs_fbdplay'

new BufferFillWorker<FbdFrameFillerParams>(FbdFrameFiller, () => wasmModuleInit().then(() => {}))
