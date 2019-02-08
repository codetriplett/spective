import { Geometry } from '../Geometry/Geometry';

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

export class Scene {
	constructor (canvas, camera) {
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

		this.setAttribute = this.setAttribute.bind(this);
		this.setSampler = this.setSampler.bind(this);
		this.resize = this.resize.bind(this);
		this.toggle = this.toggle.bind(this);
		this.render = this.render.bind(this);
		this.createGeometry = this.createGeometry.bind(this);
		this.destroyGeometry = this.destroyGeometry.bind(this);

		this.canvas = canvas;
		this.gl = gl;
		this.camera = camera;
		this.geometries = {};
		this.instanceLocation = gl.getUniformLocation(program, 'uInstance');
		this.inverseLocation = gl.getUniformLocation(program, 'uInverse');
		this.sceneLocation = gl.getUniformLocation(program, 'uScene');
		this.perspectiveLocation = gl.getUniformLocation(program, 'uPerspective');
		this.imageLocation = gl.getUniformLocation(program, 'uImage');
		this.vertexLocation = gl.getAttribLocation(program, 'aVertex');
		this.normalLocation = gl.getAttribLocation(program, 'aNormal');
		this.coordinateLocation = gl.getAttribLocation(program, 'aCoordinate');
	}

	setAttribute (location, array, size, buffer) {
		const gl = this.gl;
		const { ARRAY_BUFFER } = gl;
	
		buffer = buffer || gl.createBuffer();
	
		gl.bindBuffer(ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(location);
		gl.bufferData(ARRAY_BUFFER, array, gl.STATIC_DRAW);
		gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
	
		return buffer;
	}

	setSampler (location, unit, image, texture) {
		const gl = this.gl;
		const { TEXTURE_2D, RGBA, CLAMP_TO_EDGE } = gl;
		const isColor = image instanceof Uint8Array;
		const dimensions = isColor ? [image.length / 4, 1, 0] : [];
	
		texture = texture || gl.createTexture();
	
		gl.activeTexture(gl[`TEXTURE${unit}`]);
		gl.bindTexture(TEXTURE_2D, texture);
		gl.texImage2D(TEXTURE_2D, 0, RGBA, ...dimensions, RGBA, gl.UNSIGNED_BYTE, image);
	
		if (isColor) {
			gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_S, CLAMP_TO_EDGE);
			gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_T, CLAMP_TO_EDGE);
			gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		} else {
			gl.generateMipmap(TEXTURE_2D);
		}
	
		gl.uniform1i(location, unit);
		
		return texture;
	}
	
	resize () {
		const { render, canvas, gl, perspectiveLocation } = this;
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

		render();
	}

	toggle () {
		this.locked = !this.locked;

		if (!this.locked) {
			this.resize();
		}
	}

	render (timestamp) {
		if (this.locked) {
			this.resolved = undefined;
			return;
		}
		
		const {
			render,
			setAttribute,
			setSampler,
			gl,
			camera,
			geometries,
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

			const loopTimestamp = Date.now();
			let resolved = true;

			if (camera.timestamp) {
				camera.animate(loopTimestamp);
				resolved = resolved && !camera.timestamp;
			}

			gl.uniformMatrix4fv(sceneLocation, false, camera.relativeMatrix);

			Object.values(geometries).forEach(geometry => {
				const {
					vertices,
					normals,
					coordinates,
					assets,
					vertexBuffer,
					normalBuffer,
					coordinateBuffer
				} = geometry;

				if (vertices) {
					const length = vertices.length / 3;

					geometry.vertexBuffer = setAttribute(vertexLocation, vertices, 3, vertexBuffer);
					geometry.normalBuffer = setAttribute(normalLocation, normals, 3, normalBuffer);
					geometry.coordinateBuffer = setAttribute(coordinateLocation, coordinates, 2, coordinateBuffer);

					Object.values(assets).forEach(asset => {
						const { image, instances, imageTexture } = asset;

						if (image) {
							asset.imageTexture = setSampler(imageLocation, 0, image, imageTexture);

							instances.forEach(instance => {
								if (instance.timestamp) {
									instance.animate(loopTimestamp);
									resolved = resolved && !camera.timestamp;
								}

								const {
									absoluteMatrix,
									absoluteInverse,
									relativeMatrix,
									relativeInverse
								} = instance;

								gl.uniformMatrix4fv(instanceLocation, false, absoluteMatrix || relativeMatrix);
								gl.uniformMatrix4fv(inverseLocation, false, absoluteInverse || relativeInverse);
								gl.drawArrays(gl.TRIANGLES, 0, length);
							});
						}
					});
				}
			});

			this.resolved = resolved;
			window.requestAnimationFrame(render);
		} else {
			this.resolved = timestamp === undefined ? false : undefined;
		}
	}

	createGeometry (source, callback) {
		let geometry = this.geometries[source];

		if (!geometry) {
			geometry = new Geometry(source, callback);
			this.geometries[source] = geometry;
		}

		return geometry
	}
	
	destroyGeometry (source) {
		delete this.geometries[source];
	}
}
