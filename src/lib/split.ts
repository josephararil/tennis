export function durationSplit(duration: 30 | 60 | 90): [number, number, number, number] {
  if (duration === 30) return [5, 10, 10, 5];
  if (duration === 90) return [15, 30, 30, 15];
  return [10, 20, 20, 10];
}
