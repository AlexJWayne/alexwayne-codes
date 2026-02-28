import tgpu from "typegpu"
import { builtin, vec2f, vec4f } from "typegpu/data"

export const vertexShader = tgpu.vertexFn({
  in: { idx: builtin.vertexIndex },
  out: {
    pos: builtin.position,
    uv: vec2f,
  },
})(({ idx }) => {
  const vertices = [
    vec2f(-1, -1), //
    vec2f(1, -1),
    vec2f(1, 1),
    vec2f(-1, 1),
  ]
  const vertex = vertices[idx]
  return {
    pos: vec4f(vertex, 0, 1),
    uv: vertex,
  }
})
