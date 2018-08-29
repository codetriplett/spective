import { matrix } from './matrix';
import { expand } from './expand';
import { resize } from './resize';
import { render } from './render';

function invert (options) {
	const result = {};

	Object.keys(options).forEach(key => {
		const value = options[key];

		switch (key) {
			case 'scale':
				result[key] = 1 / value;
				break;
			case 'rotation':
			case 'tilt':
			case 'spin':
				result[key] = -value;
				break;
			case 'position':
			case 'offset':
				result[key] = value.map(item => -item);
				break;
		}
	});

	return result;
}

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

const defaults = {
	scale: 1,
	position: [0, 0, 0],
	rotation: 0,
	tilt: 0,
	spin: 0,
	offset: [0, 0, 0]
};

export default function spective (canvas) {
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
	const state = { needsRender: true };

	let scene = { ...defaults };

	const creator = (input, vertices) => {
		if (input === undefined && vertices === undefined) {
			state.renderLocked = !state.renderLocked;

			if (!state.renderLocked) {
				creator({});
			}

			return;
		}

		if (Array.isArray(input)) {
			const geometryIndex = geometries.length;
			const assets = [];
			const length = Math.max(...input) + 1;

			geometries.push({
				vertices: expand(length, input, vertices),
				assets
			});

			return (coordinates, color) => {
				if (coordinates === undefined && color === undefined) {
					geometries.splice(geometryIndex, 1);
					state.needsRender = true;

					return;
				}

				let assetIndex = assets.length;
				const instances = [];
				let loaded = false;
				let image;

				assets.push(null);

				function loader () {
					if (assetIndex !== undefined) {
						assets[assetIndex] = {
							coordinates: expand(length, input, coordinates),
							color: image,
							instances
						};

						loaded = true;

						if (instances.length > 0) {
							state.needsRender = true;
						}
					}
				}

				if (typeof color === 'string') {
					image = new window.Image();
					image.src = color;
					image.addEventListener('load', loader);
				} else if (Array.isArray(coordinates)) {
					image = new Uint8Array(4).fill(255);
					image.set(coordinates.slice(0, 4));
					coordinates = Array(length * 2).fill(0.5);
					loader();
				}

				if (!image) {
					return;
				}

				return options => {
					if (options === undefined) {
						assets.splice(assetIndex, 1);
						assetIndex = undefined;
						state.needsRender = true;

						return;
					}

					const instanceIndex = instances.length;
					let instance = options;

					function update (updates) {
						if (updates) {
							instance = { ...instance, ...updates };

							const {
								scale,
								position,
								rotation,
								tilt,
								spin,
								offset
							} = instance;
							
							instances[instanceIndex] = matrix(
								scale,
								offset,
								[1, rotation],
								[0, tilt],
								[2, spin],
								position
							);
						} else {
							instances.splice(instanceIndex, 1);
						}
						
						if (loaded) {
							state.needsRender = true;
						}
					}

					update({ ...defaults, ...options });

					return update;
				};
			};
		} else if (Object.keys(input).length === 0) {	
			resize({ gl, perspectiveLocation, canvas, state });
		} else {
			scene = { ...scene, ...invert(input) };
			const { scale, position, rotation, tilt, spin, offset } = scene;

			const sceneMatrix = matrix(
				scale,
				position,
				[1, rotation],
				[0, tilt],
				[2, spin],
				offset
			);

			gl.uniformMatrix4fv(sceneLocation, false, sceneMatrix);
			state.needsRender = true;
		}
	};

	creator(scene);
	creator({});

	if (createCanvas) {
		window.addEventListener('resize', () => {
			creator({});
		});
	}

	render({
		gl,
		instanceLocation,
		colorLocation,
		vertexLocation,
		coordinateLocation,
		geometries,
		state
	});
	
	return creator;
};
