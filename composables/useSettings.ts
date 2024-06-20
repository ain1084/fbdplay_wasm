import { PsgCrate } from "~/rs_fbdplay/pkg/rs_fbdplay";

export const useSettings = () => {
  return {
    clockRate: useState<number>("clock-rate", () => 2.0),
    sampleRate: useState<number>("sample-rate", () => 44100),
    psgCrate: useState<PsgCrate>("psg-crate", () => PsgCrate.Psg),
  };
};
