import { updateItem } from '../update-item';
import { loadAsset } from '../load-asset';
import { createInstance } from '../create-instance';
import { Scene } from '../Scene';

jest.mock('../update-item', () => ({ updateItem: jest.fn() }));
jest.mock('../load-asset', () => ({ loadAsset: jest.fn() }));
jest.mock('../create-instance', () => ({ createInstance: jest.fn() }));

const createProgram = jest.fn();
const createShader = jest.fn();
const shaderSource = jest.fn();
const compileShader = jest.fn();
const attachShader = jest.fn();
const getUniformLocation = jest.fn();
const getAttribLocation = jest.fn();
const linkProgram = jest.fn();
const useProgram = jest.fn();
const enable = jest.fn();
const depthFunc = jest.fn();
const clearColor = jest.fn();
const clear = jest.fn();
const uniformMatrix4fv = jest.fn();
const createBuffer = jest.fn();
const bindBuffer = jest.fn();
const enableVertexAttribArray = jest.fn();
const bufferData = jest.fn();
const vertexAttribPointer = jest.fn();
const createTexture = jest.fn();
const activeTexture = jest.fn();
const bindTexture = jest.fn();
const texImage2D = jest.fn();
const texParameteri = jest.fn();
const generateMipmap = jest.fn();
const uniform1i = jest.fn();
const drawArrays = jest.fn();
const viewport = jest.fn();
const getContext = jest.fn();
let canvas;
let gl;
let geometries;

