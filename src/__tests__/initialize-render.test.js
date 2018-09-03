import { setAttribute } from '../set-attribute';
import { setSampler } from '../set-sampler';
import { initializeRender } from '../initialize-render';

const clear = jest.fn();
const uniformMatrix4fv = jest.fn();
const drawArrays = jest.fn();
const beforeRender = jest.fn();
const geometries = [];
let gl;
let state;
let scene;

jest.mock('../set-attribute', () => ({ setAttribute: jest.fn() }));
jest.mock('../set-sampler', () => ({ setSampler: jest.fn() }));

window.requestAnimationFrame = jest.fn();
Date.now = jest.fn();

function clearMocks () {
	clear.mockClear();
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
		uniformMatrix4fv,
		drawArrays
	};

	state = { needsRender: true };

	scene = {
		gl,
		instanceLocation: 'mockInstanceLocation',
		colorLocation: 'mockColorLocation',
		vertexLocation: 'mockVertexLocation',
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
		initializeRender(scene);

		expect(clear.mock.calls).toEqual([
			['mockColorBufferBit'],
			['mockDepthBufferBit']
		]);

		expect(state.needsRender).toBeFalsy();
	});

	it('should not render when not needed', () => {
		state.needsRender = false;
		initializeRender(scene);
		
		expect(clear).not.toHaveBeenCalled();
	});

	it('should not render when locked', () => {
		state.renderLocked = true;
		initializeRender(scene);
		
		expect(clear).not.toHaveBeenCalled();
	});
	
	it('should queue next render', () => {
		initializeRender(scene);
		expect(window.requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
	});

	it('should call before render function the first time with zero elapsed time', () => {
		initializeRender(scene);
		expect(beforeRender).toHaveBeenCalledWith(0);
	});

	it('should call before render function after the first time with non zero elapsed time', () => {
		state.previousRender = 1;
		Date.now.mockReturnValueOnce(3);
		initializeRender(scene);

		expect(beforeRender).toHaveBeenCalledWith(2);
	});

	it('should trigger another render if before render function returned true', () => {
		beforeRender.mockReturnValueOnce(true);
		initializeRender(scene);

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
			initializeRender(scene);
			expect(setAttribute).toHaveBeenCalledWith(gl, 'mockVertexLocation', 'mockVertices', 3, undefined);
		});
		
		it('should use existing vertex buffer', () => {
			geometries[0].vertexBuffer = 'mockVertexBuffer';
			initializeRender(scene);

			expect(setAttribute).toHaveBeenCalledWith(gl, 'mockVertexLocation', 'mockVertices', 3, 'mockVertexBuffer');
		});

		describe('asset', () => {
			beforeEach(() => {
				clearMocks();

				geometries[0].assets.splice(0, 1, {
					coordinates: 'mockCoordinates',
					color: 'mockColor',
					instances: []
				});
			});
	
			it('should set coordinates and color', () => {
				initializeRender(scene);

				expect(setAttribute).toHaveBeenCalledWith(gl, 'mockCoordinateLocation', 'mockCoordinates', 2, undefined);
				expect(setSampler).toHaveBeenCalledWith(gl, 'mockColorLocation', 0, 'mockColor', undefined);
			});
		
			it('should use existing coordinate buffer and color texture', () => {
				geometries[0].assets[0].coordinateBuffer = 'mockCoordinateBuffer';
				geometries[0].assets[0].colorTexture = 'mockColorTexture';
				initializeRender(scene);
	
				expect(setAttribute).toHaveBeenCalledWith(gl, 'mockCoordinateLocation', 'mockCoordinates', 2, 'mockCoordinateBuffer');
				expect(setSampler).toHaveBeenCalledWith(gl, 'mockColorLocation', 0, 'mockColor', 'mockColorTexture');
			});
			
			describe('instance', () => {
				beforeEach(() => {
					clearMocks();
					geometries[0].assets[0].instances.splice(0, 1, 'mockInstance');
				});
		
				it('should set instance matrix and draw arrays', () => {
					initializeRender(scene);

					expect(uniformMatrix4fv).toHaveBeenCalledWith('mockInstanceLocation', false, 'mockInstance');
					expect(drawArrays).toHaveBeenCalledWith('mockTriangles', 0, 4);
				});
			});
		});
	});
});
