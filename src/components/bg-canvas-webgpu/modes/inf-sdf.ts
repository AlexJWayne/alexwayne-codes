import * as d from "typegpu/data"
import * as std from "typegpu/std"
import * as sdf from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"
import { remap } from "../lib"

const MAX_STEPS = d.i32(32)
const MAX_DISTANCE = d.f32(20)
const EPSILON = d.f32(0.001)

const TIME_SCALE = d.f32(0.1)

function scene(time: number, point: d.v3f, s: number) {
  "use gpu"

  const repeatedPoint = point.sub(std.round(point.div(s)).mul(s))
  const id = std.round(point.div(s))

  const pos = repeatedPoint.sub(
    d.vec3f(
      std.sin(time + id.x + id.z + id.y) * 0.2,
      std.cos(time * 1.37 + id.x + id.z + id.y) * 0.2,
      0,
    ),
  )
  return sdf.sdSphere(pos, 0.3)
}

export function infSdf({ elapsed, uv }: Globals): number {
  "use gpu"

  const time = elapsed * TIME_SCALE
  const cameraPosition = d.vec3f(
    std.sin(time * 0.4) * 1.3,
    std.cos(time * 0.4) * 1.3,
    -time * 4,
  )
  const rayDirection = std.normalize(d.vec3f(uv, -1.5))

  let totalDist = d.f32()
  let dist = d.f32()
  let hit = false

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition.add(rayDirection.mul(totalDist))
    dist = scene(time, point, d.f32(2))
    if (dist < EPSILON) {
      hit = true
      break
    }
    totalDist += dist

    if (totalDist > MAX_DISTANCE) break
  }

  if (hit) {
    return remap(
      1 - totalDist / MAX_DISTANCE,
      d.f32(0),
      d.f32(0.5),
      d.f32(0),
      d.f32(1),
    )
  }

  return d.f32(0)
}
