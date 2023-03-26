const vertex = `
	attribute vec3 aVertex;
	attribute vec2 aCoordinate;

	uniform mat2 uMatrix;
	uniform vec2 uPosition;
	uniform vec2 uOrigin;
	uniform float uLayerParallax;
	uniform float uLayerSquash;
	uniform float uLayerDepth;
	uniform mat2 uSceneMatrix;
	uniform vec2 uScenePosition;
	uniform vec2 uSceneOrigin;

	varying vec2 vCoordinate;

	void main() {
		vec2 sceneShift = (uScenePosition + uSceneOrigin) * uLayerParallax;
		vec2 vertex = aVertex.xy * uMatrix + uPosition + uOrigin + sceneShift;
		float depth = aVertex.z * uLayerSquash + uLayerDepth;
		gl_Position = vec4(vertex * uSceneMatrix, -depth, 1.0);
		vCoordinate = aCoordinate;
	}
`;

const fragment = `
	precision mediump float;

	uniform sampler2D uImage;

	varying vec2 vCoordinate;

	void main() {
		vec4 pixel = texture2D(uImage, vCoordinate);
		gl_FragColor = pixel;
	}
`;

function compileShader (gl, code, type) {
	const shader = gl.createShader(type);

	gl.shaderSource(shader, code);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(
			`Error compiling ${
				type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'
			} shader:`
		);
		console.log(gl.getShaderInfoLog(shader));
	}

	return shader;
}

export default function createProgram (gl) {
	const program = gl.createProgram();

	const vertexShader = compileShader(gl, vertex, gl.VERTEX_SHADER);
	if (vertexShader) gl.attachShader(program, vertexShader);
	
	const fragmentShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER);
	if (fragmentShader) gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log('Error linking shader program:');
		console.log(gl.getProgramInfoLog(program));
	}

	return program;
}
