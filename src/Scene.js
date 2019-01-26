import { setAttribute } from './set-attribute';
import { setSampler } from './set-sampler';

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

export function Scene (canvas, geometries) {
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

	this.canvas = canvas;
	this.gl = gl;
	this.geometries = geometries;
	this.instanceLocation = gl.getUniformLocation(program, 'uInstance');
	this.inverseLocation = gl.getUniformLocation(program, 'uInverse');
	this.sceneLocation = gl.getUniformLocation(program, 'uScene');
	this.perspectiveLocation = gl.getUniformLocation(program, 'uPerspective');
	this.imageLocation = gl.getUniformLocation(program, 'uImage');
	this.vertexLocation = gl.getAttribLocation(program, 'aVertex');
	this.normalLocation = gl.getAttribLocation(program, 'aNormal');
	this.coordinateLocation = gl.getAttribLocation(program, 'aCoordinate');
}

Scene.prototype.render = function (timestamp) {
	if (this.locked) {
		this.resolved = undefined;
		return;
	}
	
	const {
		gl,
		geometries,
		inverse: scene,
		resolved,
		sceneLocation,
		vertexLocation,
		normalLocation,
		coordinateLocation,
		imageLocation,
		instanceLocation,
		inverseLocation
	} = this;

	if (resolved === undefined || timestamp !== undefined && !resolved) {
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.uniformMatrix4fv(sceneLocation, false, scene);

		geometries.forEach(geometry => {
			const {
				vertices,
				normals,
				coordinates,
				items: assets,
				vertexBuffer,
				normalBuffer,
				coordinateBuffer
			} = geometry;

			if (vertices) {
				const length = vertices.length / 3;

				geometry.vertexBuffer = setAttribute(gl, vertexLocation, vertices, 3, vertexBuffer);
				geometry.normalBuffer = setAttribute(gl, normalLocation, normals, 3, normalBuffer);
				geometry.coordinateBuffer = setAttribute(gl, coordinateLocation, coordinates, 2, coordinateBuffer);

				assets.forEach(asset => {
					const { image, items: instances, imageTexture } = asset;

					if (image) {
						asset.imageTexture = setSampler(gl, imageLocation, 0, image, imageTexture);

						instances.forEach(({ matrix, inverse }) => {
							gl.uniformMatrix4fv(instanceLocation, false, matrix);
							gl.uniformMatrix4fv(inverseLocation, false, inverse);
							gl.drawArrays(gl.TRIANGLES, 0, length);
						});
					}
				});
			}
		});

		this.resolved = true;
		window.requestAnimationFrame(this.render.bind(this));
	} else {
		this.resolved = timestamp === undefined ? false : undefined;
	}
};

Scene.prototype.resize = function () {
	const { canvas, gl, perspectiveLocation } = this;
	const { clientWidth, clientHeight } = canvas;

	canvas.width = clientWidth;
	canvas.height = clientHeight;
	gl.viewport(0, 0, clientWidth, clientHeight);

	const max = Math.max(clientWidth, clientHeight);
	const field = Math.PI / 4;
	const near = 1;
	const far = 1000;
	const fieldScale = Math.tan((Math.PI - field) / 2);
	const inverseRange = -1 / (near - far);

	gl.uniformMatrix4fv(perspectiveLocation, false, [
		fieldScale * max / clientWidth, 0, 0, 0,
		0, fieldScale * max / clientHeight, 0, 0,
		0, 0, (near + far) * inverseRange, -2,
		0, 0, near * far * inverseRange * 2, 0
	]);

	this.render();
};

Scene.prototype.toggle = function () {
	this.locked = !this.locked;

	if (!this.locked) {
		this.resize();
	}
};
