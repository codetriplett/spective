import { expandPoints } from '../expand-points';

describe('expand-points', () => {
	let faces;

	beforeEach(() => {
		faces = [
			0, 1, 2,
			3, 2, 1
		];
	});

	it('should expand three dimensional points', () => {
		const actual = expandPoints(3, faces, [
			0.1, 0.2, 0.3, 1.1, 1.2, 1.3,
			2.1, 2.2, 2.3, 3.1, 3.2, 3.3
		]);

		expect(actual).toEqual(new Float32Array([
			0.1, 0.2, 0.3, 1.1, 1.2, 1.3, 2.1, 2.2, 2.3,
			3.1, 3.2, 3.3, 2.1, 2.2, 2.3, 1.1, 1.2, 1.3
		]));
	});
	
	it('should expand two dimensional points', () => {
		const actual = expandPoints(2, faces, [
			0.1, 0.2, 1.1, 1.2,
			2.1, 2.2, 3.1, 3.2
		]);

		expect(actual).toEqual(new Float32Array([
			0.1, 0.2, 1.1, 1.2, 2.1, 2.2,
			3.1, 3.2, 2.1, 2.2, 1.1, 1.2
		]));
	});
	
	it('should not expand already expanded points', () => {
		const actual = expandPoints(3, faces, [
			1, 2, 3, 11, 12, 13, 21, 22, 23,
			31, 32, 33, 21, 22, 23, 11, 12, 13
		]);

		expect(actual).toEqual(new Float32Array([
			1, 2, 3, 11, 12, 13, 21, 22, 23,
			31, 32, 33, 21, 22, 23, 11, 12, 13
		]));
	});
});
