import { Geometry } from '../../Geometry/Geometry';
import { Scene } from '../Scene';

jest.mock('../vertex-code', () => ({ vertexCode: 'vertexCode' }));
jest.mock('../fragment-code', () => ({ fragmentCode: 'fragmentCode' }));
jest.mock('../../Geometry/Geometry', () => ({ Geometry: jest.fn() }));

const destroyAsset = jest.fn();
const getContext = jest.fn();
const createProgram = jest.fn();
const createShader = jest.fn();
const shaderSource = jest.fn();
const compileShader = jest.fn();
const attachShader = jest.fn();
const linkProgram = jest.fn();
const useProgram = jest.fn();
const enable = jest.fn();
const depthFunc = jest.fn();
const cullFace = jest.fn();
const clearColor = jest.fn();
const getUniformLocation = jest.fn();
const getAttribLocation = jest.fn();
const createBuffer = jest.fn();
const bindBuffer = jest.fn();
const enableVertexAttribArray = jest.fn();
const bufferData = jest.fn();
const vertexAttribPointer = jest.fn();
const createTexture = jest.fn();
const activeTexture = jest.fn();
const bindTexture = jest.fn();
const pixelStorei = jest.fn();
const texImage2D = jest.fn();
const generateMipmap = jest.fn();
const texParameteri = jest.fn();
const uniform1i = jest.fn();
const viewport = jest.fn();
const uniformMatrix4fv = jest.fn();
const clear = jest.fn();
const drawArrays = jest.fn();
let canvas;
let gl;
let setAttribute;
let setSampler;
let resize;
let toggle;
let render;
let createGeometry;
let destroyGeometry;

function resetMocks () {
	setAttribute = Scene.prototype.setAttribute;
	setSampler = Scene.prototype.setSampler;
	resize = Scene.prototype.resize;
	toggle = Scene.prototype.toggle;
	render = Scene.prototype.render;
	createGeometry = Scene.prototype.createGeometry;
	destroyGeometry = Scene.prototype.destroyGeometry;
	
	Geometry.mockClear().mockImplementation(function (source) {
		this.destroyAsset = destroyAsset;
		this.vertices = source;
		this.assets = {};
	});

	createProgram.mockClear().mockReturnValue('program');
	createShader.mockClear().mockImplementation(shader => shader);
	shaderSource.mockClear();
	compileShader.mockClear();
	attachShader.mockClear();
	linkProgram.mockClear();
	useProgram.mockClear();
	enable.mockClear();
	depthFunc.mockClear();
	cullFace.mockClear();
	clearColor.mockClear();
	getUniformLocation.mockClear().mockImplementation((program, name) => `${name}UniformLocation`);
	getAttribLocation.mockClear().mockImplementation((program, name) => `${name}AttributeLocation`);
	createBuffer.mockClear().mockReturnValue('buffer');
	bindBuffer.mockClear();
	enableVertexAttribArray.mockClear();
	bufferData.mockClear();
	vertexAttribPointer.mockClear();
	createTexture.mockClear().mockReturnValue('texture');
	activeTexture.mockClear();
	bindTexture.mockClear();
	pixelStorei.mockClear();
	texImage2D.mockClear();
	generateMipmap.mockClear();
	texParameteri.mockClear();
	uniform1i.mockClear();
	viewport.mockClear();
	uniformMatrix4fv.mockClear();
	clear.mockClear();
	drawArrays.mockClear();

	gl = {
		VERTEX_SHADER: 'vertexShader',
		FRAGMENT_SHADER: 'fragmentShader',
		DEPTH_TEST: 'depthTest',
		LESS: 'less',
		CULL_FACE: 'cullFace',
		BACK: 'back',
		ARRAY_BUFFER: 'arrayBuffer',
		STATIC_DRAW: 'staticDraw',
		FLOAT: 'float',
		TEXTURE_2D: 'texture2d',
		RGBA: 'rgba',
		CLAMP_TO_EDGE: 'clampToEdge',
		TEXTUREunit: 'textureUnit',
		UNPACK_FLIP_Y_WEBGL: 'unpackFlipYWebGl',
		UNSIGNED_BYTE: 'unsignedByte',
		TEXTURE_MIN_FILTER: 'textureMinFilter',
		LINEAR_MIPMAP_LINEAR: 'linearMipmapLinear',
		TEXTURE_WRAP_S: 'textureWrapS',
		TEXTURE_WRAP_T: 'textureWrapT',
		COLOR_BUFFER_BIT: 'colorBufferBit',
		DEPTH_BUFFER_BIT: 'depthBufferBit',
		TRIANGLES: 'triangles',
		createProgram,
		createShader,
		shaderSource,
		compileShader,
		attachShader,
		linkProgram,
		useProgram,
		enable,
		depthFunc,
		cullFace,
		clearColor,
		getUniformLocation,
		getAttribLocation,
		createBuffer,
		bindBuffer,
		enableVertexAttribArray,
		bufferData,
		vertexAttribPointer,
		createTexture,
		activeTexture,
		bindTexture,
		pixelStorei,
		texImage2D,
		generateMipmap,
		texParameteri,
		uniform1i,
		viewport,
		uniformMatrix4fv,
		clear,
		drawArrays
	};
	
	getContext.mockClear().mockReturnValue(gl);
	canvas = { getContext, width: 200, height: 100 };
}

