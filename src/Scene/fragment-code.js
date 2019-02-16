export const fragmentCode = `
	precision mediump float;

	uniform sampler2D uImage;

	varying vec3 vNormal;
	varying vec3 vDirection;
	varying vec2 vCoordinate;

	void main() {
		float intensity = 0.5 + 0.5 * (dot(vDirection, vNormal) + 0.7) / 1.7;
		vec3 color = texture2D(uImage, vCoordinate).xyz * intensity;
		gl_FragColor = vec4(color, 1);
	}
`;
