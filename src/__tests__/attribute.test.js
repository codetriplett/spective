import { attribute } from '../attribute';

const createBuffer = jest.fn();
const bindBuffer = jest.fn();
const enableVertexAttribArray = jest.fn();
const bufferData = jest.fn();
const vertexAttribPointer = jest.fn();
let gl;

describe('attribute', () => {
	beforeEach(() => {
		createBuffer.mockClear();
		bindBuffer.mockClear();
		enableVertexAttribArray.mockClear();
		bufferData.mockClear();
		vertexAttribPointer.mockClear();

		createBuffer.mockReturnValue('mockBuffer');

		gl = {
			ARRAY_BUFFER: 'mockArrayBuffer',
			STATIC_DRAW: 'mockStaticDraw',
			FLOAT: 'mockFloat',
			createBuffer,
			bindBuffer,
			enableVertexAttribArray,
			bufferData,
			vertexAttribPointer
		};
	});

	it('should set attribute using new buffer', () => {
		attribute(gl, 'mockLocation', 'mockArray', 2, undefined);

		expect(createBuffer).toHaveBeenCalled();
		expect(bindBuffer).toHaveBeenCalledWith('mockArrayBuffer', 'mockBuffer');
		expect(enableVertexAttribArray).toHaveBeenCalledWith('mockLocation');
		expect(bufferData).toHaveBeenCalledWith('mockArrayBuffer', 'mockArray', 'mockStaticDraw');
		expect(vertexAttribPointer).toHaveBeenCalledWith('mockLocation', 2, 'mockFloat', false, 0, 0);
	});

	it('should set attribute using existing buffer', () => {
		attribute(gl, 'mockLocation', 'mockArray', 3, 'existingBuffer');

		expect(createBuffer).not.toHaveBeenCalled();
		expect(bindBuffer).toHaveBeenCalledWith('mockArrayBuffer', 'existingBuffer');
		expect(enableVertexAttribArray).toHaveBeenCalledWith('mockLocation');
		expect(bufferData).toHaveBeenCalledWith('mockArrayBuffer', 'mockArray', 'mockStaticDraw');
		expect(vertexAttribPointer).toHaveBeenCalledWith('mockLocation', 3, 'mockFloat', false, 0, 0);
	});
});
