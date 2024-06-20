import { FbdPlayer } from "~/rs_fbdplay/pkg/rs_fbdplay";

const BUFFER_SIZE_RATIO = 10; // 100 = sample rate, 50 = sample rate / 2
const FILL_INTERVAL_MS = 50;

class Player {
  private fbdPlayer: FbdPlayer | undefined;
  private timerId: number | undefined;

  public play(data: Uint8Array) {
    this.fbdPlayer?.free();
    this.fbdPlayer = undefined;

    const { clockRate, sampleRate, psgCrate } = useSettings();

    this.fbdPlayer = new FbdPlayer(
      data,
      clockRate.value,
      sampleRate.value,
      psgCrate.value,
      BUFFER_SIZE_RATIO
    );
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
    }
    this.timerId = window.setInterval(() => {
      if (this.fbdPlayer === undefined || this.timerId === undefined) {
        return;
      }
      if (!this.fbdPlayer.fill_buffer()) {
        window.clearInterval(this.timerId);
        this.timerId = undefined;
      }
    }, FILL_INTERVAL_MS);
  }

  public stop() {
    this.fbdPlayer?.free();
    this.fbdPlayer = undefined;
  }
}

export const useFbdPlayer = () => {
  return new Player();
};
