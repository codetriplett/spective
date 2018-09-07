import { setSampler } from '../set-sampler';

const createTexture = jest.fn();
const activeTexture = jest.fn();
const bindTexture = jest.fn();
const texImage2D = jest.fn();
const texParameteri = jest.fn();
const generateMipmap = jest.fn();
const uniform1i = jest.fn();
let gl;

describe('set-sampler', () => {
	beforeEach(() => {
		createTexture.mockClear();
		activeTexture.mockClear();
		bindTexture.mockClear();
		texImage2D.mockClear();
		texParameteri.mockClear();
		generateMipmap.mockClear();
		uniform1i.mockClear();

		createTexture.mockReturnValue('mockTexture');

		gl = {
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
			createTexture,
			activeTexture,
			bindTexture,
			texImage2D,
			texParameteri,
			generateMipmap,
			uniform1i
		};
	});

	it('should set sampler using new texture', () => {
		setSampler(gl, 'mockLocation', 'mockUnit', 'mockImage', undefined);

		expect(createTexture).toHaveBeenCalled();
		expect(bindTexture).toHaveBeenCalledWith('mockTexture2d', 'mockTexture');
	
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 'mockRgba', 'mockUnsignedByte', 'mockImage');
		expect(generateMipmap).toHaveBeenCalledWith('mockTexture2d');
		expect(uniform1i).toHaveBeenCalledWith('mockLocation', 'mockUnit');
	});
	
	it('should set sampler using existing texture', () => {
		setSampler(gl, 'mockLocation', 'mockUnit', 'mockImage', 'existingTexture');

		expect(createTexture).not.toHaveBeenCalled();
		expect(bindTexture).toHaveBeenCalledWith('mockTexture2d', 'existingTexture');
	
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 'mockRgba', 'mockUnsignedByte', 'mockImage');
		expect(generateMipmap).toHaveBeenCalledWith('mockTexture2d');
		expect(uniform1i).toHaveBeenCalledWith('mockLocation', 'mockUnit');
	});
	
	it('should set color texture', () => {
		const color = new Uint8Array([1, 2, 3, 255]);
		setSampler(gl, 'mockLocation', 'mockUnit', color, 'existingTexture');

		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 1, 1, 0, 'mockRgba', 'mockUnsignedByte', color);
		
		expect(texParameteri.mock.calls).toEqual([
			['mockTexture2d', 'mockTextureWrapS', 'mockClampToEdge'],
			['mockTexture2d', 'mockTextureWrapT', 'mockClampToEdge'],
			['mockTexture2d', 'mockTextureMinFilter', 'mockLinear']
		]);
	});
	
	it('should set multiple color texture', () => {
		const color = new Uint8Array([1, 2, 3, 255, 10, 20, 30, 255, 50, 150, 250, 255]);
		setSampler(gl, 'mockLocation', 'mockUnit', color, 'existingTexture');
		
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 3, 1, 0, 'mockRgba', 'mockUnsignedByte', color);
	});
});
