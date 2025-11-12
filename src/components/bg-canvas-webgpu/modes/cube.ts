import * as d from "typegpu/data"
import * as std from "typegpu/std"
import * as sdf from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"

const MAX_STEPS = d.i32(64)
const MAX_DISTANCE = d.f32(20.0)
const EPSILON = d.f32(0.01)

const TIME_SCALE = d.f32(0.2)

function scene(elapsed: number, point: d.v3f): number {
  "use gpu"
  const time = elapsed * TIME_SCALE

  let value = myCube(time, point)
  for (let i = d.i32(0); i < 6; i++) {
    value = sdf.opSmoothUnion(value, mySphere(time * d.f32(i), point), 0.5)
  }
  return value
}

function myCube(time: number, point: d.v3f): number {
  "use gpu"

  let p = d.vec4f(point, 1)
  p = p.mul(d.mat4x4f.rotationY(time))
  p = p.mul(d.mat4x4f.rotationX(time * 0.5))

  p.x += std.sin(time) * 0.4
  p.y += std.cos(time * 1.17) * 0.6

  return sdf.sdBoxFrame3d(p.xyz, d.vec3f(1), 0.0001) - 0.15
}

function mySphere(time: number, point: d.v3f): number {
  "use gpu"

  let p = point
  p.x += std.cos(time * 1.17) * 1.2
  p.y -= std.sin(time) //* 1
  p.z += std.sin(time * 0.5) //* 1
  return sdf.sdSphere(p, 0.25)
}

export function cube({ elapsed, uv }: Globals): number {
  "use gpu"

  const cameraPosition = d.vec3f(0.0, 0.0, 3.0)
  const rayDirection = std.normalize(d.vec3f(uv, -1.5))

  let totalDist = d.f32()
  let dist = d.f32()
  let hit = false

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition.add(rayDirection.mul(totalDist))
    dist = scene(elapsed, point)
    if (dist < EPSILON) {
      hit = true
      break
    }
    totalDist += dist

    if (totalDist > MAX_DISTANCE) break
  }

  if (hit) return d.f32(1)
  else return d.f32(0)
}
