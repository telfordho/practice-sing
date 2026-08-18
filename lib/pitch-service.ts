import { Platform } from "react-native";
import { hertzToMidi } from "@/lib/music";

export { hertzToMidi } from "@/lib/music";

export type LivePitchFrame = { hertz: number; confidence: number; volume: number };
type PitchyEvent = { pitch: number; confidence: number; volume: number };
type PitchyModule = {
  init: (config: { algorithm: "YIN"; bufferSize: number; minVolume: number }) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  addListener: (callback: (event: PitchyEvent) => void) => { remove: () => void };
};

function nativePitchy(): PitchyModule | null {
  if (Platform.OS === "web") return null;
  try {
    return require("react-native-pitchy").default as PitchyModule;
  } catch {
    return null;
  }
}

export async function beginPitchTracking(onFrame: (frame: LivePitchFrame) => void) {
  const module = nativePitchy();
  if (!module) return async () => undefined;
  module.init({ algorithm: "YIN", bufferSize: 4096, minVolume: -55 });
  const subscription = module.addListener(({ pitch, confidence, volume }) => {
    if (pitch > 0) onFrame({ hertz: pitch, confidence, volume });
  });
  await module.start();
  return async () => {
    subscription.remove();
    await module.stop();
  };
}
