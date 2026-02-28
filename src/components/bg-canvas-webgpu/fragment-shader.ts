import tgpu, { type TgpuBufferReadonly } from "typegpu"
import {
  f32,
  i32,
  struct,
  vec2f,
  vec3f,
  vec4f,
  type Infer,
  type v2f,
} from "typegpu/data"
import { floor, mix } from "typegpu/std"

import { circleGrid } from "./modes/circle-grid"
import { cube } from "./modes/cube"
import { infSdf } from "./modes/inf-sdf"
import { ball } from "./modes/ball"

const modeDuration = f32(30)
export const modeQty = i32(4)

export const UniformsStruct = struct({
  elapsed: f32,
  aspect: f32,
  forcedModeIndex: i32,
  tinted: i32, // boolean
  colorA: vec3f,
  colorB: vec3f,
})
export type UniformsStruct = typeof UniformsStruct

const Globals = struct({ elapsed: f32, uv: vec2f })
export type Globals = Infer<typeof Globals>

export function createFragmentShader(
  uniformsBuffer: TgpuBufferReadonly<UniformsStruct>,
) {
  return tgpu.fragmentFn({
    in: { uv: vec2f },
    out: vec4f,
  })(({ uv }) => {
    const globals = Globals({
      elapsed: uniformsBuffer.$.elapsed,
      uv: getUvWithAspect(uv, uniformsBuffer.$.aspect),
    })

    const modeIndex = getModeIndex(globals)
    const value = renderMode(
      globals,
      modeIndex,
      uniformsBuffer.$.forcedModeIndex,
    )

    // High contrast for debugging
    if (uniformsBuffer.$.tinted === 0) {
      return vec4f(value, value, value, 1)
    }

    const tinted = mix(uniformsBuffer.$.colorA, uniformsBuffer.$.colorB, value)
    return vec4f(tinted, 1)
  })
}

function getUvWithAspect(uv: v2f, aspect: number): v2f {
  "use gpu"

  const newUv = vec2f(uv)
  if (aspect > 1.0) {
    newUv.x *= aspect
  } else {
    newUv.y /= aspect
  }
  return newUv
}

function getModeIndex({ elapsed, uv }: Globals): number {
  "use gpu"

  const progress = elapsed / modeDuration + (uv.x / 2 + uv.y) * 0.1
  const modeIndex = floor(progress) % modeQty
  return i32(modeIndex)
}

function renderMode(
  globals: Globals,
  modeIndex: number,
  forcedModeIndex: number,
) {
  "use gpu"

  let i = modeIndex
  if (forcedModeIndex >= 0) i = forcedModeIndex

  if (i === 0) return circleGrid(globals)
  else if (i === 1) return cube(globals)
  else if (i === 2) return infSdf(globals)
  else if (i === 3) return ball(globals)

  return 0
}
