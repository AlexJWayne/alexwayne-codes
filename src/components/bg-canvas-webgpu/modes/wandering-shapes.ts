import * as d from "typegpu/data"
import * as std from "typegpu/std"
import * as sdf from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"
import tgpu from "typegpu"

const timescale = tgpu.const(d.f32, 0.05)

export function wanderingShapes({ elapsed, uv: _uv }: Globals) {
  "use gpu"

  let uv = d.vec2f(_uv)
  uv.x = (uv.x / uv.y) * 0.5 // perspective effect

  const time = elapsed * timescale.$

  let value = d.f32(10)

  value = sdf.opUnion(
    value,
    sdf.sdDisk(uv.sub(d.vec2f(std.sin(time), std.cos(time)).mul(0.8)), 0.3),
  )

  value = sdf.opUnion(
    value,
    sdf.sdDisk(
      uv.sub(d.vec2f(std.sin(time * 3), std.cos(time * 2)).mul(0.4)),
      0.5,
    ),
  )

  value = sdf.opUnion(
    value,
    sdf.sdDisk(
      uv.sub(d.vec2f(std.sin(time * 4), std.cos(time * 5)).mul(0.5)),
      0.4,
    ),
  )

  value -= time
  value = std.abs(std.fract(value * 3) * 2 - 1)

  value += 1 - std.smoothstep(0, 0.05, std.abs(uv.y))
  value = std.step(0.5, value)

  return value
}
