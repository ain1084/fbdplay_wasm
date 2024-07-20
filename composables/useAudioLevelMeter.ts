export const useAudioLevelMeter = (totalBars: Readonly<Ref<number>>, peakHoldTime: number, expectedMaxLevel: number) => {
  const level = ref(0)
  const peakHold = ref(0)

  let context: LevelMeterContext | undefined = undefined

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
      return sum / (this._data.length * 255.0 * expectedMaxLevel)
    }
  }

  class LevelMeterContext {
    private readonly _analyzeContext: AnalyzeContext
    private _animationFrameId: number = 0
    private _prevTime: number = Date.now()

    constructor(sourceNode: AudioNode) {
      this._analyzeContext = new AnalyzeContext(sourceNode)
      peakHold.value = 0
      this.startAnimationFrame()
    }

    public update() {
      const value = this._analyzeContext.getLevel()
      level.value = Math.floor(value * totalBars.value)
      const now = Date.now()
      if (peakHold.value < level.value || this._prevTime + peakHoldTime < now) {
        this._prevTime = now
        peakHold.value = level.value
      }
      this.startAnimationFrame()
    }

    public cleanup() {
      cancelAnimationFrame(this._animationFrameId)
    }

    private startAnimationFrame() {
      this._animationFrameId = requestAnimationFrame(this.update.bind(this))
    }
  }

  useFbdPlayer().addEventListener((ev) => {
    switch (ev.type) {
      case 'start':
        context = new LevelMeterContext(ev.node)
        break
      case 'stop':
        context?.cleanup()
        level.value = 0
        peakHold.value = 0
        context = undefined
        break
    }
  })

  return {
    level,
    peakHold,
  }
}