describe('Scene', () => {
	describe('constructor', () => {
		beforeEach(resetMocks);

		it('should create a scene', () => {
			const actual = new Scene(canvas, 'camera');

			expect(getContext).toHaveBeenCalledWith('webgl');
			expect(createProgram).toHaveBeenCalledWith();
			expect(createShader).toHaveBeenCalledWith('vertexShader');
			expect(createShader).toHaveBeenCalledWith('fragmentShader');

			expect(shaderSource.mock.calls).toEqual([
				['vertexShader', 'vertexCode'],
				['fragmentShader', 'fragmentCode']
			]);

			expect(compileShader.mock.calls).toEqual([
				['vertexShader'],
				['fragmentShader']
			]);

			expect(attachShader.mock.calls).toEqual([
				['program', 'vertexShader'],
				['program', 'fragmentShader']
			]);

			expect(linkProgram).toHaveBeenCalledWith('program');
			expect(useProgram).toHaveBeenCalledWith('program');
			
			expect(enable.mock.calls).toEqual([
				['depthTest'],
				['cullFace']
			]);

			expect(depthFunc).toHaveBeenCalledWith('less');
			expect(cullFace).toHaveBeenCalledWith('back');
			expect(clearColor).toHaveBeenCalledWith(0, 0, 0, 1);

			expect(getUniformLocation.mock.calls).toEqual([
				['program', 'uInstance'],
				['program', 'uInverse'],
				['program', 'uScene'],
				['program', 'uPerspective'],
				['program', 'uImage']
			]);

			expect(getAttribLocation.mock.calls).toEqual([
				['program', 'aVertex'],
				['program', 'aNormal'],
				['program', 'aCoordinate']
			]);

			expect(actual).toEqual({
				setAttribute: expect.any(Function),
				setSampler: expect.any(Function),
				resize: expect.any(Function),
				toggle: expect.any(Function),
				render: expect.any(Function),
				createGeometry: expect.any(Function),
				destroyGeometry: expect.any(Function),
				canvas,
				gl,
				camera: 'camera',
				geometries: {},
				instanceLocation: 'uInstanceUniformLocation',
				inverseLocation: 'uInverseUniformLocation',
				sceneLocation: 'uSceneUniformLocation',
				perspectiveLocation: 'uPerspectiveUniformLocation',
				imageLocation: 'uImageUniformLocation',
				vertexLocation: 'aVertexAttributeLocation',
				normalLocation: 'aNormalAttributeLocation',
				coordinateLocation: 'aCoordinateAttributeLocation'
			});
		});
	});

	describe('setAttribute', () => {
		beforeEach(resetMocks);

		it('should set attribute and create a new buffer', () => {
			const actual = setAttribute.call({ gl }, 'location', 'array', 'size');
			
			expect(createBuffer).toHaveBeenCalledWith();
			expect(bindBuffer).toHaveBeenCalledWith('arrayBuffer', 'buffer');
			expect(enableVertexAttribArray).toHaveBeenCalledWith('location');
			expect(bufferData).toHaveBeenCalledWith('arrayBuffer', 'array', 'staticDraw');
			expect(vertexAttribPointer).toHaveBeenCalledWith('location', 'size', 'float', false, 0, 0);

			expect(actual).toBe('buffer');
		});

		it('should set attribute using an existing buffer', () => {
			const actual = setAttribute.call({ gl }, 'location', 'array', 'size', 'buffer');
			
			expect(createBuffer).not.toHaveBeenCalled();
			expect(bindBuffer).toHaveBeenCalledWith('arrayBuffer', 'buffer');
			expect(enableVertexAttribArray).toHaveBeenCalledWith('location');
			expect(bufferData).toHaveBeenCalledWith('arrayBuffer', 'array', 'staticDraw');
			expect(vertexAttribPointer).toHaveBeenCalledWith('location', 'size', 'float', false, 0, 0);

			expect(actual).toBe('buffer');
		});
	});

	describe('setSampler', () => {
		beforeEach(resetMocks);

		it('should set sampler and create a new texture', () => {
			const actual = setSampler.call({ gl }, 'location', 'unit', false, 'image');

			expect(createTexture).toHaveBeenCalledWith();
			expect(activeTexture).toHaveBeenCalledWith('textureUnit');
			expect(bindTexture).toHaveBeenCalledWith('texture2d', 'texture');
			expect(pixelStorei).toHaveBeenCalledWith('unpackFlipYWebGl', true);
			expect(texImage2D).toHaveBeenCalledWith('texture2d', 0, 'rgba', 'rgba', 'unsignedByte', 'image');
			expect(generateMipmap).toHaveBeenCalledWith('texture2d');

			expect(texParameteri.mock.calls).toEqual([
				['texture2d', 'textureMinFilter', 'linearMipmapLinear'],
				['texture2d', 'textureWrapS', 'clampToEdge'],
				['texture2d', 'textureWrapT', 'clampToEdge']
			]);

			expect(uniform1i).toHaveBeenCalledWith('location', 'unit');

			expect(actual).toBe('texture');
		});

		it('should set sampler using an existing texture', () => {
			const actual = setSampler.call({ gl }, 'location', 'unit', false, 'image', 'texture');

			expect(createTexture).not.toHaveBeenCalled();
			expect(activeTexture).toHaveBeenCalledWith('textureUnit');
			expect(bindTexture).toHaveBeenCalledWith('texture2d', 'texture');
			expect(pixelStorei).toHaveBeenCalledWith('unpackFlipYWebGl', true);
			expect(texImage2D).toHaveBeenCalledWith('texture2d', 0, 'rgba', 'rgba', 'unsignedByte', 'image');
			expect(generateMipmap).toHaveBeenCalledWith('texture2d');

			expect(texParameteri.mock.calls).toEqual([
				['texture2d', 'textureMinFilter', 'linearMipmapLinear'],
				['texture2d', 'textureWrapS', 'clampToEdge'],
				['texture2d', 'textureWrapT', 'clampToEdge']
			]);

			expect(uniform1i).toHaveBeenCalledWith('location', 'unit');

			expect(actual).toBe('texture');
		});

		it('should set sampler using a color', () => {
			const color = new Uint8Array();
			const actual = setSampler.call({ gl }, 'location', 'unit', false, color, 'texture');

			expect(createTexture).not.toHaveBeenCalled();
			expect(activeTexture).toHaveBeenCalledWith('textureUnit');
			expect(bindTexture).toHaveBeenCalledWith('texture2d', 'texture');
			expect(pixelStorei).toHaveBeenCalledWith('unpackFlipYWebGl', true);
			expect(texImage2D).toHaveBeenCalledWith('texture2d', 0, 'rgba', 0, 1, 0, 'rgba', 'unsignedByte', color);
			expect(generateMipmap).not.toHaveBeenCalled();

			expect(texParameteri.mock.calls).toEqual([
				['texture2d', 'textureWrapS', 'clampToEdge'],
				['texture2d', 'textureWrapT', 'clampToEdge']
			]);

			expect(uniform1i).toHaveBeenCalledWith('location', 'unit');

			expect(actual).toBe('texture');
		});

		it('should set sampler that repeats', () => {
			const actual = setSampler.call({ gl }, 'location', 'unit', true, 'image', 'texture');

			expect(createTexture).not.toHaveBeenCalled();
			expect(activeTexture).toHaveBeenCalledWith('textureUnit');
			expect(bindTexture).toHaveBeenCalledWith('texture2d', 'texture');
			expect(pixelStorei).toHaveBeenCalledWith('unpackFlipYWebGl', true);
			expect(texImage2D).toHaveBeenCalledWith('texture2d', 0, 'rgba', 'rgba', 'unsignedByte', 'image');
			expect(generateMipmap).toHaveBeenCalledWith('texture2d');

			expect(texParameteri.mock.calls).toEqual([
				['texture2d', 'textureMinFilter', 'linearMipmapLinear']
			]);

			expect(uniform1i).toHaveBeenCalledWith('location', 'unit');

			expect(actual).toBe('texture');
		});
	});

	describe('resize', () => {
		beforeEach(resetMocks);

		it('should resize', () => {
			render = jest.fn();
			Object.assign(canvas, { clientWidth: 240, clientHeight: 120 });
			resize.call({ render, canvas, gl, perspectiveLocation: 'perspectiveLocation' });

			expect(viewport).toHaveBeenCalledWith(0, 0, 240, 120);

			expect(uniformMatrix4fv).toHaveBeenCalledWith('perspectiveLocation', false, [
				1, 0, 0, 0,
				0, 2, 0, 0,
				0, 0, -1, -1,
				0, 0, -2, 0
			]);

			expect(render).toHaveBeenCalledWith();
		});
	});

	describe('toggle', () => {
		beforeEach(resetMocks);

		it('should toggle off', () => {
			const resize = jest.fn();
			const context = { resize, locked: false };
			toggle.call(context);

			expect(resize).not.toHaveBeenCalled();
			expect(context).toEqual({ resize, locked: true });
		});

		it('should toggle on', () => {
			const resize = jest.fn();
			const context = { resize, locked: true };
			toggle.call(context);

			expect(resize).toHaveBeenCalledWith();
			expect(context).toEqual({ resize, locked: false });
		});
	});

	describe('render', () => {
		const requestAnimationFrame = jest.fn();
		const setAttribute = jest.fn();
		const setSampler = jest.fn();
		const animate = jest.fn();
		let camera;
		let geometries;
		let context;

		beforeEach(() => {
			resetMocks();

			window.requestAnimationFrame = requestAnimationFrame.mockClear();
			window.Date.now = jest.fn().mockReturnValue(3);

			setAttribute.mockClear().mockImplementation(location => `${location}Buffer`);
			setSampler.mockClear().mockImplementation(location => `${location}Texture`);

			camera = { animate, relativeMatrix: 'relativeMatrix' };

			geometries = {
				first: {
					vertices: 'firstVertices',
					normals: 'firstNormals',
					coordinates: 'firstCoordinates',
					assets: {
						firstFirst: {
							image: 'firstFirstImage',
							instances: [
								{
									relativeMatrix: 'firstFirstFirstRelativeMatrix',
									relativeInverse: 'firstFirstFirstRelativeInverse'
								}, {
									relativeMatrix: 'firstFirstSecondRelativeMatrix',
									relativeInverse: 'firstFirstSecondRelativeInverse'
								}
							]
						},
						firstSecond: {
							image: 'firstSecondImage',
							instances: [
								{
									relativeMatrix: 'firstSecondFirstRelativeMatrix',
									relativeInverse: 'firstSecondFirstRelativeInverse'
								}, {
									relativeMatrix: 'firstSecondSecondRelativeMatrix',
									relativeInverse: 'firstSecondSecondRelativeInverse'
								}
							]
						}
					}
				},
				second: {
					vertices: 'secondVertices',
					normals: 'secondNormals',
					coordinates: 'secondCoordinates',
					assets: {
						secondFirst: {
							image: 'secondFirstImage',
							instances: [
								{
									relativeMatrix: 'secondFirstFirstRelativeMatrix',
									relativeInverse: 'secondFirstFirstRelativeInverse'
								}, {
									relativeMatrix: 'secondFirstSecondRelativeMatrix',
									relativeInverse: 'secondFirstSecondRelativeInverse'
								}
							]
						},
						secondSecond: {
							image: 'secondSecondImage',
							instances: [
								{
									relativeMatrix: 'secondSecondFirstRelativeMatrix',
									relativeInverse: 'secondSecondFirstRelativeInverse'
								}, {
									relativeMatrix: 'secondSecondSecondRelativeMatrix',
									relativeInverse: 'secondSecondSecondRelativeInverse'
								}
							]
						}
					}
				}
			};

			context = {
				locked: false,
				render,
				setAttribute,
				setSampler,
				gl,
				camera,
				geometries,
				sceneLocation: 'sceneLocation',
				vertexLocation: 'vertexLocation',
				normalLocation: 'normalLocation',
				coordinateLocation: 'coordinateLocation',
				imageLocation: 'imageLocation',
				instanceLocation: 'instanceLocation',
				inverseLocation: 'inverseLocation'
			}
		});

		it('should render static scene', () => {
			render.call(context);

			expect(clear.mock.calls).toEqual([
				['colorBufferBit'],
				['depthBufferBit']
			]);

			expect(animate).not.toHaveBeenCalled();

			expect(uniformMatrix4fv.mock.calls).toEqual([
				['sceneLocation', false, 'relativeMatrix'],
				['instanceLocation', false, 'firstFirstFirstRelativeMatrix'],
				['inverseLocation', false, 'firstFirstFirstRelativeInverse'],
				['instanceLocation', false, 'firstFirstSecondRelativeMatrix'],
				['inverseLocation', false, 'firstFirstSecondRelativeInverse'],
				['instanceLocation', false, 'firstSecondFirstRelativeMatrix'],
				['inverseLocation', false, 'firstSecondFirstRelativeInverse'],
				['instanceLocation', false, 'firstSecondSecondRelativeMatrix'],
				['inverseLocation', false, 'firstSecondSecondRelativeInverse'],
				['instanceLocation', false, 'secondFirstFirstRelativeMatrix'],
				['inverseLocation', false, 'secondFirstFirstRelativeInverse'],
				['instanceLocation', false, 'secondFirstSecondRelativeMatrix'],
				['inverseLocation', false, 'secondFirstSecondRelativeInverse'],
				['instanceLocation', false, 'secondSecondFirstRelativeMatrix'],
				['inverseLocation', false, 'secondSecondFirstRelativeInverse'],
				['instanceLocation', false, 'secondSecondSecondRelativeMatrix'],
				['inverseLocation', false, 'secondSecondSecondRelativeInverse']
			]);

			expect(setAttribute.mock.calls).toEqual([
				['vertexLocation', 'firstVertices', 3, undefined],
				['normalLocation', 'firstNormals', 3, undefined],
				['coordinateLocation', 'firstCoordinates', 2, undefined],
				['vertexLocation', 'secondVertices', 3, undefined],
				['normalLocation', 'secondNormals', 3, undefined],
				['coordinateLocation', 'secondCoordinates', 2, undefined]
			]);

			expect(setSampler.mock.calls).toEqual([
				['imageLocation', 0, undefined, 'firstFirstImage', undefined],
				['imageLocation', 0, undefined, 'firstSecondImage', undefined],
				['imageLocation', 0, undefined, 'secondFirstImage', undefined],
				['imageLocation', 0, undefined, 'secondSecondImage', undefined],
			]);

			expect(drawArrays.mock.calls).toEqual([
				['triangles', 0, 4.333333333333333],
				['triangles', 0, 4.333333333333333],
				['triangles', 0, 4.333333333333333],
				['triangles', 0, 4.333333333333333],
				['triangles', 0, 4.666666666666667],
				['triangles', 0, 4.666666666666667],
				['triangles', 0, 4.666666666666667],
				['triangles', 0, 4.666666666666667]
			]);

			expect(requestAnimationFrame).toHaveBeenCalledWith(render);

			expect(geometries).toMatchObject({
				first: {
					vertexBuffer: 'vertexLocationBuffer',
					normalBuffer: 'normalLocationBuffer',
					coordinateBuffer: 'coordinateLocationBuffer',
					assets: {
						firstFirst: { imageTexture: 'imageLocationTexture' },
						firstSecond: { imageTexture: 'imageLocationTexture' }
					}
				},
				second: {
					vertexBuffer: 'vertexLocationBuffer',
					normalBuffer: 'normalLocationBuffer',
					coordinateBuffer: 'coordinateLocationBuffer',
					assets: {
						secondFirst: { imageTexture: 'imageLocationTexture' },
						secondSecond: { imageTexture: 'imageLocationTexture' }
					}
				}
			});

			expect(context.resolved).toBeTruthy();
		});

		it('should render using existing buffers and textures', () => {
			geometries.first.vertexBuffer = 'vertexBuffer';
			geometries.first.normalBuffer = 'normalBuffer';
			geometries.first.coordinateBuffer = 'coordinateBuffer';
			geometries.first.assets.firstFirst.imageTexture = 'imageTexture';
			geometries.first.assets.firstSecond.imageTexture = 'imageTexture';
			geometries.second.vertexBuffer = 'vertexBuffer';
			geometries.second.normalBuffer = 'normalBuffer';
			geometries.second.coordinateBuffer = 'coordinateBuffer';
			geometries.second.assets.secondFirst.imageTexture = 'imageTexture';
			geometries.second.assets.secondSecond.imageTexture = 'imageTexture';

			render.call(context);

			expect(setAttribute.mock.calls).toEqual([
				['vertexLocation', 'firstVertices', 3, 'vertexBuffer'],
				['normalLocation', 'firstNormals', 3, 'normalBuffer'],
				['coordinateLocation', 'firstCoordinates', 2, 'coordinateBuffer'],
				['vertexLocation', 'secondVertices', 3, 'vertexBuffer'],
				['normalLocation', 'secondNormals', 3, 'normalBuffer'],
				['coordinateLocation', 'secondCoordinates', 2, 'coordinateBuffer']
			]);

			expect(setSampler.mock.calls).toEqual([
				['imageLocation', 0, undefined, 'firstFirstImage', 'imageTexture'],
				['imageLocation', 0, undefined, 'firstSecondImage', 'imageTexture'],
				['imageLocation', 0, undefined, 'secondFirstImage', 'imageTexture'],
				['imageLocation', 0, undefined, 'secondSecondImage', 'imageTexture'],
			]);
		});
		
		it('should render with animations', () => {
			camera.timestamp = 1;
			Object.assign(geometries.first.assets.firstFirst.instances[0], { animate, timestamp: 2 });
			render.call(context);

			expect(animate.mock.calls).toEqual([
				[3],
				[3]
			]);
		});

		it('should not render when locked', () => {
			context.locked = true;
			context.resolved = true;
			render.call(context);

			expect(clear).not.toHaveBeenCalled();
			expect(context.resolved).toBeUndefined();
		});

		it('should not render when another is already in progress', () => {
			context.resolved = false;
			render.call(context);

			expect(clear).not.toHaveBeenCalled();
			expect(context.resolved).toBe(false);
		});
	});

	describe('createGeometry', () => {
		beforeEach(resetMocks);

		it('should create a Geometry', () => {
			const geometries = {};
			createGeometry.call({ geometries }, 'source', 'callback');
	
			expect(Geometry).toHaveBeenCalledWith('source', 'callback');

			expect(geometries).toEqual({
				source: {
					destroyAsset,
					vertices: 'source',
					assets: {}
				}
			});
		});

		it('should use an existing Geometry', () => {
			const geometry = new Geometry('source');
			const geometries = { source: geometry };
			createGeometry.call({ geometries }, 'source', 'callback');

			Geometry.mockClear();

			expect(Geometry).not.toHaveBeenCalled();
			expect(geometries).toEqual({
				source: geometry
			});
		});
	});

	describe('destroyGeometry', () => {
		beforeEach(resetMocks);

		it('should destroy a Geometry', () => {
			const geometry = new Geometry('source');
			const geometries = { source: geometry };
			destroyGeometry.call({ geometries }, 'source');

			expect(geometries).toEqual({});
		});

		it('should destroy an anchored instances of an asset', () => {
			const geometry = new Geometry('source');
			const geometries = { source: geometry };
			Object.assign(geometry.assets, { first: 'asset', second: 'asset' });
			destroyGeometry.call({ geometries }, 'source', 'anchor');

			expect(destroyAsset.mock.calls).toEqual([
				['first', 'anchor'],
				['second', 'anchor']
			]);

			expect(geometries).toEqual({ source: geometry });
		});
	});
});
