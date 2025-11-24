import * as d from "typegpu/data"
import * as std from "typegpu/std"
import * as sdf from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"
import { rotate } from "../lib"

const MAX_STEPS = d.i32(20)
const MAX_DISTANCE = d.f32(10)
const EPSILON = d.f32(0.001)

const TIME_SCALE = d.f32(1)

const UP = d.vec3f(0, 1, 0)
const RIGHT = d.vec3f(1, 0, 0)
const FORWARD = d.vec3f(0, 0, 1)

const SPIKE_DENSITY = d.f32(30)
const CAMERA_SPEED = d.f32(0.25)

const lightDirection = std.normalize(d.vec3f(0, 1, 1))

function scene(time: number, point: d.v3f) {
  "use gpu"

  const S = d.f32(2)

  let p = d.vec3f(
    point.x - std.round(point.x / S) * S,
    point.y - std.round(point.y / S) * S,
    point.z,
  )

  const id = std.round(point.div(S))

  p = rotateVec3(
    p,
    d.mat4x4f
      .identity()
      .mul(d.mat4x4f.rotationX(time * 0.2 + id.x * 2))
      .mul(d.mat4x4f.rotationZ(time * 0.3 + id.z * 3)),
  )

  const pointNormalized = std.normalize(p)

  const angle = d.vec3f(
    std.dot(RIGHT, pointNormalized),
    std.dot(UP, pointNormalized),
    std.dot(FORWARD, pointNormalized),
  )

  const spikeHeight = 0.01

  const r = d.f32(0.8) + std.sin(time + angle.x * SPIKE_DENSITY) * spikeHeight

  return sdf.sdSphere(p, r)
}

function rotateVec3(vec: d.v3f, rotation: d.m4x4f): d.v3f {
  "use gpu"
  return d.vec4f(vec, 1).mul(rotation).xyz
}

function getNormal(elapsed: number, p: d.v3f): d.v3f {
  "use gpu"

  const k1 = d.vec3f(1.0, -1.0, -1.0)
  const k2 = d.vec3f(-1.0, -1.0, 1.0)
  const k3 = d.vec3f(-1.0, 1.0, -1.0)
  const k4 = d.vec3f(1.0, 1.0, 1.0)

  const n1 = k1.mul(scene(elapsed, p.add(k1.mul(EPSILON))))
  const n2 = k2.mul(scene(elapsed, p.add(k2.mul(EPSILON))))
  const n3 = k3.mul(scene(elapsed, p.add(k3.mul(EPSILON))))
  const n4 = k4.mul(scene(elapsed, p.add(k4.mul(EPSILON))))

  return std.normalize(n1.add(n2).add(n3).add(n4))
}

export function ball({ elapsed, uv }: Globals): number {
  "use gpu"

  const time = elapsed * TIME_SCALE
  const cameraPosition = d.vec3f(
    -time * CAMERA_SPEED - time * 0.2,
    time * CAMERA_SPEED + std.sin(time * 0.3),
    5,
  )
  const rayDirection = std.normalize(d.vec3f(rotate(uv, Math.PI / 4), -1.5))

  let totalDist = d.f32()
  let dist = d.f32()
  let normal = d.vec3f()
  let hit = false

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition.add(rayDirection.mul(totalDist))
    dist = scene(time, point)
    if (dist < EPSILON) {
      hit = true
      normal = getNormal(time, point)
      break
    }
    totalDist += dist

    if (totalDist > MAX_DISTANCE) break
  }

  if (hit) {
    const lightIntensity = std.max(std.dot(normal, lightDirection), 0.0)
    return std.smoothstep(0.5, 0.65, lightIntensity)
  }

  return d.f32(0)
}
