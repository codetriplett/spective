import { multiplyMatrices } from '../multiply-matrices';

describe('multiply-matrices', () => {
	it('should multiply matrices', () => {
		const actual = multiplyMatrices([
			[
				0, 1, 2, 3,
				4, 5, 6, 7,
				8, 9, 10, 11,
				12, 13, 14, 15
			],
			[
				1, 2, 3, 4,
				2, 4, 6, 8,
				3, 6, 9, 12,
				4, 8, 12, 16
			]
		]);

		expect(actual).toEqual([
			80, 90, 100, 110,
			160, 180, 200, 220,
			240, 270, 300, 330,
			320, 360, 400, 440
		]);
	});

	it('should return first matrix if it is the only one', () => {
		const actual = multiplyMatrices([
			[
				0, 1, 2, 3,
				4, 5, 6, 7,
				8, 9, 10, 11,
				12, 13, 14, 15
			]
		]);

		expect(actual).toEqual([
			0, 1, 2, 3,
			4, 5, 6, 7,
			8, 9, 10, 11,
			12, 13, 14, 15
		]);
	});
});
