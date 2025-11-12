import tgpu, { type TgpuBufferReadonly } from "typegpu"
import * as d from "typegpu/data"
import * as std from "typegpu/std"

import { wanderingShapes } from "./modes/wandering-shapes"
import { circleGrid } from "./modes/circle-grid"
import { snow } from "./modes/snow"
import { cube } from "./modes/cube"

const baseColorA = d.vec3f(9, 46, 71).div(255)
const baseColorB = d.vec3f(15, 52, 77).div(255)

const modeDuration = d.f32(60)
const modeQty = d.i32(4)

export const Uniforms = d.struct({ elapsed: d.f32, aspect: d.f32 })
export type Uniforms = typeof Uniforms

const Globals = d.struct({ elapsed: d.f32, uv: d.vec2f })
export type Globals = d.Infer<typeof Globals>

export function createFragmentShader(
  uniformsBuffer: TgpuBufferReadonly<Uniforms>,
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
    const value = renderMode(globals, modeIndex)

    // value = cube(globals)

    // High contrast for debugging
    // return d.vec4f(value, value, value, 1)

    const tinted = std.mix(baseColorA, baseColorB, value)
    return d.vec4f(tinted, 1)
  })
}

function getUvWithAspect(uv: d.v2f, aspect: number): d.v2f {
  "use gpu"

  const newUv = uv
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

function renderMode(globals: Globals, modeIndex: number) {
  "use gpu"

  if (modeIndex === 0) return wanderingShapes(globals)
  else if (modeIndex === 1) return circleGrid(globals)
  else if (modeIndex === 2) return snow(globals)
  else if (modeIndex === 3) return cube(globals)

  return 0
}
