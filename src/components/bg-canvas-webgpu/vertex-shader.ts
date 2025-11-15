import tgpu from "typegpu"
import * as d from "typegpu/data"
import { UniformsStruct } from "./fragment-shader"

export const vertexShader = tgpu["~unstable"].vertexFn({
  in: { idx: d.builtin.vertexIndex },
  out: {
    pos: d.builtin.position,
    uv: d.vec2f,
  },
})(({ idx }) => {
  const vertices = [
    d.vec2f(-1, -1),
    d.vec2f(1, -1),
    d.vec2f(1, 1),
    d.vec2f(-1, 1),
  ]
  const vertex = vertices[idx]
  return {
    pos: d.vec4f(vertex, 0, 1),
    uv: vertex,
  }
})
