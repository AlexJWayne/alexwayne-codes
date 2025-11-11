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

export function sdCircle(point: d.v2f | d.v3f, radius: number): number {
  "use gpu"
  return std.length(point) - radius
}

export const sdSphere = sdCircle

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

export function sd3BoxFrame(point: d.v3f, b: d.v3f, e: number) {
  "use gpu"
  const p = std.abs(point).sub(b)
  const q = std.abs(p.add(e)).sub(e)

  return std.min(
    std.min(
      std.length(std.max(d.vec3f(p.x, q.y, q.z), d.vec3f())) +
        std.min(std.max(p.x, std.max(q.y, q.z)), 0.0),

      std.length(std.max(d.vec3f(q.x, p.y, q.z), d.vec3f())) +
        std.min(std.max(q.x, std.max(p.y, q.z)), 0.0),
    ),
    std.length(std.max(d.vec3f(q.x, q.y, p.z), d.vec3f())) +
      std.min(std.max(q.x, std.max(q.y, p.z)), 0.0),
  )
}
