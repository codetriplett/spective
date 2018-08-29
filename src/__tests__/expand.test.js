import { expand } from '../expand';

describe('expand', () => {
	let faces;

	beforeEach(() => {
		faces = [
			0, 1, 2,
			3, 2, 1
		];
	});

	it('should expand three dimensional points', () => {
		const actual = expand(faces, [
			0.1, 0.2, 0.3, 1.1, 1.2, 1.3,
			2.1, 2.2, 2.3, 3.1, 3.2, 3.3
		], 3);

		expect(actual).toEqual(new Float32Array([
			0.1, 0.2, 0.3, 1.1, 1.2, 1.3, 2.1, 2.2, 2.3,
			3.1, 3.2, 3.3, 2.1, 2.2, 2.3, 1.1, 1.2, 1.3
		]));
	});
	
	it('should expand two dimensional points', () => {
		const actual = expand(faces, [
			0.1, 0.2, 1.1, 1.2,
			2.1, 2.2, 3.1, 3.2
		], 3);

		expect(actual).toEqual(new Float32Array([
			0.1, 0.2, 1.1, 1.2, 2.1, 2.2,
			3.1, 3.2, 2.1, 2.2, 1.1, 1.2
		]));
	});
});
