import { sampler } from '../sampler';

const createTexture = jest.fn();
const activeTexture = jest.fn();
const bindTexture = jest.fn();
const texImage2D = jest.fn();
const texParameteri = jest.fn();
const uniform1i = jest.fn();
let gl;

describe('sampler', () => {
	beforeEach(() => {
		createTexture.mockClear();
		activeTexture.mockClear();
		bindTexture.mockClear();
		texImage2D.mockClear();
		texParameteri.mockClear();
		uniform1i.mockClear();

		createTexture.mockReturnValue('mockTexture');

		gl = {
			TEXTURE0: 'mockTexture0',
			TEXTURE1: 'mockTexture1',
			TEXTURE_2D: 'mockTexture2d',
			RGBA: 'mockRgba',
			UNSIGNED_BYTE: 'mockUnsignedByte',
			TEXTURE_MAG_FILTER: 'mockTextureMagFilter',
			LINEAR: 'mockLinear',
			TEXTURE_MIN_FILTER: 'mockTextureMinFilter',
			TEXTURE_WRAP_S: 'mockTextureWrapS',
			CLAMP_TO_EDGE: 'mockClampToEdge',
			TEXTURE_WRAP_T: 'mockTextureWrapT',
			createTexture,
			activeTexture,
			bindTexture,
			texImage2D,
			texParameteri,
			uniform1i
		};
	});

	it('should set sampler using new texture', () => {
		sampler(gl, 'mockLocation', 'mockUnit', 'mockImage', undefined);

		expect(createTexture).toHaveBeenCalled();
		expect(bindTexture).toHaveBeenCalledWith('mockTexture2d', 'mockTexture');
	
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 'mockRgba', 'mockUnsignedByte', 'mockImage');
		expect(texParameteri.mock.calls).toEqual([
			['mockTexture2d', 'mockTextureMagFilter', 'mockLinear'],
			['mockTexture2d', 'mockTextureMinFilter', 'mockLinear'],
			['mockTexture2d', 'mockTextureWrapS', 'mockClampToEdge'],
			['mockTexture2d', 'mockTextureWrapT', 'mockClampToEdge']
		]);
	
		expect(uniform1i).toHaveBeenCalledWith('mockLocation', 'mockUnit');
	});
	
	it('should set sampler using existing texture', () => {
		sampler(gl, 'mockLocation', 'mockUnit', 'mockImage', 'existingTexture');

		expect(createTexture).not.toHaveBeenCalled();
		expect(bindTexture).toHaveBeenCalledWith('mockTexture2d', 'existingTexture');
	
		expect(texImage2D).toHaveBeenCalledWith('mockTexture2d', 0, 'mockRgba', 'mockRgba', 'mockUnsignedByte', 'mockImage');
		expect(texParameteri.mock.calls).toEqual([
			['mockTexture2d', 'mockTextureMagFilter', 'mockLinear'],
			['mockTexture2d', 'mockTextureMinFilter', 'mockLinear'],
			['mockTexture2d', 'mockTextureWrapS', 'mockClampToEdge'],
			['mockTexture2d', 'mockTextureWrapT', 'mockClampToEdge']
		]);
	
		expect(uniform1i).toHaveBeenCalledWith('mockLocation', 'mockUnit');
	});
});
