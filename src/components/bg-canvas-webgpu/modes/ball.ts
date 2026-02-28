import {
  f32,
  i32,
  mat4x4f,
  vec3f,
  vec4f,
  type m4x4f,
  type v3f,
} from "typegpu/data"
import { dot, max, normalize, round, sin, smoothstep } from "typegpu/std"
import { sdSphere } from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"
import { rotate } from "../lib"

const MAX_STEPS = i32(20)
const MAX_DISTANCE = f32(10)
const EPSILON = f32(0.001)

const TIME_SCALE = f32(1)

const UP = vec3f(0, 1, 0)
const RIGHT = vec3f(1, 0, 0)
const FORWARD = vec3f(0, 0, 1)

const SPIKE_DENSITY = f32(30)
const CAMERA_SPEED = f32(0.25)

const lightDirection = normalize(vec3f(0, 1, 1))

function scene(time: number, point: v3f) {
  "use gpu"

  const S = f32(2)

  let p = vec3f(
    point.x - round(point.x / S) * S,
    point.y - round(point.y / S) * S,
    point.z,
  )

  const id = round(point / S)

  p = rotateVec3(
    p,
    mat4x4f.identity() *
      mat4x4f.rotationX(time * 0.2 + id.x * 2) *
      mat4x4f.rotationZ(time * 0.3 + id.z * 3),
  )

  const pointNormalized = normalize(p)

  const angle = vec3f(
    dot(RIGHT, pointNormalized),
    dot(UP, pointNormalized),
    dot(FORWARD, pointNormalized),
  )

  const spikeHeight = 0.01

  const r = f32(0.8) + sin(time + angle.x * SPIKE_DENSITY) * spikeHeight

  return sdSphere(p, r)
}

function rotateVec3(vec: v3f, rotation: m4x4f): v3f {
  "use gpu"
  return (vec4f(vec, 1) * rotation).xyz
}

function getNormal(elapsed: number, p: v3f): v3f {
  "use gpu"

  const k1 = vec3f(1.0, -1.0, -1.0)
  const k2 = vec3f(-1.0, -1.0, 1.0)
  const k3 = vec3f(-1.0, 1.0, -1.0)
  const k4 = vec3f(1.0, 1.0, 1.0)

  const n1 = k1 * scene(elapsed, p + k1 * EPSILON)
  const n2 = k2 * scene(elapsed, p + k2 * EPSILON)
  const n3 = k3 * scene(elapsed, p + k3 * EPSILON)
  const n4 = k4 * scene(elapsed, p + k4 * EPSILON)

  return normalize(n1 + n2 + n3 + n4)
}

export function ball({ elapsed, uv }: Globals): number {
  "use gpu"

  const time = elapsed * TIME_SCALE
  const cameraPosition = vec3f(
    -time * CAMERA_SPEED - time * 0.2,
    time * CAMERA_SPEED + sin(time * 0.3),
    5,
  )
  const rayDirection = normalize(vec3f(rotate(uv, Math.PI / 4), -1.5))

  let totalDist = f32()
  let dist = f32()
  let normal = vec3f()
  let hit = false

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition + rayDirection * totalDist
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
    const lightIntensity = max(dot(normal, lightDirection), 0.0)
    return smoothstep(0.5, 0.65, lightIntensity)
  }

  return f32(0)
}
