import { matrix } from '../matrix';

describe('matrix', () => {
	let mockAngle;
	let mockCos;
	let mockSin;

	beforeEach(() => {
		mockAngle = Math.PI / 3;
		mockCos = Math.cos(mockAngle);
		mockSin = Math.sin(mockAngle);
	});

	it('should return a scale matrix if a scale value is provided', () => {
		const actual = matrix(0.5);
		
		expect(actual).toEqual([
			0.5, 0, 0, 0,
			0, 0.5, 0, 0,
			0, 0, 0.5, 0,
			0, 0, 0, 1
		]);
	});

	it('should return a tilt matrix if a tilt value is provided', () => {
		const actual = matrix([0, mockAngle]);
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, mockCos, -mockSin, 0,
			0, mockSin, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should return a rotation matrix if a rotation value is provided', () => {
		const actual = matrix([1, mockAngle]);
		
		expect(actual).toEqual([
			mockCos, 0, mockSin, 0,
			0, 1, 0, 0,
			-mockSin, 0, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should return a spin matrix if a spin value is provided', () => {
		const actual = matrix([2, mockAngle]);
		
		expect(actual).toEqual([
			mockCos, -mockSin, 0, 0,
			mockSin, mockCos, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should return a translation matrix if a translation array is provided', () => {
		const actual = matrix([1, 2, 3]);
		
		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should return a custom matrix if one is provided', () => {
		const value = [
			1, 2, 3, 4,
			2, 4, 6, 8,
			3, 6, 9, 12,
			4, 8, 12, 16
		];

		const actual = matrix(value);
		expect(actual).toEqual(value);
	});

	it('should return an identity matrix if no values are provided', () => {
		const actual = matrix();

		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should multiply matrices', () => {
		const actual = matrix([
			1.1, 2.1, 3.1, 4.1,
			2.1, 4.1, 6.1, 8.1,
			3.1, 6.1, 9.1, 12.1,
			4.1, 8.1, 12.1, 16.1
		], [
			1.2, 2.2, 3.2, 4.2,
			2.2, 4.2, 6.2, 8.2,
			3.2, 6.2, 9.2, 12.2,
			4.2, 8.2, 12.2, 16.2
		]);

		expect(actual).toEqual([
			33.08, 65.08, 97.08000000000001, 129.07999999999998,
			64.08, 126.07999999999998, 188.07999999999998, 250.08,
			95.08, 187.07999999999998, 279.0799999999999, 371.08000000000004,
			126.07999999999998, 248.07999999999998, 370.08, 492.0799999999999
		]);
	});
});
