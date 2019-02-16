export const vertexCode = `
	uniform mat4 uInstance;
	uniform mat4 uInverse;
	uniform mat4 uScene;
	uniform mat4 uPerspective;

	attribute vec3 aVertex;
	attribute vec3 aNormal;
	attribute vec2 aCoordinate;

	varying vec3 vNormal;
	varying vec3 vDirection;
	varying vec2 vCoordinate;

	void main() {
		gl_Position = uPerspective * uScene * uInstance * vec4(aVertex, 1);
		vNormal = aNormal;
		vDirection = normalize(uInverse * vec4(1, 1, 1, 1)).xyz;
		vCoordinate = aCoordinate;
	}
`;
