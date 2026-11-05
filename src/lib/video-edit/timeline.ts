/** The closest the timeline zooms in: a second is wide enough to aim at. */
export const MAX_PX_PER_SECOND = 24

const TICK_STEPS = [
  1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200,
]

/** Labelled ticks at least this far apart are readable. */
const MIN_TICK_SPACING_PX = 72

/** The smallest round interval that keeps labels from running together. */
export function tickStep(pxPerSecond: number): number {
  return (
    TICK_STEPS.find((step) => step * pxPerSecond >= MIN_TICK_SPACING_PX) ??
    TICK_STEPS[TICK_STEPS.length - 1]
  )
}

/** Tick times within a range, so an eight-hour stream only ever draws a screenful. */
export function ticksBetween(from: number, to: number, step: number): number[] {
  const ticks: number[] = []
  for (
    let time = Math.max(0, Math.floor(from / step) * step);
    time <= to;
    time += step
  )
    ticks.push(time)
  return ticks
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), Math.max(low, high))
}

/** The nearest target within reach, or the time as it was. */
export function snapTime(
  time: number,
  targets: readonly number[],
  within: number
): number {
  let best = time
  let distance = within
  for (const target of targets) {
    const gap = Math.abs(target - time)
    if (gap <= distance) {
      best = target
      distance = gap
    }
  }
  return best
}
