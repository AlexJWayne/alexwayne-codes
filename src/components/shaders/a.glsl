varying vec2 vUvs;

uniform float aspect;
uniform float time;

// vec3 sat(vec3 v) {
//     return clamp(v, 0.0, 1.0);
// }
float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}
float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

void main() {
    vec3 base = vec3(8.0, 47.0, 73.0) / 255.0;

    vec2 uv = vUvs;
    uv -= 0.5;
    uv.y /= aspect;
    uv = rotate(uv, -time * 0.015);
    uv += vec2(
            sin(time * 0.1) * 0.15,
            cos(time * 0.13) * 0.25
        );
    uv *= 8.0 + sin(time * 0.09) * 1.0;

    uv = fract(uv);
    uv -= 0.5;

    float dist = fract(length(uv));
    float edge = remap(sin(time * 0.15), -1.0, 1.0, 0.1, 0.6);
    float circle = 1.0 - step(edge, dist);

    vec3 color = vec3(circle);
    color = mix(color, vec3(0.0), vUvs.y * 0.5);

    gl_FragColor = vec4(
            mix(color, base, 0.97),
            1.0
        );

    // Debug
    // gl_FragColor = vec4(color, 1.0);
}
