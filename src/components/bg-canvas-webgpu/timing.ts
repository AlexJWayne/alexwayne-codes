const N = 500
const times: number[] = Array(N).fill(0)
let index = 0

export function reportTime(startNs: bigint, endNs: bigint) {
  times[index] = Number(endNs - startNs)
  index++

  if (index >= N) {
    const avg = times.reduce((a, b) => a + b, 0) / N
    console.log(`AVG Render time: ${(avg / 1_000_000).toFixed(2)} ms`)
    index = 0
  }
}
