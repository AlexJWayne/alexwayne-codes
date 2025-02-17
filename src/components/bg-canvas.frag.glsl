varying vec2 vUvs;

uniform float aspect;
uniform float time;

#define PI 3.1415926535897932384626433832795

float inverseLerp(float v, float minValue, float maxValue) {
    return (v - minValue) / (maxValue - minValue);
}
float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}
// vec3 sat(vec3 v) {
//     return clamp(v, 0.0, 1.0);
// }
float satSin(float v) {
    return remap(sin(v), -1.0, 1.0, 0.0, 1.0);
}
float satCos(float v) {
    return remap(cos(v), -1.0, 1.0, 0.0, 1.0);
}
vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

float circleGrid() {
    vec2 uv = vUvs;
    uv -= 0.5;
    uv.y /= aspect;
    uv = rotate(uv, -time * 0.015);
    uv += vec2(
            sin(time * 0.1) * 0.15,
            cos(time * 0.13) * 0.25
        );
    uv *= 8.0 + sin(time * 0.09) * 1.0;

    vec2 gridUv = fract(uv);
    gridUv -= 0.5;

    float dist = fract(length(gridUv));
    float timeWithOffset = time + sin(uv.x) + sin(uv.y);
    float edge = remap(sin(timeWithOffset * 0.35), -1.0, 1.0, 0.05, 0.66);
    float circle = 1.0 - step(edge, dist);

    return circle;
}

float ripples() {
    vec2 uv = vUvs;
    uv -= vec2(-0.25, -0.5);
    uv.y /= aspect;
    uv *= 120.0;

    float val = sin(length(uv) - time * 0.4);
    val = remap(val, -1.0, 1.0, 0.0, 1.0);

    float scaledTime = time * 0.35;
    float edge = satCos(mod(scaledTime, PI));
    val = step(edge, val);

    if (mod(scaledTime, PI * 2.0) < PI) {
        val = 1.0 - val;
    }

    return val;
}

void main() {
    float duration = 60.0;
    vec3 base = vec3(8.0, 47.0, 73.0) / 255.0;
    float qty = 2.0;

    float mode = mod(
            time / duration + (vUvs.x / 2.0 + vUvs.y) * 0.2,
            qty
        );
    float value;

    // Debug: force a mode
    // mode = 1.0;

    if (mode < 1.0) value = circleGrid();
    else if (mode < 2.0) value = ripples();

    vec3 fadedColor = vec3(mix(value, 0.0, vUvs.y * 0.5));
    gl_FragColor = vec4(
            mix(fadedColor, base, 0.97),
            1.0
        );

    // Debug: Render high contrast pattern
    // gl_FragColor = vec4(vec3(value), 1.0);
}
