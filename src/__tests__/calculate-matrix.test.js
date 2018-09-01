import { calculateMatrix } from '../calculate-matrix';

describe('calculate-matrix', () => {
	let mockAngle;
	let mockCos;
	let mockSin;

	beforeEach(() => {
		mockAngle = Math.PI / 3;
		mockCos = Math.cos(mockAngle);
		mockSin = Math.sin(mockAngle);
	});

	it('should calculate a scale matrix', () => {
		const actual = calculateMatrix({ scale: [0.25, 0.5, 0.75] });
		
		expect(actual).toEqual([
			0.25, 0, 0, 0,
			0, 0.5, 0, 0,
			0, 0, 0.75, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a scale matrix from a single value', () => {
		const actual = calculateMatrix({ scale: 0.5 });
		
		expect(actual).toEqual([
			0.5, 0, 0, 0,
			0, 0.5, 0, 0,
			0, 0, 0.5, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a rotation matrix', () => {
		const actual = calculateMatrix({ rotation: mockAngle });
		
		expect(actual).toEqual([
			mockCos, 0, mockSin, 0,
			0, 1, 0, 0,
			-mockSin, 0, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a tilt matrix', () => {
		const actual = calculateMatrix({ tilt: mockAngle });
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, mockCos, -mockSin, 0,
			0, mockSin, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a spin matrix', () => {
		const actual = calculateMatrix({ spin: mockAngle });
		
		expect(actual).toEqual([
			mockCos, -mockSin, 0, 0,
			mockSin, mockCos, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a translation matrix', () => {
		const actual = calculateMatrix({ position: [1, 2, 3] });
		
		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should calculate a composite matrix', () => {
		const actual = calculateMatrix({
			scale: 0.5,
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
			position: [0, 0, 0]
		}, {
			rotation: Math.PI / 4
		}, {
			position: [1, 0, 0]
		});

		expect(actual).toEqual([
			0.7071067811865476, 0, 0.7071067811865475, 1,
			0, 1, 0, 0,
			-0.7071067811865475, 0, 0.7071067811865476, 0,
			0, 0, 0, 1
		]);
	});
	
	it('should invert property values', () => {
		const actual = calculateMatrix(true, {
			scale: [0.5, 0.5, 0.5],
			position: [1, 2, 3]
		}, {
			rotation: mockAngle,
			tilt: mockAngle,
			spin: mockAngle
		});

		expect(actual).toEqual([
			1.799038105676658, 0.8660254037844388, -0.11602540378443871, -1.59150635094611,
			-0.11602540378443882, 0.5000000000000002, 1.9330127018922192, -3.3415063509461103,
			0.8660254037844388, -1.7320508075688772, 0.5000000000000002, 0.5490381056766573,
			0, 0, 0, 1
		]);
	});

	it('should return an identity matrix if no properties are provided', () => {
		const actual = calculateMatrix();

		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid property objects', () => {
		const actual = calculateMatrix('asdf', { position: [1, 2, 3] }, 0);

		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid properties', () => {
		const actual = calculateMatrix({
			position: [1, 2, 3],
			asdf: 1
		});
		
		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid values', () => {
		const actual = calculateMatrix({
			scale: '0',
			position: '0',
			rotation: '0',
			tilt: '0',
			spin: '0'
		});
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore inverted zero scale', () => {
		const actual = calculateMatrix(true, { scale: [1, 0, 1] });
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid arrays', () => {
		const actual = calculateMatrix({
			scale: ['a', 'b', 'c'],
			position: [0, 1]
		});
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});
});
