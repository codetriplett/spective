import { setAttribute } from '../set-attribute';
import { setSampler } from '../set-sampler';
import { initializeRender } from '../initialize-render';

const clear = jest.fn();
const uniform3fv = jest.fn();
const uniformMatrix4fv = jest.fn();
const drawArrays = jest.fn();
const beforeRender = jest.fn();
const geometries = [];
let gl;
let state;
let initializationProperties;

jest.mock('../set-attribute', () => ({ setAttribute: jest.fn() }));
jest.mock('../set-sampler', () => ({ setSampler: jest.fn() }));

window.requestAnimationFrame = jest.fn();
Date.now = jest.fn();

function clearMocks () {
	clear.mockClear();
	uniform3fv.mockClear();
	uniformMatrix4fv.mockClear();
	drawArrays.mockClear();

	setAttribute.mockClear();
	setSampler.mockClear();

	window.requestAnimationFrame.mockClear();
	Date.now.mockClear();

	gl = {
		COLOR_BUFFER_BIT: 'mockColorBufferBit',
		DEPTH_BUFFER_BIT: 'mockDepthBufferBit',
		TRIANGLES: 'mockTriangles',
		clear,
		uniform3fv,
		uniformMatrix4fv,
		drawArrays
	};

	state = { needsRender: true };

	initializationProperties = {
		gl,
		instanceLocation: 'mockInstanceLocation',
		inverseLocation: 'mockInverseLocation',
		imageLocation: 'mockImageLocation',
		glowLocation: 'mockGlowLocation',
		vertexLocation: 'mockVertexLocation',
		normalLocation: 'mockNormalLocation',
		coordinateLocation: 'mockCoordinateLocation',
		beforeRender,
		geometries,
		state
	};
}

describe('render', () => {
	beforeEach(() => {
		clearMocks();
		geometries.shift();
	});

	it('should render when needed', () => {
		initializeRender(initializationProperties);

		expect(clear.mock.calls).toEqual([
			['mockColorBufferBit'],
			['mockDepthBufferBit']
		]);

		expect(state.needsRender).toBeFalsy();
	});

	it('should not render when not needed', () => {
		state.needsRender = false;
		initializeRender(initializationProperties);
		
		expect(clear).not.toHaveBeenCalled();
	});

	it('should not render when locked', () => {
		state.renderLocked = true;
		initializeRender(initializationProperties);
		
		expect(clear).not.toHaveBeenCalled();
	});
	
	it('should queue next render', () => {
		initializeRender(initializationProperties);
		expect(window.requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
	});

	it('should call before render function the first time with zero elapsed time', () => {
		initializeRender(initializationProperties);
		expect(beforeRender).toHaveBeenCalledWith(0);
	});

	it('should call before render function after the first time with non zero elapsed time', () => {
		state.previousRender = 1;
		Date.now.mockReturnValueOnce(3);
		initializeRender(initializationProperties);

		expect(beforeRender).toHaveBeenCalledWith(2);
	});

	it('should trigger another render if before render function returned true', () => {
		beforeRender.mockReturnValueOnce(true);
		initializeRender(initializationProperties);

		expect(state.needsRender).toBe(true);
	});

	describe('geometry', () => {
		beforeEach(() => {
			clearMocks();

			geometries.splice(0, 1, {
				vertices: 'mockVertices',
				assets: []
			});
		});

		it('should set vertices', () => {
			initializeRender(initializationProperties);
			expect(setAttribute).toHaveBeenCalledWith(gl, 'mockVertexLocation', 'mockVertices', 3, undefined);
		});
		
		it('should use existing vertex buffer', () => {
			geometries[0].vertexBuffer = 'mockVertexBuffer';
			initializeRender(initializationProperties);

			expect(setAttribute).toHaveBeenCalledWith(gl, 'mockVertexLocation', 'mockVertices', 3, 'mockVertexBuffer');
		});

		describe('asset', () => {
			beforeEach(() => {
				clearMocks();

				geometries[0].assets.splice(0, 1, {
					coordinates: 'mockCoordinates',
					image: 'mockImage',
					instances: []
				});
			});
	
			it('should set coordinates and image', () => {
				initializeRender(initializationProperties);

				expect(setAttribute).toHaveBeenCalledWith(gl, 'mockCoordinateLocation', 'mockCoordinates', 2, undefined);
				expect(setSampler).toHaveBeenCalledWith(gl, 'mockImageLocation', 0, 'mockImage', undefined);
			});
		
			it('should use existing coordinate buffer and image texture', () => {
				geometries[0].assets[0].coordinateBuffer = 'mockCoordinateBuffer';
				geometries[0].assets[0].imageTexture = 'mockImageTexture';
				initializeRender(initializationProperties);
	
				expect(setAttribute).toHaveBeenCalledWith(gl, 'mockCoordinateLocation', 'mockCoordinates', 2, 'mockCoordinateBuffer');
				expect(setSampler).toHaveBeenCalledWith(gl, 'mockImageLocation', 0, 'mockImage', 'mockImageTexture');
			});
			
			describe('instance', () => {
				beforeEach(() => {
					clearMocks();
					geometries[0].assets[0].instances.splice(0, 1, {
						matrix: 'mockInstance',
						inverse: 'mockInverse'
					});
				});
		
				it('should set instance matrix and draw arrays', () => {
					initializeRender(initializationProperties);

					expect(uniformMatrix4fv.mock.calls).toEqual([
						['mockInstanceLocation', false, 'mockInstance'],
						['mockInverseLocation', false, 'mockInverse']
					]);

					expect(drawArrays).toHaveBeenCalledWith('mockTriangles', 0, 4);
				});
			});
		});
	});
});
