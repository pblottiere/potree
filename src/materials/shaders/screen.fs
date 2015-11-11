

uniform mat4 projectionMatrix;

uniform float screenWidth;
uniform float screenHeight;
uniform float near;
uniform float far;
uniform float opacity;

uniform sampler2D colorMap;

varying vec2 vUv;

void main(){
	vec4 color = texture2D(colorMap, vUv);
	gl_FragColor = vec4(color.rgb, opacity);
}
