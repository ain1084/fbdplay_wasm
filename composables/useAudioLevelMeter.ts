class AnalyzeContext {
  private readonly _analyser: AnalyserNode
  private readonly _data: Uint8Array

  constructor(sourceNode: AudioNode) {
    this._analyser = sourceNode.context.createAnalyser()
    sourceNode.connect(this._analyser)
    this._data = new Uint8Array(this._analyser.frequencyBinCount)
  }

  public getLevel(): number {
    this._analyser.getByteFrequencyData(this._data)
    const sum = this._data.reduce((sum, value) => sum + value, 0)
    return sum / (this._data.length * 255.0)
  }
}

class LevelMeterContext {
  private readonly _analyzeContext: AnalyzeContext
  private readonly _level: Ref<number>
  private readonly _peakHold: Ref<number>
  private readonly _params: AudioLevelMeterParams

  private _animationFrameId: number = 0
  private _prevTime: number = Date.now()

  constructor(sourceNode: AudioNode, level: Ref<number>, peakHold: Ref<number>, params: AudioLevelMeterParams) {
    this._analyzeContext = new AnalyzeContext(sourceNode)
    this._level = level
    this._peakHold = peakHold
    this._params = params
    this.requestAnimationFrame()
  }

  public cleanup() {
    cancelAnimationFrame(this._animationFrameId)
    this._level.value = 0
    this._peakHold.value = 0
  }

  private requestAnimationFrame() {
    this._animationFrameId = requestAnimationFrame(() => {
      const level = this._level
      const peakHold = this._peakHold
      level.value = Math.floor(
        this._analyzeContext.getLevel() * this._params.totalBars.value / this._params.expectedMaxAmplitude.value)
      const now = Date.now()
      if (peakHold.value < level.value || this._prevTime + this._params.peakHoldTime.value < now) {
        this._prevTime = now
        peakHold.value = level.value
      }
      this.requestAnimationFrame()
    })
  }
}

type AudioLevelMeterParams = Readonly<{
  totalBars: Readonly<Ref<number>>
  peakHoldTime: Readonly<Ref<number>>
  expectedMaxAmplitude: Readonly<Ref<number>>
}>

export const useAudioLevelMeter = (params: AudioLevelMeterParams) => {
  let context: LevelMeterContext | undefined = undefined
  const level = ref(0)
  const peakHold = ref(0)

  useFbdPlayer().addEventListener((ev) => {
    switch (ev.type) {
      case 'start':
        context = new LevelMeterContext(ev.node, level, peakHold, params)
        break
      case 'stop':
        context?.cleanup()
        context = undefined
        break
    }
  })

  return {
    level,
    peakHold,
  }
}
