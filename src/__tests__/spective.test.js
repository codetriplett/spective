import { calculateMatrix } from '../calculate-matrix';
import { resizeScene } from '../resize-scene';
import { initializeRender } from '../initialize-render';
import spective from '../spective';

jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));
jest.mock('../resize-scene', () => ({ resizeScene: jest.fn() }));
jest.mock('../initialize-render', () => ({ initializeRender: jest.fn() }));

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

let canvas;
let gl;

function clearMocks () {
	calculateMatrix.mockClear();
	calculateMatrix.mockReturnValue('mockMatrix');

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

	createElement.mockReturnValue({ getContext });
	canvas = document.createElement('canvas');
	createElement.mockClear();

	window.addEventListener = addEventListener;

	appendChild.mockClear();
}

describe('spective', () => {
	beforeEach(clearMocks);

	it('should set up context', () => {
		spective(canvas);

		expect(createElement).not.toHaveBeenCalled();
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

	it('should apply scene properties if they are provided along with canvas', () => {
		spective(canvas, { position: [1, 2, 3] });

		expect(calculateMatrix).toHaveBeenCalledWith(true, { position: [1, 2, 3] });
		expect(uniformMatrix4fv).toHaveBeenCalledWith('uSceneUniformLocation', false, 'mockMatrix');
	});

	it('should create a canvas when none is provided', () => {
		spective();

		expect(createElement).toHaveBeenCalledWith('canvas');
		expect(createElement).toHaveBeenCalledWith('style');
		expect(appendChild).toHaveBeenCalledTimes(2);
	});

	it('should apply scene properties if they are provided without a canvas', () => {
		spective({ position: [1, 2, 3] });

		expect(calculateMatrix).toHaveBeenCalledWith(true, { position: [1, 2, 3] });
		expect(uniformMatrix4fv).toHaveBeenCalledWith('uSceneUniformLocation', false, 'mockMatrix');
	});

	it('should apply default scene properties if none are provided', () => {
		spective();

		expect(calculateMatrix).toHaveBeenCalledWith(true, {}, {});
		expect(uniformMatrix4fv).toHaveBeenCalledWith('uSceneUniformLocation', false, 'mockMatrix');
	});

	it('should set up resize and render', () => {
		spective();

		expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

		expect(resizeScene).toHaveBeenCalledWith({
			gl,
			perspectiveLocation: 'uPerspectiveUniformLocation',
			canvas: expect.anything(),
			state: expect.anything()
		});

		expect(initializeRender).toHaveBeenCalledWith({
			gl,
			instanceLocation: 'uInstanceUniformLocation',
			colorLocation: 'uColorUniformLocation',
			vertexLocation: 'aVertexAttributeLocation',
			coordinateLocation: 'aCoordinateAttributeLocation',
			geometries: expect.anything(),
			state: expect.anything()
		});
	});

	describe('scenes', () => {
		let scene;

		beforeEach(() => {
			clearMocks();
			scene = spective();
		});

		it('should resize scene when empty object provided', () => {
			scene({});

			expect(resizeScene).toHaveBeenCalledWith({
				gl,
				perspectiveLocation: 'uPerspectiveUniformLocation',
				canvas: expect.anything(),
				state: expect.anything()
			});
		});

		it('should update scene', () => {
			scene({
				rotation: Math.PI / 3,
				tilt: Math.PI / 6,
				position: [1, 2, 3]
			});

			expect(calculateMatrix).toHaveBeenCalledWith(true, {
				rotation: 1.0471975511965976,
				tilt: 0.5235987755982988,
				position: [1, 2, 3]
			});

			expect(uniformMatrix4fv).toHaveBeenCalledWith('uSceneUniformLocation', false, 'mockMatrix');
		});
		
		it('should create geometries', () => {
			const actual = scene([0, 1, 2], [0.1, 0.2, 0.3, 1.1, 1.2, 1.3, 2.1, 2.2, 2.3]);
			expect(typeof actual).toBe('function');
		});
	});
});
