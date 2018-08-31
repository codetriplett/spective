import { matrix } from '../matrix';
import { expand } from '../expand';
import { resize } from '../resize';
import { render } from '../render';
import spective from '../spective';

jest.mock('../matrix', () => ({ matrix: jest.fn() }));
jest.mock('../expand', () => ({ expand: jest.fn() }));
jest.mock('../resize', () => ({ resize: jest.fn() }));
jest.mock('../render', () => ({ render: jest.fn() }));

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
const uniformMatrix4fv = jest.fn();

const getContext = jest.fn();
const addEventListener = jest.fn();

const createElement = jest.fn();
document.createElement = createElement;

const appendChild = jest.fn();
document.body.appendChild = appendChild;

let gl;
let loadImage;

window.Image = class Image {
	constructor () {
		loadImage = undefined;
	}

	addEventListener (type, callback) {
		loadImage = callback;
	}
};

function clearMocks () {
	matrix.mockClear();
	matrix.mockReturnValue('mockMatrix');

	expand.mockClear();
	expand.mockReturnValue('mockExpand');

	createProgram.mockClear();
	createShader.mockClear();
	shaderSource.mockClear();
	compileShader.mockClear();
	attachShader.mockClear();
	getUniformLocation.mockClear();
	getAttribLocation.mockClear();
	linkProgram.mockClear();
	useProgram.mockClear();
	enable.mockClear();
	depthFunc.mockClear();
	clearColor.mockClear();
	uniformMatrix4fv.mockClear();
	
	createProgram.mockReturnValue('mockProgram');
	createShader.mockImplementation(type => `${type}Created`);
	getUniformLocation.mockImplementation((program, name) => `${name}UniformLocation`);
	getAttribLocation.mockImplementation((program, name) => `${name}AttributeLocation`);
	
	getContext.mockClear();
	addEventListener.mockClear();

	gl = {
		VERTEX_SHADER: 'mockVertexShader',
		FRAGMENT_SHADER: 'mockFragmentShader',
		DEPTH_TEST: 'mockDepthTest',
		LESS: 'mockLess',
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
		uniformMatrix4fv
	};

	getContext.mockReturnValue(gl);

	createElement.mockClear();
	createElement.mockReturnValue({ getContext });

	window.addEventListener = addEventListener;

	appendChild.mockClear();
}

