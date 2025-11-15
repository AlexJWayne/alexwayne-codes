const N = 100
const times: number[] = Array(N).fill(0)
let index = 0

export function reportTime(
  startNs: bigint,
  endNs: bigint,
  onReport: (avg: number) => void,
) {
  times[index] = Number(endNs - startNs)
  index++

  if (index >= N) {
    const avgNs = times.reduce((a, b) => a + b, 0) / N
    const avgMs = avgNs / 1_000_000

    index = 0
    onReport(avgMs)
  }
}
