import { f32, vec2f } from "typegpu/data"
import { cos, fract, length, sin, step } from "typegpu/std"

import type { Globals } from "../fragment-shader"
import { remap, rotate } from "../lib"

export function circleGrid({ elapsed, uv: _uv }: Globals): number {
  "use gpu"

  let uv = vec2f(_uv)
  uv = rotate(uv, elapsed * 0.015)
  uv += vec2f(sin(elapsed * 0.1) * 0.15, cos(elapsed * 0.13) * 0.25)
  uv *= 8 + sin(elapsed * 0.09)
  uv *= 0.3

  const gridUv = fract(uv).sub(0.5)

  const distance = fract(length(gridUv))
  const timeWithOffset = elapsed + sin(uv.x) + sin(uv.y)
  const edge = remap(sin(timeWithOffset * 0.25), f32(-1), f32(1), 0.05, 0.66)
  const circle = 1 - step(edge, distance)

  return circle
}
