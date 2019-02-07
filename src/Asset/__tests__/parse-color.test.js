import { parseColor } from '../parse-color';

describe('parse-color', () => {
	it('should create an asset using hexadecimal', () => {
		const actual = parseColor('#5af');
		expect(actual).toEqual(new Uint8Array([85, 170, 255, 255]));
	});
	
	it('should create an asset using a full length hexadecimal', () => {
		const actual = parseColor('#50a0f0');
		expect(actual).toEqual(new Uint8Array([80, 160, 240, 255]));
	});
});
