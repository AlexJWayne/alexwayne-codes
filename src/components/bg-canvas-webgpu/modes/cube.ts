import { i32, f32, vec3f, vec4f, mat4x4f, type v3f } from "typegpu/data"
import { normalize, sin, cos, max, dot, smoothstep } from "typegpu/std"
import { opSmoothUnion, sdBox3d, sdSphere } from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"

const MAX_STEPS = i32(32)
const MAX_DISTANCE = f32(6)
const EPSILON = f32(0.005)

const TIME_SCALE = f32(0.2)

const cameraPosition = vec3f(0.0, 0.0, 3.0)
const lightDirection = normalize(vec3f(0.5, 1, 2))

function scene(elapsed: number, point: v3f): number {
  "use gpu"
  const time = elapsed * TIME_SCALE

  let value = myCube(time, point)
  for (let i = i32(0); i < 6; i++) {
    const sphereTime = time * (f32(i) * 0.1 + 1) + f32(i)
    value = opSmoothUnion(value, mySphere(sphereTime, point), 0.5)
  }
  return value
}

function myCube(time: number, point: v3f): number {
  "use gpu"

  let p = vec4f(point, 1)
  p = p * mat4x4f.rotationY(time)
  p = p * mat4x4f.rotationX(time * 0.5)

  p.x += sin(time) * 0.6
  p.y += cos(time * 1.17) * 0.6

  return sdBox3d(p.xyz, vec3f(0.5))
}

function mySphere(time: number, point: v3f): number {
  "use gpu"

  const p =
    point +
    vec3f(
      cos(time * 1.17) * 1.2, //
      -sin(time),
      sin(time * 0.5),
    )
  return sdSphere(p, 0.3)
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

export function cube({ elapsed, uv }: Globals): number {
  "use gpu"

  const rayDirection = normalize(vec3f(uv, -1.5))

  let totalDist = f32()
  let dist = f32()
  let hit = false
  let normal = vec3f()

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition + rayDirection * totalDist
    dist = scene(elapsed, point)
    if (dist < EPSILON) {
      hit = true
      normal = getNormal(elapsed, point)
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
