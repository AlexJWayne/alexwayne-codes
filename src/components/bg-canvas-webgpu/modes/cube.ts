import * as d from "typegpu/data"
import * as std from "typegpu/std"
import * as sdf from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"

const MAX_STEPS = d.i32(32)
const MAX_DISTANCE = d.f32(5)
const EPSILON = d.f32(0.005)

const TIME_SCALE = d.f32(0.2)

const cameraPosition = d.vec3f(0.0, 0.0, 3.0)
const lightDirection = std.normalize(d.vec3f(0.5, 1, 2))

function scene(elapsed: number, point: d.v3f): number {
  "use gpu"
  const time = elapsed * TIME_SCALE

  let value = myCube(time, point)
  for (let i = d.i32(0); i < 6; i++) {
    const sphereTime = time * (d.f32(i) * 0.1 + 1) + d.f32(i)
    value = sdf.opSmoothUnion(value, mySphere(sphereTime, point), 0.5)
  }
  return value
}

function myCube(time: number, point: d.v3f): number {
  "use gpu"

  let p = d.vec4f(point, 1)
  p = p.mul(d.mat4x4f.rotationY(time))
  p = p.mul(d.mat4x4f.rotationX(time * 0.5))

  p.x += std.sin(time) * 0.6
  p.y += std.cos(time * 1.17) * 0.6

  return sdf.sdBox3d(p.xyz, d.vec3f(0.5))
}

function mySphere(time: number, point: d.v3f): number {
  "use gpu"

  let p = point
  p.x += std.cos(time * 1.17) * 1.2
  p.y -= std.sin(time)
  p.z += std.sin(time * 0.5)
  return sdf.sdSphere(p, 0.3)
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

export function cube({ elapsed, uv }: Globals): number {
  "use gpu"

  const rayDirection = std.normalize(d.vec3f(uv, -1.5))

  let totalDist = d.f32()
  let dist = d.f32()
  let hit = false
  let normal = d.vec3f()

  for (let i = 0; i < MAX_STEPS; i++) {
    const point = cameraPosition.add(rayDirection.mul(totalDist))
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
    const lightIntensity = std.max(std.dot(normal, lightDirection), 0.0)
    return std.smoothstep(0.5, 0.65, lightIntensity)
  }

  return d.f32(0)
}
