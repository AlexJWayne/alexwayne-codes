import * as d from "typegpu/data"
import * as std from "typegpu/std"

// SDFs: https://iquilezles.org/articles/distfunctions2d/

export function opUnion(a: number, b: number): number {
  "use gpu"
  return std.min(a, b)
}

export function opXor(a: number, b: number): number {
  "use gpu"
  return std.max(std.min(a, b), -std.max(a, b))
}

export function sdCircle(point: d.v2f, radius: number): number {
  "use gpu"
  return std.length(point) - radius
}

export function sdBox(point: d.v2f, corner: d.v2f): number {
  "use gpu"
  const distance = std.abs(point).sub(corner)
  return std.length(
    std.max(
      distance,
      d.vec2f(0.0).add(std.min(std.max(distance.x, distance.y), 0)),
    ),
  )
}