describe('Scene', () => {
	beforeEach(() => {
		window.requestAnimationFrame = jest.fn();
		updateItem.mockClear();
		loadAsset.mockClear();
		createInstance.mockClear();
		createProgram.mockClear().mockReturnValue('mockCreateProgram');
		createShader.mockClear().mockReturnValue('mockCreateShader');
		shaderSource.mockClear();
		compileShader.mockClear();
		attachShader.mockClear();
		getUniformLocation.mockClear().mockImplementation((program, name) => `mockUniform${name.slice(1)}`);
		getAttribLocation.mockClear().mockImplementation((program, name) => `mockAttribute${name.slice(1)}`);
		linkProgram.mockClear();
		useProgram.mockClear();
		enable.mockClear();
		depthFunc.mockClear();
		clearColor.mockClear();
		clear.mockClear();
		uniformMatrix4fv.mockClear();
		createBuffer.mockClear().mockReturnValue('mockBuffer');
		bindBuffer.mockClear();
		enableVertexAttribArray.mockClear();
		bufferData.mockClear();
		vertexAttribPointer.mockClear();
		createTexture.mockClear().mockReturnValue('mockTexture');
		activeTexture.mockClear();
		bindTexture.mockClear();
		texImage2D.mockClear();
		texParameteri.mockClear();
		generateMipmap.mockClear();
		uniform1i.mockClear();
		drawArrays.mockClear();
		viewport.mockClear();

		gl = {
			VERTEX_SHADER: 'mockVertexShader',
			FRAGMENT_SHADER: 'mockFragmentShader',
			DEPTH_TEST: 'mockDepthTest',
			LESS: 'mockLess',
			COLOR_BUFFER_BIT: 'mockColorBufferBit',
			DEPTH_BUFFER_BIT: 'mockDepthBufferBit',
			ARRAY_BUFFER: 'mockArrayBuffer',
			STATIC_DRAW: 'mockStaticDraw',
			FLOAT: 'mockFloat',
			TEXTURE0: 'mockTexture0',
			TEXTURE1: 'mockTexture1',
			TEXTURE_2D: 'mockTexture2d',
			RGBA: 'mockRgba',
			UNSIGNED_BYTE: 'mockUnsignedByte',
			TEXTURE_WRAP_S: 'mockTextureWrapS',
			TEXTURE_WRAP_T: 'mockTextureWrapT',
			CLAMP_TO_EDGE: 'mockClampToEdge',
			TEXTURE_MIN_FILTER: 'mockTextureMinFilter',
			LINEAR: 'mockLinear',
			TRIANGLES: 'mockTriangles',
			createProgram,
			createShader,
			shaderSource,
			compileShader,
			attachShader,
			getUniformLocation,
			getAttribLocation,
			linkProgram,
			useProgram,
			enable,
			depthFunc,
			clearColor,
			clear,
			uniformMatrix4fv,
			createBuffer,
			bindBuffer,
			enableVertexAttribArray,
			bufferData,
			vertexAttribPointer,
			createTexture,
			activeTexture,
			bindTexture,
			texImage2D,
			texParameteri,
			generateMipmap,
			uniform1i,
			drawArrays,
			viewport
		};

		getContext.mockClear().mockReturnValue(gl);
		canvas = { getContext, clientWidth: 1920, clientHeight: 1080 };

		geometries = {
			firstGeometry: {
				vertices: 'mockVerticesOne',
				normals: 'mockNormalsOne',
				coordinates: 'mockCoordinatesOne',
				assets: {
					firstAsset: {
						image: 'mockImageOneOne',
						instances: [
							{
								matrix: 'mockMatrixOneOneOne',
								inverse: 'mockInverseOneOneOne'
							},
							{
								matrix: 'mockMatrixOneOneTwo',
								inverse: 'mockInverseOneOneTwo'
							}
						]
					},
					secondAsset: {
						image: 'mockImageOneTwo',
						instances: [
							{
								matrix: 'mockMatrixOneTwoOne',
								inverse: 'mockInverseOneTwoOne'
							},
							{
								matrix: 'mockMatrixOneTwoTwo',
								inverse: 'mockInverseOneTwoTwo'
							}
						]
					}
				}
			},
			secondGeometry: {
				vertices: 'mockVerticesTwo',
				normals: 'mockNormalsTwo',
				coordinates: 'mockCoordinatesTwo',
				assets: {
					firstAsset: {
						image: 'mockImageTwoOne',
						instances: [
							{
								matrix: 'mockMatrixTwoOneOne',
								inverse: 'mockInverseTwoOneOne'
							},
							{
								matrix: 'mockMatrixTwoOneTwo',
								inverse: 'mockInverseTwoOneTwo'
							}
						]
					},
					secondAsset: {
						image: 'mockImageTwoTwo',
						instances: [
							{
								matrix: 'mockMatrixTwoTwoOne',
								inverse: 'mockInverseTwoTwoOne'
							},
							{
								matrix: 'mockMatrixTwoTwoTwo',
								inverse: 'mockInverseTwoTwoTwo'
							}
						]
					}
				}
			}
		};
	});

	it('should initialize', () => {
		const actual = new Scene(canvas, geometries);

		expect(canvas.getContext).toHaveBeenCalledWith('webgl');

		expect(shaderSource.mock.calls).toEqual([
			[
				'mockCreateShader',
				expect.any(String)
			], [
				'mockCreateShader',
				expect.any(String)
			]
		]);

		expect(compileShader.mock.calls).toEqual([
			['mockCreateShader'],
			['mockCreateShader']
		]);

		expect(attachShader.mock.calls).toEqual([
			['mockCreateProgram', 'mockCreateShader'],
			['mockCreateProgram', 'mockCreateShader']
		]);

		expect(linkProgram).toHaveBeenCalledWith('mockCreateProgram');
		expect(useProgram).toHaveBeenCalledWith('mockCreateProgram');
		expect(enable).toHaveBeenCalledWith('mockDepthTest');
		expect(depthFunc).toHaveBeenCalledWith('mockLess');
		expect(clearColor).toHaveBeenCalledWith(0, 0, 0, 1);

		expect(actual).toEqual({
			setAttribute: expect.any(Function),
			setSampler: expect.any(Function),
			resize: expect.any(Function),
			toggle: expect.any(Function),
			render: expect.any(Function),
			updateItem: expect.any(Function),
			loadAsset: expect.any(Function),
			createInstance: expect.any(Function),
			canvas,
			gl,
			geometries,
			instanceLocation: 'mockUniformInstance',
			inverseLocation: 'mockUniformInverse',
			sceneLocation: 'mockUniformScene',
			perspectiveLocation: 'mockUniformPerspective',
			imageLocation: 'mockUniformImage',
			vertexLocation: 'mockAttributeVertex',
			normalLocation: 'mockAttributeNormal',
			coordinateLocation: 'mockAttributeCoordinate'
		});
	});

	it('should set attribute using new buffer', () => {
		const scene = new Scene(canvas, geometries);
		scene.setAttribute('mockLocation', 'mockArray', 2, undefined);

		expect(createBuffer).toHaveBeenCalled();
		expect(bindBuffer).toHaveBeenCalledWith('mockArrayBuffer', 'mockBuffer');
		expect(enableVertexAttribArray).toHaveBeenCalledWith('mockLocation');
		expect(bufferData).toHaveBeenCalledWith('mockArrayBuffer', 'mockArray', 'mockStaticDraw');
		expect(vertexAttribPointer).toHaveBeenCalledWith('mockLocation', 2, 'mockFloat', false, 0, 0);
	});

	it('should set attribute using existing buffer', () => {
		const scene = new Scene(canvas, geometries);
		scene.setAttribute('mockLocation', 'mockArray', 3, 'existingBuffer');

		expect(createBuffer).not.toHaveBeenCalled();
		expect(bindBuffer).toHaveBeenCalledWith('mockArrayBuffer', 'existingBuffer');
		expect(enableVertexAttribArray).toHaveBeenCalledWith('mockLocation');
		expect(bufferData).toHaveBeenCalledWith('mockArrayBuffer', 'mockArray', 'mockStaticDraw');
		expect(vertexAttribPointer).toHaveBeenCalledWith('mockLocation', 3, 'mockFloat', false, 0, 0);
	});
	

	it('should set sampler using new texture', () => {
		const scene = new Scene(canvas, geometries);
		scene.setSampler('mockLocation', 'mockUnit', 'mockImage', undefined);

		expect(createTexture).toHaveBeenCalled();
		expect(bindTexture).toHaveBeenCalledWith('mockTexture2d', 'mockTexture');
	
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 'mockRgba', 'mockUnsignedByte', 'mockImage');
		expect(generateMipmap).toHaveBeenCalledWith('mockTexture2d');
		expect(uniform1i).toHaveBeenCalledWith('mockLocation', 'mockUnit');
	});
	
	it('should set sampler using existing texture', () => {
		const scene = new Scene(canvas, geometries);
		scene.setSampler('mockLocation', 'mockUnit', 'mockImage', 'existingTexture');

		expect(createTexture).not.toHaveBeenCalled();
		expect(bindTexture).toHaveBeenCalledWith('mockTexture2d', 'existingTexture');
	
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 'mockRgba', 'mockUnsignedByte', 'mockImage');
		expect(generateMipmap).toHaveBeenCalledWith('mockTexture2d');
		expect(uniform1i).toHaveBeenCalledWith('mockLocation', 'mockUnit');
	});
	
	it('should set color texture', () => {
		const scene = new Scene(canvas, geometries);
		const color = new Uint8Array([1, 2, 3, 255]);
		scene.setSampler('mockLocation', 'mockUnit', color, 'existingTexture');

		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 1, 1, 0, 'mockRgba', 'mockUnsignedByte', color);
		
		expect(texParameteri.mock.calls).toEqual([
			['mockTexture2d', 'mockTextureWrapS', 'mockClampToEdge'],
			['mockTexture2d', 'mockTextureWrapT', 'mockClampToEdge'],
			['mockTexture2d', 'mockTextureMinFilter', 'mockLinear']
		]);
	});
	
	it('should set multiple color texture', () => {
		const scene = new Scene(canvas, geometries);
		const color = new Uint8Array([1, 2, 3, 255, 10, 20, 30, 255, 50, 150, 250, 255]);
		scene.setSampler('mockLocation', 'mockUnit', color, 'existingTexture');
		
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 3, 1, 0, 'mockRgba', 'mockUnsignedByte', color);
	});

	it('should render', () => {
		const scene = new Scene(canvas, geometries);

		scene.setAttribute = jest.fn();
		scene.setSampler = jest.fn();
		scene.matrix = 'mockSceneMatrix';
		scene.inverse = 'mockSceneInverse';
		scene.render();

		expect(clear.mock.calls).toEqual([
			['mockColorBufferBit'],
			['mockDepthBufferBit']
		]);

		expect(scene.setAttribute.mock.calls).toEqual([
			['mockAttributeVertex', 'mockVerticesOne', 3, undefined],
			['mockAttributeNormal', 'mockNormalsOne', 3, undefined],
			['mockAttributeCoordinate', 'mockCoordinatesOne', 2, undefined],
			['mockAttributeVertex', 'mockVerticesTwo', 3, undefined],
			['mockAttributeNormal', 'mockNormalsTwo', 3, undefined],
			['mockAttributeCoordinate', 'mockCoordinatesTwo', 2, undefined]
		]);

		expect(scene.setSampler.mock.calls).toEqual([
			['mockUniformImage', 0, 'mockImageOneOne', undefined],
			['mockUniformImage', 0, 'mockImageOneTwo', undefined],
			['mockUniformImage', 0, 'mockImageTwoOne', undefined],
			['mockUniformImage', 0, 'mockImageTwoTwo', undefined]
		]);

		expect(uniformMatrix4fv.mock.calls).toEqual([
			['mockUniformScene', false, 'mockSceneInverse'],
			['mockUniformInstance', false, 'mockMatrixOneOneOne'],
			['mockUniformInverse', false, 'mockInverseOneOneOne'],
			['mockUniformInstance', false, 'mockMatrixOneOneTwo'],
			['mockUniformInverse', false, 'mockInverseOneOneTwo'],
			['mockUniformInstance', false, 'mockMatrixOneTwoOne'],
			['mockUniformInverse', false, 'mockInverseOneTwoOne'],
			['mockUniformInstance', false, 'mockMatrixOneTwoTwo'],
			['mockUniformInverse', false, 'mockInverseOneTwoTwo'],
			['mockUniformInstance', false, 'mockMatrixTwoOneOne'],
			['mockUniformInverse', false, 'mockInverseTwoOneOne'],
			['mockUniformInstance', false, 'mockMatrixTwoOneTwo'],
			['mockUniformInverse', false, 'mockInverseTwoOneTwo'],
			['mockUniformInstance', false, 'mockMatrixTwoTwoOne'],
			['mockUniformInverse', false, 'mockInverseTwoTwoOne'],
			['mockUniformInstance', false, 'mockMatrixTwoTwoTwo'],
			['mockUniformInverse', false, 'mockInverseTwoTwoTwo']
		]);

		expect(drawArrays.mock.calls).toEqual([
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5],
			['mockTriangles', 0, 5]
		]);
	});

	it('should render with animations', () => {
		delete geometries.secondGeometry;
		delete geometries.firstGeometry.assets.secondAsset;
		delete geometries.firstGeometry.assets.firstAsset.instances.splice(1, 1);

		const instance = geometries.firstGeometry.assets.firstAsset.instances[0]

		instance.step = jest.fn().mockImplementation(() => {
			instance.matrix = 'mockInstanceMatrixStep';
			instance.inverse = 'mockInstanceInverseStep';
		});

		const scene = new Scene(canvas, geometries);

		scene.step = jest.fn().mockImplementation(() => {
			scene.matrix = 'mockSceneMatrixStep';
			scene.inverse = 'mockSceneInverseStep';
		});

		scene.render();

		expect(uniformMatrix4fv.mock.calls).toEqual([
			['mockUniformScene', false, 'mockSceneInverseStep'],
			['mockUniformInstance', false, 'mockInstanceMatrixStep'],
			['mockUniformInverse', false, 'mockInstanceInverseStep']
		]);
	});

	it('should render when there are no geometries', () => {
		geometries = [];
		const scene = new Scene(canvas, geometries);

		scene.setAttribute = jest.fn();
		scene.setSampler = jest.fn();
		scene.matrix = 'mockSceneMatrix';
		scene.inverse = 'mockSceneInverse';
		scene.render();

		expect(clear.mock.calls).toEqual([
			['mockColorBufferBit'],
			['mockDepthBufferBit']
		]);
		
		expect(uniformMatrix4fv.mock.calls).toEqual([
			['mockUniformScene', false, 'mockSceneInverse']
		]);

		expect(scene.setAttribute).not.toHaveBeenCalled();
		expect(scene.setSampler).not.toHaveBeenCalled();
		expect(drawArrays).not.toHaveBeenCalled();
	});

	it('should render immediately when there is no scheduled render', () => {
		const scene = new Scene(canvas, geometries);
		scene.render();

		expect(clear).toHaveBeenCalled();
		expect(scene.resolved).toBe(true);
	});

	it('should set flag for the next render', () => {
		const scene = new Scene(canvas, geometries);
		scene.render();

		clear.mockClear();
		scene.render();

		expect(clear).not.toHaveBeenCalled();
		expect(scene.resolved).toBe(false);
	});

	it('should maintain flag for the next render', () => {
		const scene = new Scene(canvas, geometries);
		scene.render();
		scene.render();

		clear.mockClear();
		scene.render();

		expect(clear).not.toHaveBeenCalled();
		expect(scene.resolved).toBe(false);
	});

	it('should resize', () => {
		const scene = new Scene(canvas, geometries);
		scene.render = jest.fn();
		scene.resize();

		expect(viewport).toHaveBeenCalledWith(0, 0, 1920, 1080);

		expect(uniformMatrix4fv).toHaveBeenCalledWith('mockUniformPerspective', false, [
			2.414213562373095, 0, 0, 0,
			0, 4.291935221996614, 0, 0,
			0, 0, 1.002002002002002, -2,
			0, 0, 2.002002002002002, 0
		]);

		expect(scene.render).toHaveBeenCalledWith();
	});

	it('should toggle rendering off', () => {
		const scene = new Scene(canvas, geometries);
		scene.toggle();
		scene.render();

		expect(clear).not.toHaveBeenCalled();
	});

	it('should toggle rendering back on and resize', () => {
		const scene = new Scene(canvas, geometries);
		scene.resize = jest.fn();
		scene.toggle();
		scene.toggle();

		expect(scene.resize).toHaveBeenCalled();
	});
});
