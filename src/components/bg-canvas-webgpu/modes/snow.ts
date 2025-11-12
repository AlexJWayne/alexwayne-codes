import tgpu, { type TgpuConst } from "typegpu"
import * as d from "typegpu/data"
import * as std from "typegpu/std"
import * as sdf from "@typegpu/sdf"

import type { Globals } from "../fragment-shader"

const N = d.i32(50)
const randPer = 4

const samples = seedSamples()

export function snow({ elapsed, uv }: Globals): number {
  "use gpu"

  let value = d.f32(999)
  for (let i = 0; i < N; i++) {
    const sizeScalar = getSample(i, 0)
    const size = sizeScalar * 0.05 + 0.01

    let pos = d
      .vec2f(
        getSample(i, 1), //
        getSample(i, 2),
      )
      .sub(0.5)
      .mul(3)
    pos.y -= elapsed * 0.2
    pos.y = std.mod(pos.y, 3) + 1.5

    pos.x -= std.sin((pos.y + getSample(i, 3)) * 2) * sizeScalar

    value = sdf.opUnion(value, sdf.sdDisk(pos.sub(uv), size))
  }

  return 1 - std.step(0.005, value)
}

function getSample(i: number, j: number): number {
  "use gpu"
  return samples.$[i * randPer + j]
}

function seedSamples(): TgpuConst<d.WgslArray<d.F32>> {
  const samplesArr: number[] = []
  for (let i = 0; i < N * randPer; i++) samplesArr.push(Math.random())
  return tgpu.const(d.arrayOf(d.f32)(N * randPer), samplesArr)
}
