import { createCanvas } from './create-canvas';
import { updateProperties } from './update-properties';
import { resizeScene } from './resize-scene';
import { initializeRender } from './initialize-render';
import { createGeometry } from './create-geometry';

const vertexCode = `
	uniform mat4 uInstance;
	uniform mat4 uScene;
	uniform mat4 uPerspective;

	attribute vec3 aVertex;
	attribute vec3 aNormal;
	attribute vec2 aCoordinate;

	varying vec3 vNormal;
	varying vec2 vCoordinate;

	void main() {
		gl_Position = vec4(aVertex, 1) * uInstance * uScene * uPerspective;
		vNormal = aNormal;
		vCoordinate = aCoordinate;
	}
`;

const fragmentCode = `
	precision mediump float;

	uniform sampler2D uColor;
	uniform vec3 uAmbient;
	uniform vec3 uGlow;

	varying vec3 vNormal;
	varying vec2 vCoordinate;

	void main() {
		gl_FragColor = texture2D(uColor, vCoordinate) * vec4(uAmbient + uGlow, 1);
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
	const sceneLocation = gl.getUniformLocation(program, 'uScene');
	const perspectiveLocation = gl.getUniformLocation(program, 'uPerspective');
	const colorLocation = gl.getUniformLocation(program, 'uColor');
	const ambientLocation = gl.getUniformLocation(program, 'uAmbient');
	const glowLocation = gl.getUniformLocation(program, 'uGlow');
	const vertexLocation = gl.getAttribLocation(program, 'aVertex');
	const normalLocation = gl.getAttribLocation(program, 'aNormal');
	const coordinateLocation = gl.getAttribLocation(program, 'aCoordinate');
	const state = { images: {} };
	const geometries = [];
	const scene = {};

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
			updateProperties(state, scene, true, ...creationParameters);

			gl.uniformMatrix4fv(sceneLocation, false, scene.matrix);
			gl.uniform3fv(ambientLocation, scene.light || [0, 0, 0]);

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
		colorLocation,
		glowLocation,
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
