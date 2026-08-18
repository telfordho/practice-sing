export function hertzToMidi(hertz: number) {
  return 69 + 12 * Math.log2(hertz / 440);
}
