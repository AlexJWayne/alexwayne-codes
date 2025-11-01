import * as d from "typegpu/data"
import * as std from "typegpu/std"

import type { Globals } from "../fragment-shader"
import { remap, rotate } from "../lib"

export function circleGrid({ elapsed, uv: _uv }: Globals): number {
  "use gpu"

  let uv = _uv
  uv = rotate(uv, elapsed * 0.015)
  uv = uv.add(
    d.vec2f(std.sin(elapsed * 0.1) * 0.15, std.cos(elapsed * 0.13) * 0.25),
  )
  uv = uv.mul(8 + std.sin(elapsed * 0.09))
  uv = uv.mul(0.3)

  const gridUv = std.fract(uv).sub(0.5)

  const distance = std.fract(std.length(gridUv))
  const timeWithOffset = elapsed + std.sin(uv.x) + std.sin(uv.y)
  const edge = remap(std.sin(timeWithOffset * 0.25), -1.0, 1.0, 0.05, 0.66)
  const circle = 1 - std.step(edge, distance)

  return circle
}
