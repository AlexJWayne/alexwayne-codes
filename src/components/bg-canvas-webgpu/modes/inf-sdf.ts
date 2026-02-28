import { i32, f32, vec3f, type v3f } from "typegpu/data"
import { round, sin, cos, normalize } from "typegpu/std"
import { sdSphere } from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"
import { remap } from "../lib"

const MAX_STEPS = i32(32)
const MAX_DISTANCE = f32(20)
const EPSILON = f32(0.001)

const TIME_SCALE = f32(0.1)

function scene(time: number, point: v3f, s: number) {
  "use gpu"

  const repeatedPoint = point - round(point.div(s)).mul(s)
  const id = round(point.div(s))

  const pos =
    repeatedPoint -
    vec3f(
      sin(time + id.x + id.z + id.y) * 0.2,
      cos(time * 1.37 + id.x + id.z + id.y) * 0.2,
      0,
    )
  return sdSphere(pos, 0.3)
}

export function infSdf({ elapsed, uv }: Globals): number {
  "use gpu"

  const time = elapsed * TIME_SCALE
  const cameraPosition = vec3f(
    sin(time * 0.4) * 1.3,
    cos(time * 0.4) * 1.3,
    time * 4,
  )
  const rayDirection = normalize(vec3f(uv, -1.5))

  let totalDist = f32()
  let dist = f32()
  let hit = false

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition + rayDirection.mul(totalDist)
    dist = scene(time, point, f32(2))
    if (dist < EPSILON) {
      hit = true
      break
    }
    totalDist += dist

    if (totalDist > MAX_DISTANCE) break
  }

  if (hit) {
    return remap(1 - totalDist / MAX_DISTANCE, f32(0), f32(0.5), f32(0), f32(1))
  }

  return f32(0)
}
