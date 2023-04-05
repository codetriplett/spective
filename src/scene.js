import Node from './node';
import Layer from './layer';
import createProgram from './program';

export const COLLIDE_ACTION = 'COLLIDE_ACTION';
export const SEPARATE_ACTION = 'SEPARATE_ACTION';

function setAttribute (gl, location, buffer, dims, array) {
	const { ARRAY_BUFFER, STATIC_DRAW, FLOAT } = gl;

	gl.bindBuffer(ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(location);
	gl.bufferData(ARRAY_BUFFER, new Float32Array(array), STATIC_DRAW);
	gl.vertexAttribPointer(location, dims, FLOAT, false, 0, 0);
}

function compareBoundaries (activeNodes, passiveNodes, frameCount, flipResolution) {
	const inactiveNodes = [];

	for (let activeNode of activeNodes) {
		const { _lastCalculatedFrame, _boundaries: a } = activeNode;

		if (_lastCalculatedFrame !== frameCount) {
			inactiveNodes.push(activeNode);
			continue;
		}

		for (let passiveNode of passiveNodes) {
			// skip check if node are the same
			if (passiveNode === activeNode) continue;

			const { _boundaries: a } = activeNode;
			const { _boundaries: b } = passiveNode;
			let overlap = [b[1] - a[0], a[1] - b[0], b[3] - a[2], a[3] - b[2]];
			const areTouching = overlap.every(value => value >= 0);

			// treat passive node as active node if flag is enabled
			if (flipResolution) {
				const [left, right, bottom, top] = overlap;
				overlap = [right, left, top, bottom];
				const _activeNode = activeNode;
				activeNode = passiveNode;
				passiveNode = _activeNode;
			}

			const { collisions, oncollide } = activeNode;

			// ignore resolution if state hasn't changed
			if (areTouching === collisions.has(passiveNode)) continue;
			const minOverlap = Math.min(...overlap);
			const side = overlap.indexOf(minOverlap);
			const { param } = passiveNode;

			const event = {
				overlap,
				side,
				param,
				type: areTouching ? COLLIDE_ACTION : SEPARATE_ACTION,
				action: areTouching ? 'collide' : 'separate',
				self: activeNode,
				node: passiveNode
			};

			const props = oncollide(event);

			if (props) {
				const direction = side % 2 ? -1 : 1;
				const clonedProps = { ...props };

				// correct overlap if no px was given;
				if (side < 2 && !('px' in clonedProps)) {
					clonedProps.px = activeNode.px + overlap[side] * direction;
				} else if (side > 1 && !('py' in clonedProps)) {
					clonedProps.py = activeNode.py + overlap[side] * direction;
				}

				activeNode.update(clonedProps);
			} else if (areTouching) {
				collisions.add(passiveNode);
			} else {
				collisions.delete(passiveNode);
			}
		}
	}

	return inactiveNodes;
}

export default class Scene extends Node {
	constructor (props) {
		super();
		this.ui = Object.assign(new Layer(), { scene: this });
		this.layers = [];
		this._inverted = true;
		if (props) this.update(props);
	}

	static defaultProps = {};

	update (props = {}) {
		Object.assign(this, props);
		this._finalizeUpdate(props);

		// initialize context if not yet done
		if (!('gl' in this)) {
			let { density = 2, canvas, div, width, height } = this;

			if (!canvas) {
				const { width = 640, height = 360 } = props;
				this.canvas = canvas = document.createElement('canvas');
				document.body.appendChild(canvas);

				Object.assign(canvas, {
					width: Math.round(width * density),
					height: Math.round(height * density)
				});

				const styles = {
					position: 'absolute',
					left: '50vw',
					top: '0',
					width: `${(width / height) * 100}vh`,
					height: '100vh',
					transform: 'translateX(-50%)',
				};

				Object.assign(canvas.style, styles);
				if (div) Object.assign(div.style, { ...styles, zIndex: 1 });
			}

			if (width === undefined) width = canvas.width / density;
			if (height === undefined) height = canvas.height / density;
			this.asset = { ox: 0, oy: 0, sx: width / 2, sy: height / 2 };

			const gl = canvas.getContext('webgl');
			const program = createProgram(gl);

			gl.clearColor(0.5, 0.5, 0.5, 0.5);
			gl.useProgram(program);

			this.gl = gl;
			this.aVertex = gl.getAttribLocation(program, 'aVertex');
			this.aCoordinate = gl.getAttribLocation(program, 'aCoordinate');
			this.uMatrix = gl.getUniformLocation(program, 'uMatrix');
			this.uPosition = gl.getUniformLocation(program, 'uPosition');
			this.uOrigin = gl.getUniformLocation(program, 'uOrigin');
			this.uLayerParallax = gl.getUniformLocation(program, 'uLayerParallax');
			this.uLayerSquash = gl.getUniformLocation(program, 'uLayerSquash');
			this.uLayerDepth = gl.getUniformLocation(program, 'uLayerDepth');
			this.uSceneMatrix = gl.getUniformLocation(program, 'uSceneMatrix');
			this.uScenePosition = gl.getUniformLocation(program, 'uScenePosition');
			this.uSceneOrigin = gl.getUniformLocation(program, 'uSceneOrigin');

			gl.enable(gl.DEPTH_TEST);
			gl.blendEquation(gl.FUNC_ADD);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			this._frameCount = 0;
			setTimeout(() => this._animate(), 0);

			// pause and resume when tab is inactive to avoid inflated elapsed times
			document.addEventListener('visibilitychange', () => {
				if (document.hidden) this.pause();
				else this.resume();
			});
		}
	}

	add (item = {}) {
		if (!('parallax' in item)) {
			// defer lower types to main layer
			return this.ui.add(item);
		} else if (!(item instanceof Layer)) {
			// create new object of correct type
			item = new Layer(item);
		}

		// add item if it didn't already exist, then sort layers
		const { layers } = this;

		if (layers.indexOf(item) === -1) {
			item.scene?.remove?.(item);
			layers.push(item);
		}

		item.scene = this;
		layers.sort((a, b) => a.parallax - b.parallax);
		return item;
	}

	remove (item) {
		const { layers } = this;
		const index = layers.indexOf(item);
		if (index === -1) return;
		layers.splice(index, 1);
	}

	destroy () {
		for (const layer of this.layers) {
			layer.destroy(this);
		}
	}

	_renderGeometry (geometry) {
		const { gl, aVertex, aCoordinate, uMatrix, uPosition, uOrigin } = this;
		const { TEXTURE_2D, CLAMP_TO_EDGE, RGBA, TRIANGLES } = gl;

		if (!('_glBuffer' in geometry)) {
			geometry._glBuffer = gl.createBuffer(); // does a new buffer need to be created for each geometry?
		}

		const { mesh, assets, _glBuffer } = geometry;
		setAttribute(gl, aVertex, _glBuffer, 3, mesh);

		for (const asset of assets) {
			if (!('_glTexture' in asset)) {
				asset._glTexture = gl.createTexture(); // does a new texture need to be created for each asset?
			}

			if (!('_glBuffer' in asset)) {
				asset._glBuffer = gl.createBuffer(); // does a new buffer need to be created for each asset?
			}

			const { _texture, _coordinates, width, height, nodes, _glTexture, _glBuffer } = asset;
			if (_texture === undefined) continue;
			let dimensions = [];

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(TEXTURE_2D, _glTexture);
			
			if (_texture instanceof Uint8Array) {
				dimensions = [width, height, 0];
			} else {
				gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_S, CLAMP_TO_EDGE);
				gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_T, CLAMP_TO_EDGE);
			}

			gl.texImage2D(TEXTURE_2D, 0, RGBA, ...dimensions, RGBA, gl.UNSIGNED_BYTE, _texture);
			
			for (const node of nodes) {
				const { cell, _position, _origin, _composite } = node;
				setAttribute(gl, aCoordinate, _glBuffer, 2, _coordinates[cell]);
				gl.uniformMatrix2fv(uMatrix, false, _composite);
				gl.uniform2fv(uPosition, _position);
				gl.uniform2fv(uOrigin, _origin);
				gl.drawArrays(TRIANGLES, 0, 6);
			}
		}
	}

	render (elapsedTime) {
		const { gl, ui, layers, _frameCount } = this;
		const allLayers = [...layers, ui];
		
		const nodesByLayer = allLayers.map(({ library, geometries }) => {
			const allNodes = [...library.joints.nodes];

			for (const { assets } of [library, ...geometries]) {
				for (const { nodes } of assets) {
					allNodes.push(...nodes);
				}
			}

			return allNodes;
		});

		// update position and velocity based on active velocity and acceleration
		this._applyPhysics(elapsedTime, _frameCount);

		for (const nodes of nodesByLayer) {
			for (const node of nodes) {
				node._applyPhysics(elapsedTime, _frameCount);
			}
		}

		// run custom updates on scene
		if (this.ondraw) {
			this.ondraw(elapsedTime, _frameCount);
		}

		// recalculate hitbox nodes that moved and check for collisions
		for (const nodes of nodesByLayer) {
			const listeners = [];
			const triggers = [];

			// gather hitboxes from root of layer
			for (const node of nodes) {
				const { param, oncollide } = node;
				// skip non-hitbox nodes for now
				if (!oncollide && param === undefined) continue;

				// set node as either a listener or trigger
				if (oncollide) listeners.push(node);
				if (param !== undefined) triggers.push(node);

				// update matrices of just the hitboxes
				node._recalculate(_frameCount);
				node._recalculateBoundaries(_frameCount);
			}

			// check listener nodes that moved against all trigger nodes
			const remainingListeners = compareBoundaries(listeners, triggers, _frameCount);

			// check trigger nodes that moved against all listeners that didn't
			compareBoundaries(triggers, remainingListeners, _frameCount, true);
		}

		// update matrices of all nodes
		this._recalculate(_frameCount);

		for (const nodes of nodesByLayer) {
			for (const node of nodes) {
				node._recalculate(_frameCount);
			}
		}

		const { uSceneMatrix, uScenePosition, uSceneOrigin, uLayerParallax, uLayerSquash, uLayerDepth, _matrix, _position, _origin, _scale } = this;

		// clear scene and set camera and squash values
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniformMatrix2fv(uSceneMatrix, false, _matrix);
		gl.uniform2fv(uScenePosition, _position);
		gl.uniform2fv(uSceneOrigin, _origin);

		// set squash value based on number of layers to fit in scene
		const layerSquash = 2 / allLayers.length;
		gl.uniform1f(uLayerSquash, layerSquash);

		// enable depth testing to preventn unnecessary renders
		gl.depthMask(true);
		gl.disable(gl.BLEND);
		let layerDepth = 1 - layerSquash / 2;

		// render 3d objects front to back
		for (let i = allLayers.length - 1; i >= 0; i--) {
			// move depth back and set parallax
			const { parallax, geometries } = allLayers[i];
			gl.uniform1f(uLayerParallax, parallax);
			gl.uniform1f(uLayerDepth, layerDepth);
			layerDepth -= layerSquash;

			// render 3d geometry
			for (const geometry of geometries) {
				this._renderGeometry(geometry);
			}
		}

		// enabled blending for transparency in sprites
		gl.depthMask(false);
		gl.enable(gl.BLEND);
		layerDepth = -1 + layerSquash / 2;

		// render 2d sprites back to front
		for (const layer of allLayers) {
			const { parallax, library } = layer;

			// reset camera rotation for final ui layer
			if (layer === ui) {
				gl.uniformMatrix2fv(uSceneMatrix, false, _scale);
			}

			// move depth forward and set parallax
			gl.uniform1f(uLayerParallax, parallax);
			gl.uniform1f(uLayerDepth, layerDepth);
			layerDepth += layerSquash;

			// render sprite geometry
			this._renderGeometry(library);
		}

		this._frameCount++;
	}

	_animate (elapsedTime = 0) {
		this.render(elapsedTime);

		requestAnimationFrame(currentTime => {
			if (this._paused) return;
			const { _previousTime = currentTime } = this;
			this._previousTime = currentTime;
			const elapsedTime = (_previousTime && currentTime - _previousTime) / 1000;
			this._animate(elapsedTime);
		});
	}

	resume () {
		if (!this._paused) return;
		this._paused = false;
		this._animate();
	}

	pause () {
		if (this._paused) return;
		this._paused = true;
		this._previousTime = undefined;
	}
}
