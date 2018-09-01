import { calculateMatrix } from '../calculate-matrix';

describe('calculate-matrix', () => {
	let mockAngle;
	let mockCos;
	let mockSin;
	let properties;

	beforeEach(() => {
		mockAngle = Math.PI / 3;
		mockCos = Math.cos(mockAngle);
		mockSin = Math.sin(mockAngle);

		properties = {
			scale: [1, 1, 1],
			rotation: 0,
			tilt: 0,
			spin: 0,
			position: [0, 0, 0]
		};
	});

	it('should calculate a scale matrix', () => {
		const actual = calculateMatrix({
			...properties,
			scale: [0.5, 0.5, 0.5]
		});
		
		expect(actual).toEqual([
			0.5, 0, 0, 0,
			0, 0.5, 0, 0,
			0, 0, 0.5, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a rotation matrix', () => {
		const actual = calculateMatrix({
			...properties,
			rotation: mockAngle
		});
		
		expect(actual).toEqual([
			mockCos, 0, mockSin, 0,
			0, 1, 0, 0,
			-mockSin, 0, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a tilt matrix', () => {
		const actual = calculateMatrix({
			...properties,
			tilt: mockAngle
		});
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, mockCos, -mockSin, 0,
			0, mockSin, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a spin matrix', () => {
		const actual = calculateMatrix({
			...properties,
			spin: mockAngle
		});
		
		expect(actual).toEqual([
			mockCos, -mockSin, 0, 0,
			mockSin, mockCos, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a translation matrix', () => {
		const actual = calculateMatrix({
			...properties,
			position: [1, 2, 3]
		});
		
		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should calculate a composite matrix', () => {
		const actual = calculateMatrix({
			scale: [0.5, 0.5, 0.5],
			rotation: mockAngle,
			tilt: mockAngle,
			spin: mockAngle,
			position: [1, 2, 3]
		});

		expect(actual).toEqual([
			-0.1997595264191644, -0.2165063509461097, 0.4040063509461097, 1,
			0.4040063509461097, 0.12500000000000006, 0.2667468245269451, 2,
			-0.2165063509461097, 0.4330127018922193, 0.12500000000000006, 3,
			0, 0, 0, 1
		]);
	});

	it('should calculate a composite matrix from several property objects', () => {
		const actual = calculateMatrix({
			scale: [0.5, 0.5, 0.5],
			rotation: mockAngle,
			tilt: mockAngle,
			spin: mockAngle,
			position: [1, 2, 3]
		}, {
			scale: [1.5, 1.5, 1.5],
			rotation: mockAngle,
			tilt: mockAngle * 2,
			spin: mockAngle * 3,
			position: [2, 4, 6]
		});

		expect(actual).toEqual([
			0.43106964481437343, -0.40012023679041764, -0.4653845264191646, -2.647114317029974,
			0.3871092304311419, 0.6185696448143735, -0.17325714481437346, 6.323557158514987,
			0.47626190802395574, -0.14062499999999986, 0.5620491120359332, 8.122595264191645,
			0, 0, 0, 1
		]);
	});
});
