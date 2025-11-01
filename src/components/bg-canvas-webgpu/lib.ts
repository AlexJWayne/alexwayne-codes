import * as std from "typegpu/std"
import * as d from "typegpu/data"

export function sinNorm(x: number): number {
  "use gpu"
  return (std.sin(x) + 1) / 2
}

export function cosNorm(x: number): number {
  "use gpu"
  return std.cos((x + 1) / 2)
}

export function rotate(p: d.v2f, angle: number): d.v2f {
  "use gpu"
  const cos = std.cos(angle)
  const sin = std.sin(angle)
  return d.vec2f(cos * p.x - sin * p.y, sin * p.x + cos * p.y)
}

function inverseLerp(v: number, minValue: number, maxValue: number): number {
  "use gpu"
  return (v - minValue) / (maxValue - minValue)
}
export function remap(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  "use gpu"
  const t = inverseLerp(v, inMin, inMax)
  return std.mix(outMin, outMax, t)
}
