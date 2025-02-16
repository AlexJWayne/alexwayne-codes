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

vec3 circleGrid() {
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

    return vec3(circle);
}

vec3 ripples() {
    vec2 uv = vUvs;
    uv -= vec2(0.5, -0.5);
    uv.y /= aspect;
    uv *= 30.0;

    float val = sin(length(uv) - time * 0.4);
    val = remap(val, -1.0, 1.0, 0.0, 1.0);

    float scaledTime = time * 0.25;
    float edge = satCos(mod(scaledTime, PI));
    val = step(edge, val);

    if (mod(scaledTime, PI * 2.0) < PI) {
        val = 1.0 - val;
    }

    return vec3(val);
}

vec3 mixModes(float qty, float i) {
    // float duration = 5.0;
    // float mode = mod(time / duration, 2.0);
    // float progress = fract(mode);

    // if (mode < i) return a;
    // if (mode > i + 1.0) return b;
    // if (progress > 0.9) return mix(a, b, remap(fract(progress), 0.9, 1.0, 0.0, 1.0));
    // return a;
    return vec3(0.0);
}

void main() {
    vec3 base = vec3(8.0, 47.0, 73.0) / 255.0;

    float qty = 2.0;
    vec3 circleGridColor = circleGrid();
    vec3 ripplesColor = ripples();

    vec3 color;
    // color = mixModes(qty, circleGridColor, ripplesColor, 0.0);
    // color = mixModes(qty, ripplesColor, circleGridColor, 1.0);
    color = circleGridColor;

    vec3 fadedColor = mix(color, vec3(0.0), vUvs.y * 0.5);
    gl_FragColor = vec4(
            mix(fadedColor, base, 0.97),
            1.0
        );

    // Debug
    // gl_FragColor = vec4(color, 1.0);
}
