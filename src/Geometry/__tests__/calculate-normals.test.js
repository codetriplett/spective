import { calculateNormals } from '../calculate-normals';

describe('calculate-normals', () => {
	it('should calculate a right angle face', () => {
		const actual = calculateNormals([0, 1, 2], [0, 0, 0, 2, 0, 0, 0, 2, 0]);
		expect(actual).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
	});

	it('should calculate a more unique triangle', () => {
		const actual = calculateNormals([0, 1, 2], [2, 4.5, -1, 2.5, 4.375, 2, 3, 4.75, 1]);
		expect(actual).toEqual([-0.5, 1, 0.125, -0.5, 1, 0.125, -0.5, 1, 0.125]);
	});

	it('should calculate multiple faces', () => {
		const actual = calculateNormals([0, 1, 2, 0, 2, 3, 0, 3, 1], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
		
		expect(actual).toEqual([
			0.9999999999999997, 1, 0.9999999999999997, 0, 1, 1, 1, 0, 1,
			0.9999999999999997, 1, 0.9999999999999997, 1, 0, 1, 1, 1, 0,
			0.9999999999999997, 1, 0.9999999999999997, 1, 1, 0, 0, 1, 1
		]);
	});

	it('should calculate multiple faces with a custom sharpness', () => {
		const actual = calculateNormals([0, 1, 2, 0, 2, 3, 0, 3, 1], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], 1);
		
		expect(actual).toEqual([
			0, 0, 1, 0, 0, 1, 0, 0, 1,
			1, 0, 0, 1, 0, 0, 1, 0, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0
		]);
	});
});
