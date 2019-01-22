import { setAttribute } from '../set-attribute';
import { setSampler } from '../set-sampler';
import { Scene } from '../Scene';

jest.mock('../set-attribute', () => ({ setAttribute: jest.fn() }));
jest.mock('../set-sampler', () => ({ setSampler: jest.fn() }));

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
const drawArrays = jest.fn();
const viewport = jest.fn();
const getContext = jest.fn();
let canvas;
let gl;
let geometries;

describe('Scene', () => {
	beforeEach(() => {
		window.requestAnimationFrame = jest.fn();
		setAttribute.mockClear().mockImplementation((gl, location) => `${location}Buffer`);
		setSampler.mockClear().mockImplementation((gl, location) => `${location}Buffer`);
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
		drawArrays.mockClear();
		viewport.mockClear();

		gl = {
			VERTEX_SHADER: 'mockVertexShader',
			FRAGMENT_SHADER: 'mockFragmentShader',
			DEPTH_TEST: 'mockDepthTest',
			LESS: 'mockLess',
			COLOR_BUFFER_BIT: 'mockColorBufferBit',
			DEPTH_BUFFER_BIT: 'mockDepthBufferBit',
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
			drawArrays,
			viewport
		};

		getContext.mockClear().mockReturnValue(gl);
		canvas = { getContext, clientWidth: 1920, clientHeight: 1080 };

		geometries = [
			{
				vertices: 'mockVerticesOne',
				normals: 'mockNormalsOne',
				coordinates: 'mockCoordinatesOne',
				items: [
					{
						image: 'mockImageOneOne',
						items: [
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
					{
						image: 'mockImageOneTwo',
						items: [
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
				]
			},
			{
				vertices: 'mockVerticesTwo',
				normals: 'mockNormalsTwo',
				coordinates: 'mockCoordinatesTwo',
				items: [
					{
						image: 'mockImageTwoOne',
						items: [
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
					{
						image: 'mockImageTwoTwo',
						items: [
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
				]
			}
		];
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

	it('should render', () => {
		const scene = new Scene(canvas, geometries);
		scene.matrix = 'mockSceneMatrix';
		scene.inverse = 'mockSceneInverse';
		scene.render();

		expect(clear.mock.calls).toEqual([
			['mockColorBufferBit'],
			['mockDepthBufferBit']
		]);

		expect(setAttribute.mock.calls).toEqual([
			[gl, 'mockAttributeVertex', 'mockVerticesOne', 3, undefined],
			[gl, 'mockAttributeNormal', 'mockNormalsOne', 3, undefined],
			[gl, 'mockAttributeCoordinate', 'mockCoordinatesOne', 2, undefined],
			[gl, 'mockAttributeVertex', 'mockVerticesTwo', 3, undefined],
			[gl, 'mockAttributeNormal', 'mockNormalsTwo', 3, undefined],
			[gl, 'mockAttributeCoordinate', 'mockCoordinatesTwo', 2, undefined]
		]);

		expect(setSampler.mock.calls).toEqual([
			[gl, 'mockUniformImage', 0, 'mockImageOneOne', undefined],
			[gl, 'mockUniformImage', 0, 'mockImageOneTwo', undefined],
			[gl, 'mockUniformImage', 0, 'mockImageTwoOne', undefined],
			[gl, 'mockUniformImage', 0, 'mockImageTwoTwo', undefined]
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

	it('should render when there are no geometries', () => {
		geometries = [];
		const scene = new Scene(canvas, geometries);
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

		expect(setAttribute).not.toHaveBeenCalled();
		expect(setSampler).not.toHaveBeenCalled();
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
