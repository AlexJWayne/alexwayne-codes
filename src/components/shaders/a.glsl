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

void main() {
    vec3 base = vec3(8.0, 47.0, 73.0) / 255.0;

    vec2 uv = vUvs;
    uv.y /= aspect;
    uv *= 6.0; //+ sin(time * 0.18) * 2.0;
    uv += vec2(
            time * 0.05,
            cos(time * 0.1) * 0.25
        );

    uv = fract(uv);
    uv -= 0.5;

    float dist = fract(length(uv));
    float edge = remap(cos(time * 0.15), -1.0, 1.0, 0.1, 0.6);
    float circle = 1.0 - step(edge, dist);

    vec3 color = vec3(circle);

    gl_FragColor = vec4(
            mix(color, base, 0.98),
            1.0
        );
    // gl_FragColor = vec4(color, 1.0);
}
