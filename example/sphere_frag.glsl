precision mediump float;

varying vec3 vPosition;

uniform float uNoiseScale;
uniform float uNoiseJitter;
uniform float uSeed;
uniform int uPatternType;
uniform bool uManhattanDistance;
uniform float uNoiseStrength;

#pragma glslify: worley3D = require(../worley3D.glsl)


void main() {
   vec2 F = worley3D(vPosition*uNoiseScale, uNoiseJitter, uManhattanDistance);
   float F1 = F.x;
   float F2 = F.y;


   float val;

   if(uPatternType == 0) {
        val = F1;
   } else if(uPatternType == 1) {
        val = F2;
   } else {
        val = F2 - F1;
   }

   val *= uNoiseStrength;

    gl_FragColor = vec4(vec3(val), 1.0);
}
