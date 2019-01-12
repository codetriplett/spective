import { createCanvas } from './create-canvas';
import { calculateMatrix } from './calculate-matrix';
import { resizeScene } from './resize-scene';
import { initializeRender } from './initialize-render';
import { createGeometry } from './create-geometry';

const vertexCode = `
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
		gl_Position = vec4(aVertex, 1) * uInstance * uScene * uPerspective;
		vNormal = aNormal;
		vDirection = normalize(vec4(1, 1, 1, 1) * uInverse).xyz;
		vCoordinate = aCoordinate;
	}
`;

const fragmentCode = `
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

export default function spective (...initializationParmeters) {
	let canvas = initializationParmeters[0];
	let beforeRender = initializationParmeters[initializationParmeters.length - 1];
	const needsCanvas = !canvas || typeof canvas.getContext !== 'function';

	if (needsCanvas) {
		canvas = createCanvas();
	} else {
		initializationParmeters.shift();
	}

	if (typeof beforeRender === 'function') {
		initializationParmeters.pop();
	} else {
		beforeRender = () => false;
	}

	const gl = canvas.getContext('webgl');
	const program = gl.createProgram();
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	gl.shaderSource(vertexShader, vertexCode);
	gl.shaderSource(fragmentShader, fragmentCode);
	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.clearColor(0, 0, 0, 1);
	
	const instanceLocation = gl.getUniformLocation(program, 'uInstance');
	const inverseLocation = gl.getUniformLocation(program, 'uInverse');
	const sceneLocation = gl.getUniformLocation(program, 'uScene');
	const perspectiveLocation = gl.getUniformLocation(program, 'uPerspective');
	const imageLocation = gl.getUniformLocation(program, 'uImage');
	const vertexLocation = gl.getAttribLocation(program, 'aVertex');
	const normalLocation = gl.getAttribLocation(program, 'aNormal');
	const coordinateLocation = gl.getAttribLocation(program, 'aCoordinate');
	const state = { images: {} };
	const geometries = [];
	let scene;

	const creator = (...creationParameters) => {
		if (creationParameters.length === 0) {
			state.renderLocked = !state.renderLocked;

			if (!state.renderLocked) {
				creator({});
			} else {
				state.previousRender = undefined;
			}

			return;
		}

		const firstParamter = creationParameters[0];

		if (Array.isArray(firstParamter)) {
			return createGeometry(state, geometries, ...creationParameters);
		} else if (creationParameters.length === 1 && Object.keys(firstParamter).length === 0) {	
			resizeScene({ gl, perspectiveLocation, canvas, state });
		} else {
			scene = calculateMatrix(true, ...creationParameters);
			gl.uniformMatrix4fv(sceneLocation, false, scene);
			state.needsRender = state.initialized;
		}
	};

	creator({});

	if (needsCanvas) {
		window.addEventListener('resize', () => {
			creator({});
		});
	}

	if (initializationParmeters.length > 0) {
		creator(...initializationParmeters);
	} else {
		creator({}, {});
	}

	initializeRender({
		gl,
		instanceLocation,
		inverseLocation,
		imageLocation,
		vertexLocation,
		normalLocation,
		coordinateLocation,
		beforeRender,
		geometries,
		state
	});

	state.initialized = true;
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clear(gl.DEPTH_BUFFER_BIT);
	
	return creator;
}
