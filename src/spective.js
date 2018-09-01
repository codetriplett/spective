import { calculateMatrix } from './calculate-matrix';
import { resizeScene } from './resize-scene';
import { initializeRender } from './initialize-render';
import { createGeometry } from './create-geometry';

const vertexCode = `
	uniform mat4 uInstance;
	uniform mat4 uScene;
	uniform mat4 uPerspective;

	attribute vec3 aVertex;
	attribute vec2 aCoordinate;

	varying vec2 vCoordinate;

	void main() {
		gl_Position = vec4(aVertex, 1) * uInstance * uScene * uPerspective;
		vCoordinate = aCoordinate;
	}
`;

const fragmentCode = `
	precision mediump float;

	uniform sampler2D uColor;

	varying vec2 vCoordinate;

	void main() {
		gl_FragColor = texture2D(uColor, vCoordinate);
	}
`;

export default function spective (...initializationParmeters) {
	let canvas = initializationParmeters[0];
	const createCanvas = !canvas || typeof canvas.getContext !== 'function';

	if (createCanvas) {
		canvas = document.createElement('canvas');

		const body = document.body;
		const style = document.createElement('style');
		
		style.innerHTML = `
			body { margin: 0; }
			canvas {
				display: block;
				width: 100vw;
				height: 100vh;
				position: absolute;
				left: 0;
				top: 0;
			}
		`;
		
		body.appendChild(style);
		body.appendChild(canvas);
	} else {
		initializationParmeters.splice(0, 1);
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
	const vertexLocation = gl.getAttribLocation(program, 'aVertex');
	const coordinateLocation = gl.getAttribLocation(program, 'aCoordinate');
	const geometries = [];
	const state = {};

	const creator = (...creationParameters) => {
		if (creationParameters.length === 0) {
			state.renderLocked = !state.renderLocked;

			if (!state.renderLocked) {
				creator({});
			}

			return;
		}

		const firstParamter = creationParameters[0];

		if (Array.isArray(firstParamter)) {
			return createGeometry(state, geometries, ...creationParameters);
		} else if (creationParameters.length === 1 && Object.keys(firstParamter).length === 0) {	
			resizeScene({ gl, perspectiveLocation, canvas, state });
		} else {
			const scene = calculateMatrix(true, ...creationParameters);
			gl.uniformMatrix4fv(sceneLocation, false, scene);
			state.needsRender = true;
		}
	};

	creator({});

	if (createCanvas) {
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
		vertexLocation,
		coordinateLocation,
		geometries,
		state
	});
	
	return creator;
}