describe('spective', () => {
	beforeEach(clearMocks);

	it('should set up context', () => {
		const canvas = document.createElement('canvas');
		createElement.mockClear();

		spective(canvas);

		expect(createElement).not.toHaveBeenCalled;
		
		expect(getContext).toHaveBeenCalledWith('webgl');
		expect(createProgram).toHaveBeenCalled();
		expect(createShader).toHaveBeenCalledWith('mockVertexShader');
		expect(createShader).toHaveBeenCalledWith('mockFragmentShader');
		expect(shaderSource).toHaveBeenCalledWith('mockVertexShaderCreated', expect.any(String));
		expect(shaderSource).toHaveBeenCalledWith('mockFragmentShaderCreated', expect.any(String));
		expect(compileShader).toHaveBeenCalledWith('mockVertexShaderCreated');
		expect(compileShader).toHaveBeenCalledWith('mockFragmentShaderCreated');
		expect(attachShader).toHaveBeenCalledWith('mockProgram', 'mockVertexShaderCreated');
		expect(attachShader).toHaveBeenCalledWith('mockProgram', 'mockFragmentShaderCreated');
		expect(linkProgram).toHaveBeenCalledWith('mockProgram');
		expect(useProgram).toHaveBeenCalledWith('mockProgram');
		expect(enable).toHaveBeenCalledWith('mockDepthTest');
		expect(depthFunc).toHaveBeenCalledWith('mockLess');
		expect(clearColor).toHaveBeenCalledWith(0, 0, 0, 1);
		expect(getUniformLocation).toHaveBeenCalledWith('mockProgram', 'uInstance');
		expect(getUniformLocation).toHaveBeenCalledWith('mockProgram', 'uScene');
		expect(getUniformLocation).toHaveBeenCalledWith('mockProgram', 'uPerspective');
		expect(getUniformLocation).toHaveBeenCalledWith('mockProgram', 'uColor');
		expect(getAttribLocation).toHaveBeenCalledWith('mockProgram', 'aVertex');
		expect(getAttribLocation).toHaveBeenCalledWith('mockProgram', 'aCoordinate');
	});

	it('should apply default scene options', () => {
		spective();

		expect(matrix).toHaveBeenCalledWith(1, [-0, -0, -0], [1, -0], [0, -0], [2, -0], [-0, -0, -0]);
		expect(uniformMatrix4fv).toHaveBeenCalledWith('uSceneUniformLocation', false, 'mockMatrix');
	});

	it('should set up resize and render', () => {
		spective();

		expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

		expect(resize).toHaveBeenCalledWith({
			gl,
			perspectiveLocation: 'uPerspectiveUniformLocation',
			canvas: expect.anything(),
			state: expect.anything()
		});

		expect(render).toHaveBeenCalledWith({
			gl,
			instanceLocation: 'uInstanceUniformLocation',
			colorLocation: 'uColorUniformLocation',
			vertexLocation: 'aVertexAttributeLocation',
			coordinateLocation: 'aCoordinateAttributeLocation',
			geometries: expect.anything(),
			state: expect.anything()
		});
	});

	it('should create a canvas when none is provided', () => {
		spective();

		expect(createElement).toHaveBeenCalledWith('canvas');
		expect(createElement).toHaveBeenCalledWith('style');
		expect(appendChild).toHaveBeenCalledTimes(2);
	});

	describe('scenes', () => {
		let scene;

		beforeEach(() => {
			clearMocks();
			scene = spective();
		});

		it('should resize scene when empty object provided', () => {
			scene({});

			expect(resize).toHaveBeenCalledWith({
				gl,
				perspectiveLocation: 'uPerspectiveUniformLocation',
				canvas: expect.anything(),
				state: expect.anything()
			});
		});

		it('should update scene', () => {
			scene({
				position: [1, 2, 3],
				rotation: Math.PI / 3,
				tilt: Math.PI / 6,
				offset: [0.1, 0.2, 0.3]
			});

			expect(matrix).toHaveBeenCalledWith(1, [-1, -2, -3], [1, -Math.PI / 3], [0, -Math.PI / 6], [2, -0], [-0.1, -0.2, -0.3]);
			expect(uniformMatrix4fv).toHaveBeenCalledWith('uSceneUniformLocation', false, 'mockMatrix');
		});

		describe('geometries', () => {
			let geometry;

			beforeEach(() => {
				clearMocks();

				geometry = scene([
					0, 1, 2,
					3, 2, 1
				], [
					-1, -1, 0, 1, -1, 0,
					-1, 1, 0, 1, 1, 0
				]);
			});

			it('should create geometry', () => {
				expect(typeof geometry).toBe('function');

				expect(expand).toHaveBeenCalledWith(4, [
					0, 1, 2,
					3, 2, 1
				], [
					-1, -1, 0, 1, -1, 0,
					-1, 1, 0, 1, 1, 0
				]);
			});
			
			describe('assets', () => {
				let asset;

				beforeEach(() => {
					clearMocks();

					asset = geometry('texture.jpg', [
						0, 0, 1, 0,
						0, 1, 1, 1
					]);

					loadImage();
				});

				it('should create asset', () => {
					expect(typeof asset).toBe('function');

					expect(expand).toHaveBeenCalledWith(4, [
						0, 1, 2,
						3, 2, 1
					], [
						0, 0, 1, 0,
						0, 1, 1, 1
					]);
				});

				describe('instances', () => {
					let instance;
		
					beforeEach(() => {
						clearMocks();

						instance = asset({
							position: [1, 2, 3],
							rotation: Math.PI / 3
						});
					});
				
					it('should create instance', () => {
						expect(typeof instance).toBe('function');
						expect(matrix).toHaveBeenCalledWith(1, [0, 0, 0], [1, Math.PI / 3], [0, 0], [2, 0], [1, 2, 3]);
					});
					
					it('should use defaults for missing properties', () => {
						instance = asset({});
						expect(matrix).toHaveBeenCalledWith(1, [0, 0, 0], [1, 0], [0, 0], [2, 0], [0, 0, 0]);
					});
					
					it('should update instance position', () => {
						matrix.mockReturnValueOnce('updatedMatrixPosition');
						instance({ position: [2, 4, 6] });

						expect(matrix).toHaveBeenCalledWith(1, [0, 0, 0], [1, Math.PI / 3], [0, 0], [2, 0], [2, 4, 6]);
					});
					
					it('should update instance rotation', () => {
						matrix.mockReturnValueOnce('updatedMatrixRotation');
						instance({ rotation: Math.PI / 6 });

						expect(matrix).toHaveBeenCalledWith(1, [0, 0, 0], [1, Math.PI / 6], [0, 0], [2, 0], [1, 2, 3]);
					});
				});
			});
		});
	});
});
