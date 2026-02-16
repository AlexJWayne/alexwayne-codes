import tgpu, { type TgpuBufferReadonly } from "typegpu"
import * as d from "typegpu/data"
import * as std from "typegpu/std"

import { circleGrid } from "./modes/circle-grid"
import { cube } from "./modes/cube"
import { infSdf } from "./modes/inf-sdf"
import { ball } from "./modes/ball"

const modeDuration = d.f32(30)
export const modeQty = d.i32(4)

export const UniformsStruct = d.struct({
  elapsed: d.f32,
  aspect: d.f32,
  forcedModeIndex: d.i32,
  tinted: d.i32, // boolean
  colorA: d.vec3f,
  colorB: d.vec3f,
})
export type UniformsStruct = typeof UniformsStruct

const Globals = d.struct({ elapsed: d.f32, uv: d.vec2f })
export type Globals = d.Infer<typeof Globals>

export function createFragmentShader(
  uniformsBuffer: TgpuBufferReadonly<UniformsStruct>,
) {
  return tgpu["~unstable"].fragmentFn({
    in: { uv: d.vec2f },
    out: d.vec4f,
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
      return d.vec4f(value, value, value, 1)
    }

    const tinted = std.mix(
      uniformsBuffer.$.colorA,
      uniformsBuffer.$.colorB,
      value,
    )
    return d.vec4f(tinted, 1)
  })
}

function getUvWithAspect(uv: d.v2f, aspect: number): d.v2f {
  "use gpu"

  const newUv = d.vec2f(uv)
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
  const modeIndex = std.floor(progress) % modeQty
  return d.i32(modeIndex)
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
