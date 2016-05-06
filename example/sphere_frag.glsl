precision mediump float;

varying vec3 vPosition;

uniform float uNoiseScale;
uniform float uSeed;

void main() {
   // float t = fbm(uNoiseScale*(vPosition + uSeed ) );

    //vec3 tex = cosPalette(t, uAColor, uBColor, uCColor, uDColor );

    gl_FragColor = vec4(vec3(vPosition), 1.0);
}
